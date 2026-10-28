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
        } else if (req.url === '/__theme.css') {
          res.setHeader('Content-Type', 'text/css');
          res.end(`:root { --theme-ink: rgb(20, 20, 20); }
            @media (prefers-color-scheme: dark) {
              :root:not([data-theme="light"]) { --theme-ink: rgb(240, 240, 240); }
            }
            :root[data-theme="dark"] { --theme-ink: rgb(240, 240, 240); }
            #probe { color: var(--theme-ink); }`);
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
    const run = async (head, body = '', htmlAttributes = '') => {
      const html = `<!doctype html><html ${htmlAttributes}><head>${head}</head><body><p id="probe">Stylesheet probe</p>${body}</body></html>`;
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
    const themeStyles = `<link rel="stylesheet" href="${origin}/__theme.css">`;
    await page.emulateMedia({ colorScheme: 'dark' });
    await run(themeStyles, script, 'data-theme="light" lang="fr" dir="rtl"');
    await expectStyle('rgb(20, 20, 20)', false);
    assert.equal(await probeFrame().locator('html').getAttribute('data-theme'), 'light');
    assert.equal(await probeFrame().locator('html').getAttribute('lang'), 'fr');
    assert.equal(await probeFrame().locator('html').getAttribute('dir'), 'rtl');
    await run(themeStyles, script, 'data-theme="dark"');
    await expectStyle('rgb(240, 240, 240)', false);
    assert.equal(await probeFrame().locator('html').getAttribute('dir'), null);
    await run(themeStyles, script);
    await expectStyle('rgb(240, 240, 240)', false);
    assert.equal(await probeFrame().locator('html').getAttribute('data-theme'), null);
    await page.emulateMedia({ colorScheme: 'light' });
    await expectStyle('rgb(20, 20, 20)', false);
    assert.ok(!requests.some(url => new URL(url).pathname === '/style.css'), `${mode}: local CSS fetched from network`);
    assert.deepEqual(errors, [], `${mode}: browser errors`);
    console.log(`${mode}: external CSS loaded; cascade, HTML theme attributes, and rerun cleanup passed`);
    await page.close();
  }

  // Issue #26: a centered full-height page body must still scroll from the
  // first line, and the page must stay isolated from the kernel.
  for (const mode of ['html-js', 'html-js-fetch', 'html-css-js', 'html-js-css-media']) {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    console.log(`${mode}: checking page scrolling and isolation`);
    await page.goto(`${origin}/__stylesheet-check`);
    await page.evaluate(async ({ html, sandbox }) => {
      window.__kernelMessages = [];
      window.addEventListener('message', event => window.__kernelMessages.push(event.data));
      const frame = document.createElement('iframe');
      frame.setAttribute('sandbox', sandbox);
      frame.style.cssText = 'width: 436px; height: 431px; border: 0';
      frame.srcdoc = html;
      const loaded = new Promise(resolve => frame.addEventListener('load', resolve, { once: true }));
      document.body.appendChild(frame);
      await loaded;
    }, { html: getSandboxHtml(mode), sandbox: SANDBOX_ATTRIBUTES });

    const cssTab = mode.includes('css');
    const centered = 'body { min-height: 100vh; display: grid; place-items: center; padding: 24px; }';
    const lines = Array.from({ length: 40 }, (_, i) => `<p>Line ${i + 1}</p>`).join('');
    const html = `<!doctype html><html><head>${cssTab ? '<link rel="stylesheet" href="style.css">' : `<style>${centered}</style>`}</head>`
      + `<body><main><h1 id="top">Focus Sprint Planner</h1>${lines}<p id="last">Last line</p></main><script src="script.js"></script></body></html>`;
    const js = mode === 'html-js-fetch'
      ? `const data = await (await fetch('/api/ping')).json();
         root.dataset.api = String(data.ok);
         try { const x = new XMLHttpRequest(); x.open('GET', '/__fixture.css', false); x.send(); root.dataset.xhr = 'allowed'; }
         catch (e) { root.dataset.xhr = 'blocked'; }
         console.log('ran', root.tagName);`
      : `root.dataset.ran = 'yes'; console.log('ran', root.tagName); Promise.reject(new Error('rejected on purpose'));`;
    const code = JSON.stringify({ __csFiles__: 1, files: { 'index.html': html, 'style.css': centered, 'script.js': js } });
    await page.evaluate(({ code, mockApi }) => new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Sandbox execution timed out')), 10000);
      const frame = document.querySelector('iframe');
      window.addEventListener('message', event => {
        if (event.data?.type === 'EXECUTION_COMPLETE' && event.data.payload?.executionId === 1) { clearTimeout(timeout); resolve(); }
      });
      frame.contentWindow.postMessage({ type: 'EXECUTE', code, executionId: 1, payload: { mockApi } }, '*');
    }), { code, mockApi: { defaultDelayMs: 0, routes: [{ path: '/api/ping', delayMs: 0, body: { ok: true } }] } });

    const kernel = page.mainFrame().childFrames()[0];
    const inner = kernel.childFrames()[0];
    assert.ok(inner, `${mode}: page frame missing`);
    await inner.waitForFunction(() => document.body.dataset.ran === 'yes' || document.body.dataset.api === 'true');
    const layout = await inner.evaluate(() => {
      const scroller = document.scrollingElement;
      const firstTop = document.getElementById('top').getBoundingClientRect().top + scroller.scrollTop;
      const canScroll = scroller.scrollHeight > scroller.clientHeight;
      scroller.scrollTop = scroller.scrollHeight;
      const lastBottom = document.getElementById('last').getBoundingClientRect().bottom;
      let parentBlocked = false;
      try { void window.parent.document.body; } catch (e) { parentBlocked = true; }
      return { firstTop, canScroll, lastBottom, viewport: innerHeight, scrolled: scroller.scrollTop, parentBlocked,
        xhr: document.body.dataset.xhr ?? null, displayed: getComputedStyle(document.body).display };
    });
    assert.equal(layout.displayed, 'grid', `${mode}: page body rule should apply inside the page`);
    assert.ok(layout.firstTop >= 0, `${mode}: first line clipped above the top (${layout.firstTop})`);
    assert.ok(layout.canScroll && layout.scrolled > 0, `${mode}: page does not scroll`);
    assert.ok(layout.lastBottom <= layout.viewport + 1, `${mode}: last line unreachable`);
    assert.ok(layout.parentBlocked, `${mode}: page can reach the kernel document`);
    if (mode === 'html-js-fetch') assert.equal(layout.xhr, 'blocked', `${mode}: real network reachable from page`);

    const kernelState = await kernel.evaluate(() => {
      const frame = document.querySelector('iframe.cs-html-frame');
      return { sandbox: frame.getAttribute('sandbox'), contentDocument: frame.contentDocument === null,
        kernelDisplay: getComputedStyle(document.body).display };
    });
    assert.equal(kernelState.sandbox, SANDBOX_ATTRIBUTES);
    assert.ok(kernelState.contentDocument, `${mode}: kernel can reach into the page document`);
    assert.equal(kernelState.kernelDisplay, 'flex', `${mode}: page CSS leaked into the kernel`);

    const messages = await page.evaluate(() => window.__kernelMessages.filter(m => m?.type === 'CONSOLE_LOG' || m?.type === 'RUNTIME_ERROR'));
    assert.ok(messages.some(m => m.type === 'CONSOLE_LOG' && m.payload === 'ran BODY'), `${mode}: console.log not relayed`);
    if (mode !== 'html-js-fetch') {
      await assertEventually(async () => {
        const all = await page.evaluate(() => window.__kernelMessages);
        assert.ok(all.some(m => m?.type === 'RUNTIME_ERROR' && m.payload === 'Error: rejected on purpose'), `${mode}: rejection not relayed`);
      });
    }
    assert.deepEqual(errors.filter(message => message !== 'rejected on purpose'), [], `${mode}: browser errors`);
    console.log(`${mode}: centered page scrolls from its first line; page isolated from kernel`);
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
