// Real-browser check for the python mode. Needs network access to
// cdn.jsdelivr.net, so it is run by hand (npm run test:python), not in CI.
import assert from 'node:assert/strict';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';
import { chromium } from 'playwright';

const cacheDir = await mkdtemp(join(tmpdir(), 'code-shoebox-python-'));
const server = await createServer({
  configFile: false,
  plugins: [{
    name: 'python-host-page',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/__python-check') {
          res.setHeader('Content-Type', 'text/html');
          res.end('<!doctype html><html><body></body></html>');
        } else next();
      });
    },
  }],
  root: fileURLToPath(new URL('../', import.meta.url)),
  cacheDir,
  logLevel: 'error',
  server: { host: '127.0.0.1', port: 0 },
});

const results = [];
const scenario = async (name, fn) => {
  const started = Date.now();
  await fn();
  const ms = Date.now() - started;
  results.push([name, ms]);
  console.log(`  ✓ ${name} (${ms} ms)`);
};

let browser;
try {
  await server.listen();
  const origin = `http://127.0.0.1:${server.httpServer.address().port}`;
  const { getSandboxHtml, SANDBOX_ATTRIBUTES } = await server.ssrLoadModule('/runtime/runner.ts');
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await page.goto(`${origin}/__python-check`);

  // Host side of the kernel contract, as OutputFrame implements it.
  await page.evaluate(async ({ html, sandbox }) => {
    window.__messages = [];
    const frame = document.createElement('iframe');
    frame.setAttribute('sandbox', sandbox);
    frame.srcdoc = html;
    const loaded = new Promise((resolve) => frame.addEventListener('load', resolve, { once: true }));
    document.body.appendChild(frame);
    await loaded;
    const channel = new MessageChannel();
    channel.port1.onmessage = (event) => window.__messages.push({ ...event.data, at: performance.now() });
    frame.contentWindow.postMessage({ type: 'INIT_PORT' }, '*', [channel.port2]);
    window.__frame = frame;
  }, { html: getSandboxHtml('python'), sandbox: SANDBOX_ATTRIBUTES });

  const statuses = () => page.evaluate(() => window.__messages.filter((m) => m.type === 'RUNTIME_STATUS').map((m) => m.payload));
  const waitForReady = async (afterIndex = 0, timeout = 60000) => {
    const handle = await page.waitForFunction((after) => {
      const list = window.__messages.slice(after).filter((m) => m.type === 'RUNTIME_STATUS');
      const last = list[list.length - 1];
      return last && (last.payload.state === 'ready' || last.payload.state === 'failed') ? last.payload : false;
    }, afterIndex, { timeout, polling: 50 });
    const status = await handle.jsonValue();
    assert.equal(status.state, 'ready', `runtime failed: ${status.message} ${status.detail ?? ''}`);
    return status;
  };
  const messageCount = () => page.evaluate(() => window.__messages.length);
  let executionId = 0;
  const run = async (code, { stdin = '', stopAfterMs, timeout = 20000 } = {}) => {
    const id = ++executionId;
    return page.evaluate(({ code, stdin, id, stopAfterMs, timeout }) => new Promise((resolve, reject) => {
      const start = window.__messages.length;
      const timer = setTimeout(() => reject(new Error(`run ${id} timed out`)), timeout);
      const check = setInterval(() => {
        const done = window.__messages.slice(start).find((m) => m.type === 'EXECUTION_COMPLETE' && m.payload.executionId === id);
        if (!done) return;
        clearInterval(check);
        clearTimeout(timer);
        const logs = window.__messages.slice(start).filter((m) => ['CONSOLE_LOG', 'CONSOLE_WARN', 'RUNTIME_ERROR'].includes(m.type));
        resolve({ logs: logs.map((m) => [m.type, m.payload]), endIndex: window.__messages.length });
      }, 20);
      window.__frame.contentWindow.postMessage({ type: 'EXECUTE', code, payload: { stdin }, executionId: id }, '*');
      if (stopAfterMs !== undefined) setTimeout(() => window.__frame.contentWindow.postMessage({ type: 'STOP' }, '*'), stopAfterMs);
    }), { code, stdin, id, stopAfterMs, timeout });
  };
  const texts = (logs, type) => logs.filter(([t]) => !type || t === type).map(([, text]) => text);
  // Milliseconds from a console warning (e.g. "Program stopped.") to the next ready status.
  const restartTime = async (warning) => {
    await waitForReady(await page.evaluate((w) => window.__messages.findIndex((m) => m.payload === w), warning));
    return page.evaluate((w) => {
      const stopIndex = window.__messages.findLastIndex((m) => m.type === 'CONSOLE_WARN' && m.payload === w);
      const ready = window.__messages.slice(stopIndex).find((m) => m.type === 'RUNTIME_STATUS' && m.payload.state === 'ready');
      return ready.at - window.__messages[stopIndex].at;
    }, warning);
  };

  console.log('python: checking sandbox runtime');

  await scenario('boots, reports status after the port connects, and runs print', async () => {
    const ready = await waitForReady();
    assert.equal(ready.detail, undefined, `snapshot problem: ${ready.detail}`);
    assert.equal((await statuses())[0].state, 'loading');
    const { logs } = await run('import sys\nprint("hello", sys.version_info[:2])');
    assert.deepEqual(texts(logs), ['hello (3, 14)']);
  });

  await scenario('gives each run a fresh namespace', async () => {
    await run('leftover = 41');
    const { logs } = await run('print(leftover)');
    const errors = texts(logs, 'RUNTIME_ERROR').join('\n');
    assert.match(errors, /NameError: name 'leftover' is not defined/);
  });

  await scenario('answers input() from Program input lines and echoes them', async () => {
    const { logs } = await run(
      'name = input("Name? ")\nblank = input("Blank? ")\nprint(f"hi {name}, blank={blank!r}")\ninput("More? ")',
      { stdin: 'Grace\n\n' },
    );
    assert.deepEqual(texts(logs, 'CONSOLE_LOG'), ['Name? Grace', 'Blank? ', "hi Grace, blank=''"]);
    const error = texts(logs, 'RUNTIME_ERROR').join('\n');
    assert.match(error, /EOFError: input\(\) ran out of lines\. Add more to the Program input box\./);
    assert.match(error, /File "main\.py", line 4/);
  });

  await scenario('trims tracebacks to the learner file', async () => {
    const runtime = texts((await run('def f():\n    return 1 / 0\n\nf()')).logs, 'RUNTIME_ERROR').join('\n');
    assert.match(runtime, /File "main\.py", line 4, in <module>/);
    assert.match(runtime, /File "main\.py", line 2, in f/);
    assert.match(runtime, /return 1 \/ 0/);
    assert.match(runtime, /ZeroDivisionError: division by zero/);
    assert.doesNotMatch(runtime, /_pyodide|python314\.zip|<exec>/);
    const syntax = texts((await run('print("x"\n')).logs, 'RUNTIME_ERROR').join('\n');
    assert.match(syntax, /File "main\.py", line 1/);
    assert.match(syntax, /SyntaxError/);
    assert.doesNotMatch(syntax, /_pyodide|Traceback/);
  });

  await scenario('sends stderr as errors and treats SystemExit as a normal finish', async () => {
    const { logs } = await run('import sys\nprint("to stderr", file=sys.stderr)\nprint("before")\nsys.exit(0)\nprint("after")');
    assert.deepEqual(texts(logs, 'RUNTIME_ERROR'), ['to stderr']);
    assert.deepEqual(texts(logs, 'CONSOLE_LOG'), ['before']);
  });

  await scenario('blocks network and JavaScript access from learner code', async () => {
    const { logs } = await run([
      'import js',
      'print("js.fetch:", hasattr(js, "fetch"), "XMLHttpRequest:", hasattr(js, "XMLHttpRequest"))',
      'try:',
      '    import pyodide.http',
      '    pyodide.http.open_url("https://example.com")',
      '    print("open_url SUCCEEDED")',
      'except Exception as e:',
      '    print("open_url blocked:", type(e).__name__)',
    ].join('\n'));
    const out = texts(logs).join('\n');
    assert.match(out, /js\.fetch: False XMLHttpRequest: False/);
    assert.doesNotMatch(out, /SUCCEEDED/);
  });

  let stopRestartMs;
  await scenario('STOP ends an infinite loop and restores quickly from the snapshot', async () => {
    const { logs } = await run('print("looping")\nwhile True:\n    pass', { stopAfterMs: 700 });
    assert.ok(texts(logs, 'CONSOLE_WARN').includes('Program stopped.'));
    // Output printed before a long loop must arrive before the program ends.
    assert.deepEqual(texts(logs, 'CONSOLE_LOG'), ['looping']);
    stopRestartMs = await restartTime('Program stopped.');
    assert.ok(stopRestartMs < 2000, `restart took ${Math.round(stopRestartMs)} ms`);
    const after = await run('print("after stop")');
    assert.deepEqual(texts(after.logs), ['after stop']);
  });

  await scenario('stops a run that exceeds the 10 second limit', async () => {
    const started = Date.now();
    const { logs, endIndex } = await run('while True:\n    pass', { timeout: 20000 });
    const elapsed = Date.now() - started;
    assert.ok(elapsed >= 9500 && elapsed < 13000, `stopped after ${elapsed} ms`);
    assert.ok(texts(logs, 'CONSOLE_WARN').some((t) => t.startsWith('Stopped after 10 seconds')));
    await waitForReady(endIndex);
  });

  await scenario('stops a program that floods the console', async () => {
    const { logs, endIndex } = await run('i = 0\nwhile True:\n    print(i)\n    i += 1');
    assert.ok(texts(logs, 'CONSOLE_WARN').some((t) => t.startsWith('Output limit reached')));
    assert.ok(texts(logs, 'CONSOLE_LOG').length <= 5000);
    assert.equal(await page.evaluate(() => 1 + 1), 2);
    await waitForReady(endIndex);
  });

  await scenario('falls back to a full boot when the snapshot cannot be restored', async () => {
    // Corrupt the copy the recipe sends to the next worker.
    const frame = page.frames().find((f) => f !== page.mainFrame());
    await frame.evaluate(() => {
      const slice = Uint8Array.prototype.slice;
      Uint8Array.prototype.slice = function (...args) {
        const copy = slice.apply(this, args);
        if (copy.length > 1000000) copy.fill(7, 0, copy.length);
        return copy;
      };
    });
    const { endIndex } = await run('while True:\n    pass', { stopAfterMs: 300 });
    await waitForReady(endIndex, 60000);
    const { logs } = await run('print("fallback ok")');
    assert.deepEqual(texts(logs), ['fallback ok']);
  });

  assert.deepEqual(pageErrors, []);
  console.log(`python: ${results.length} scenarios passed; restart after STOP took ${Math.round(stopRestartMs)} ms`);
} finally {
  await browser?.close();
  await server.close();
}
