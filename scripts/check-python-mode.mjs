// Real-browser check for the python mode, run in several browser engines.
//
//   npm run test:python                          # chromium, firefox, webkit
//   npm run test:python -- --browsers=firefox    # one or more, comma-separated
//   PYTHON_TEST_BROWSERS=msedge npm run test:python
//
// Browsers: chromium, firefox, webkit (Playwright builds; install with
// `npx playwright install <name>`), plus msedge and chrome (installed branded
// browsers, launched through Playwright's channels).
//
// Pyodide is served from node_modules/pyodide by intercepting the pinned
// jsDelivr URLs, so the check needs almost no network. Exception: Playwright's
// Firefox does not intercept ES module imports made inside a worker, so there
// pyodide.mjs and pyodide.asm.mjs (~270 KB) still come from jsDelivr; the WASM
// and standard library are always served locally. PYODIDE_SOURCE=cdn uses the
// real CDN for everything.
import assert from 'node:assert/strict';
import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';
import { chromium, firefox, webkit } from 'playwright';

const LAUNCHERS = {
  chromium: () => chromium.launch({ headless: true }),
  firefox: () => firefox.launch({ headless: true }),
  webkit: () => webkit.launch({ headless: true }),
  msedge: () => chromium.launch({ headless: true, channel: 'msedge' }),
  chrome: () => chromium.launch({ headless: true, channel: 'chrome' }),
};
const browsersArg = process.argv.find((arg) => arg.startsWith('--browsers='))?.split('=')[1];
const browserNames = (browsersArg || process.env.PYTHON_TEST_BROWSERS || 'chromium,firefox,webkit')
  .split(',').map((name) => name.trim()).filter(Boolean);
for (const name of browserNames) {
  if (!LAUNCHERS[name]) throw new Error(`Unknown browser "${name}". Use: ${Object.keys(LAUNCHERS).join(', ')}`);
}
const pyodideSource = process.env.PYODIDE_SOURCE === 'cdn' ? 'cdn' : 'local';

const root = fileURLToPath(new URL('../', import.meta.url));
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
  root,
  cacheDir,
  logLevel: 'error',
  server: { host: '127.0.0.1', port: 0 },
});

const CONTENT_TYPES = {
  '.mjs': 'text/javascript',
  '.js': 'text/javascript',
  '.wasm': 'application/wasm',
  '.json': 'application/json',
  '.zip': 'application/zip',
};

// Serves the pinned Pyodide files from node_modules at their CDN URLs.
const servePyodideLocally = async (context, indexUrl, version) => {
  const pkgDir = join(root, 'node_modules', 'pyodide');
  const pkg = JSON.parse(await readFile(join(pkgDir, 'package.json'), 'utf8'));
  assert.equal(pkg.version, version, `node_modules/pyodide is ${pkg.version}; the recipe pins ${version}`);
  const served = [];
  served.started = Date.now();
  served.log = [];
  await context.route(`${indexUrl}**`, async (route) => {
    const name = new URL(route.request().url()).pathname.split('/').pop();
    const headers = { 'access-control-allow-origin': '*', 'content-type': CONTENT_TYPES[extname(name)] || 'application/octet-stream' };
    try {
      const body = await readFile(join(pkgDir, name));
      served.push(name);
      served.log.push(`${Date.now() - served.started}ms ${name}`);
      await route.fulfill({ status: 200, headers, body });
    } catch {
      await route.fulfill({ status: 404, headers, body: `not in node_modules/pyodide: ${name}` });
    }
  });
  return served;
};

const runScenarios = async (page, { served, log, browserName, group }) => {
  const sandboxFrame = () => page.frames().find((f) => f !== page.mainFrame() && !f.isDetached());
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

  const timings = {};
  // Scenarios run in groups; each group gets a fresh browser context.
  const scenario = async (name, fn, scenarioGroup = 'main') => {
    if (scenarioGroup !== group) return;
    const started = Date.now();
    await fn();
    log(`  ✓ ${name} (${Date.now() - started} ms)`);
  };

  await scenario('boots, reports status after the port connects, and runs print', async () => {
    const started = Date.now();
    const ready = await waitForReady();
    timings.bootMs = Date.now() - started;
    assert.equal(ready.detail, undefined, `snapshot problem: ${ready.detail}`);
    assert.equal((await statuses())[0].state, 'loading');
    if (served) {
      // Proves this engine routed the worker's requests to the local files.
      // Firefox's Playwright build can't intercept module imports in workers.
      const required = ['pyodide.asm.wasm', 'python_stdlib.zip'];
      if (browserName !== 'firefox') required.push('pyodide.mjs');
      for (const file of required) {
        assert.ok(served.includes(file), `${file} was not served locally (served: ${served.join(', ') || 'nothing'})`);
      }
    }
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

  await scenario('STOP ends an infinite loop and restores quickly from the snapshot', async () => {
    const { logs } = await run('print("looping")\nwhile True:\n    pass', { stopAfterMs: 700 });
    assert.ok(texts(logs, 'CONSOLE_WARN').includes('Program stopped.'));
    // Output printed before a long loop must arrive before the program ends.
    assert.deepEqual(texts(logs, 'CONSOLE_LOG'), ['looping']);
    timings.restartMs = Math.round(await restartTime('Program stopped.'));
    // The snapshot restore must stay fast, and clearly faster than a full boot.
    assert.ok(timings.restartMs < 3000, `restart took ${timings.restartMs} ms`);
    assert.ok(timings.restartMs < timings.bootMs, `restart (${timings.restartMs} ms) was not faster than boot (${timings.bootMs} ms)`);
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
    await waitForReady();
    // Corrupt the copy the recipe sends to the next worker.
    await sandboxFrame().evaluate(() => {
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
  }, 'snapshot-error');

  await scenario('falls back to a full boot when a snapshot restore hangs', async () => {
    await waitForReady();
    // Swallow the next snapshot boot message so that restore never finishes.
    await sandboxFrame().evaluate(() => {
      const post = Worker.prototype.postMessage;
      let swallowed = false;
      Worker.prototype.postMessage = function (data, ...rest) {
        if (!swallowed && data && data.type === 'boot' && data.snapshot) { swallowed = true; return; }
        return post.call(this, data, ...rest);
      };
    });
    const started = Date.now();
    const { endIndex } = await run('while True:\n    pass', { stopAfterMs: 300 });
    await waitForReady(endIndex, 60000);
    const elapsed = Date.now() - started;
    assert.ok(elapsed >= 9500, `fell back after only ${elapsed} ms; expected the 10 s restore limit`);
    const { logs } = await run('print("restore hang recovered")');
    assert.deepEqual(texts(logs), ['restore hang recovered']);
  }, 'snapshot-hang');

  return timings;
};

const summary = [];
try {
  await server.listen();
  const origin = `http://127.0.0.1:${server.httpServer.address().port}`;
  const { getSandboxHtml, SANDBOX_ATTRIBUTES } = await server.ssrLoadModule('/runtime/runner.ts');
  const { PYODIDE_INDEX_URL, PYODIDE_VERSION } = await server.ssrLoadModule('/runtime/templates/python.ts');

  for (const name of browserNames) {
    const lines = [];
    const log = (line) => { lines.push(line); console.log(line); };
    let browser;
    const diagnostics = {};
    let reported = false;
    const reportDiagnostics = async (error) => {
      if (reported) return;
      reported = true;
      log(`  ✗ ${name}: ${error.message.split('\n')[0]}`);
      // Which Pyodide files each boot fetched, and the status history.
      if (diagnostics.served) log(`    pyodide requests: ${diagnostics.served.log.join(' | ')}`);
      if (diagnostics.page) {
        const history = await diagnostics.page.evaluate(() => (window.__messages || [])
          .filter((m) => m.type === 'RUNTIME_STATUS' || m.type === 'CONSOLE_WARN')
          .map((m) => `${Math.round(m.at)}ms ${m.type === 'RUNTIME_STATUS' ? m.payload.state + (m.payload.detail ? ' (' + m.payload.detail + ')' : '') : m.payload}`)).catch(() => []);
        log(`    status history: ${history.join(' | ')}`);
      }
    };
    try {
      browser = await LAUNCHERS[name]();
      log(`python [${name} ${browser.version()}, pyodide from ${pyodideSource}]`);
      // WebKit gets slower with every Pyodide worker a page creates (measured:
      // restarts ~1.2 s → ~2.9 s over 12 STOPs; a fresh iframe does not reset
      // it, a fresh page does). Each group therefore gets its own context, so
      // the recovery scenarios don't inherit the main group's workers.
      let timings;
      for (const group of ['main', 'snapshot-error', 'snapshot-hang']) {
        const context = await browser.newContext();
        try {
          const served = pyodideSource === 'local' ? await servePyodideLocally(context, PYODIDE_INDEX_URL, PYODIDE_VERSION) : null;
          const page = await context.newPage();
          diagnostics.page = page;
          diagnostics.served = served;
          page.on('console', (message) => { if (message.type() === 'error') log(`    [${name} console] ${message.text().slice(0, 300)}`); });
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

          const groupTimings = await runScenarios(page, { served, log, browserName: name, group });
          if (group === 'main') timings = groupTimings;
          assert.deepEqual(pageErrors, []);
        } catch (error) {
          // Collect diagnostics before the context closes.
          await reportDiagnostics(error);
          throw error;
        } finally {
          await context.close();
        }
      }
      summary.push({ name, version: browser.version(), ok: true, ...timings });
    } catch (error) {
      await reportDiagnostics(error);
      summary.push({ name, version: browser?.version?.() ?? '-', ok: false, error: error.message.split('\n')[0] });
    } finally {
      await browser?.close();
    }
  }
} finally {
  await server.close();
}

console.log('\npython browser summary');
for (const row of summary) {
  console.log(row.ok
    ? `  PASS ${row.name} ${row.version}: boot ${row.bootMs} ms, restart after STOP ${row.restartMs} ms`
    : `  FAIL ${row.name} ${row.version}: ${row.error}`);
}
if (summary.some((row) => !row.ok)) process.exit(1);
