import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';
import { chromium } from 'playwright';

const cacheDir = await mkdtemp(join(tmpdir(), 'code-shoebox-stylesheets-'));
const server = await createServer({
  configFile: false,
  plugins: [{
    name: 'stylesheet-fixtures',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/__stylesheet-check') {
          res.setHeader('Content-Type', 'text/html');
          res.end('<!doctype html><html><body></body></html>');
        } else if (req.url === '/__fixture.css') {
          res.setHeader('Content-Type', 'text/css');
          res.end('* { margin: 0; padding: 0; box-sizing: border-box; } #probe { color: rgb(120, 30, 40); --external-loaded: yes; }');
        } else next();
      });
    },
  }],
  root: fileURLToPath(new URL('../', import.meta.url)),
  cacheDir,
  logLevel: 'error',
  server: { host: '127.0.0.1', port: 0 },
});

let browser;
try {
  console.log('Starting local stylesheet fixture server');
  await server.listen();
  const origin = `http://127.0.0.1:${server.httpServer.address().port}`;
  const { getSandboxHtml, SANDBOX_ATTRIBUTES } = await server.ssrLoadModule('/runtime/runner.ts');
  console.log('Launching Chromium');
  browser = await chromium.launch({ headless: true });
  for (const mode of ['html', 'html-css', 'html-css-js', 'html-js-css-media']) {
    const page = await browser.newPage();
    const errors = [];
    const requests = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    page.on('request', request => requests.push(request.url()));
    console.log(`${mode}: checking generated sandbox`);
    await page.goto(`${origin}/__stylesheet-check`);
    await page.evaluate(async ({ html, sandbox }) => {
      const frame = document.createElement('iframe');
      frame.setAttribute('sandbox', sandbox);
      frame.style.cssText = 'width: 600px; height: 400px';
      frame.srcdoc = html;
      const loaded = new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Sandbox load timed out')), 10000);
        frame.addEventListener('load', () => { clearTimeout(timeout); resolve(); }, { once: true });
      });
      document.body.appendChild(frame);
      await loaded;
    }, { html: getSandboxHtml(mode), sandbox: SANDBOX_ATTRIBUTES });

    let executionId = 0;
    const run = async (head, body = '') => {
      const html = `<!doctype html><html><head>${head}</head><body><p id="probe">Stylesheet probe</p>${body}</body></html>`;
      const code = mode === 'html' ? html : JSON.stringify({ __csFiles__: 1, files: {
        'index.html': html, 'style.css': '#probe { color: rgb(10, 90, 20); }',
        'script.js': 'root.querySelector("#probe").dataset.ran = "yes";',
      } });
      await page.evaluate(({ code, executionId }) => new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Sandbox execution timed out')), 10000);
        const frame = document.querySelector('iframe');
        const listener = event => {
          if (event.source === frame.contentWindow && event.data.type === 'EXECUTION_COMPLETE' && event.data.payload.executionId === executionId) {
            clearTimeout(timeout);
            window.removeEventListener('message', listener);
            resolve();
          }
        };
        window.addEventListener('message', listener);
        frame.contentWindow.postMessage({ type: 'EXECUTE', code, executionId }, '*');
      }), { code, executionId: ++executionId });
    };
    const probeFrame = () => page.frames().find(frame => frame !== page.mainFrame() && frame.childFrames().length === 0);
    const expectStyle = async (color, external) => {
      await page.waitForFunction(() => document.querySelector('iframe'));
      // The script-free modes render into a nested srcdoc, which loads after EXECUTION_COMPLETE.
      await assertEventually(async () => {
        const frame = probeFrame();
        assert.ok(frame);
        const result = await frame.locator('#probe').evaluate(element => ({
          color: getComputedStyle(element).color,
          external: getComputedStyle(element).getPropertyValue('--external-loaded').trim(),
          height: element.getBoundingClientRect().height,
        }), undefined, { timeout: 1000 });
        assert.equal(result.color, color);
        assert.equal(result.external, external ? 'yes' : '');
        assert.ok(result.height > 0, 'reset CSS must leave output visible');
      });
    };
    const external = `<link rel="stylesheet" href="${origin}/__fixture.css">`;
    const local = '<link rel="stylesheet" href="style.css">';
    const inline = '<style>#probe { color: rgb(10, 90, 20); }</style>';
    const script = mode.includes('js') ? '<script src="script.js"></script>' : '';
    await run(external, script);
    await expectStyle('rgb(120, 30, 40)', true);
    assert.ok(requests.includes(`${origin}/__fixture.css`), `${mode}: CSS request missing`);
    if (mode.includes('js')) {
      assert.equal(await probeFrame().locator('#probe').getAttribute('data-ran'), 'yes');
    }
    await run(external + (mode === 'html' ? inline : local), script);
    await expectStyle('rgb(10, 90, 20)', true);
    await run((mode === 'html' ? inline : local) + external, script);
    await expectStyle('rgb(120, 30, 40)', true);
    await run(inline, external + script);
    await expectStyle('rgb(120, 30, 40)', true);
    await run(inline, script);
    await expectStyle('rgb(10, 90, 20)', false);
    assert.ok(!requests.some(url => new URL(url).pathname === '/style.css'), `${mode}: local CSS fetched from network`);
    assert.deepEqual(errors, [], `${mode}: browser errors`);
    console.log(`${mode}: external CSS loaded; head/body cascade and rerun cleanup passed`);
    await page.close();
  }
} finally {
  await browser?.close();
  await server.close();
  await rm(cacheDir, { recursive: true, force: true });
}

async function assertEventually(check) {
  const deadline = Date.now() + 5000;
  while (true) {
    try { await check(); return; } catch (error) {
      if (Date.now() >= deadline) throw error;
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }
}
