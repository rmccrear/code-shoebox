/**
 * Python mode: Pyodide runs in a Web Worker owned by the sandbox iframe.
 *
 * - The worker is a module worker created from a data: URL. Blob URLs and
 *   classic workers do not work from the opaque-origin sandbox.
 * - The first boot takes a memory snapshot after the setup code runs. Stop,
 *   time limits, and crashes restore a new worker from that snapshot.
 * - Learner code and stdin only travel in messages, never in srcDoc.
 */

// Pinned like every other CDN dependency (see runner.ts). The snapshot APIs
// used below are experimental, so re-test them on every bump.
export const PYODIDE_VERSION = '314.0.8';
export const PYODIDE_INDEX_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;
export const PYTHON_CONTENT_SECURITY_POLICY = 'connect-src https://cdn.jsdelivr.net';

export const PYTHON_BOOT_TIMEOUT_MS = 30000;
export const PYTHON_RUN_TIME_LIMIT_MS = 10000;
export const PYTHON_OUTPUT_LINE_LIMIT = 5000;

// JSON for embedding inside an inline <script>.
const LINE_SEPARATOR = String.fromCharCode(0x2028);
const PARAGRAPH_SEPARATOR = String.fromCharCode(0x2029);
const toScriptLiteral = (value: string) => JSON.stringify(value)
  .replace(/</g, '\\u003c')
  .split(LINE_SEPARATOR).join('\\u2028')
  .split(PARAGRAPH_SEPARATOR).join('\\u2029');

/** Runs once per boot before the snapshot; defines the run helpers. */
export const PYTHON_SETUP_SOURCE = String.raw`
import builtins, linecache, sys, traceback

def _cs_input(prompt=""):
    line = sys.stdin.readline()
    if line == "":
        raise EOFError("input() ran out of lines. Add more to the Program input box.")
    if line.endswith("\n"):
        line = line[:-1]
    print(f"{prompt}{line}")
    return line

builtins.input = _cs_input

def _cs_format_error(exc):
    report = traceback.TracebackException.from_exception(exc)
    report.stack = traceback.StackSummary.from_list(
        [frame for frame in report.stack if frame.filename == "main.py"]
    )
    report.__cause__ = None
    report.__context__ = None
    report.__suppress_context__ = True
    lines = list(report.format())
    if not report.stack:
        lines = [line for line in lines if not line.startswith("Traceback")]
    return "".join(lines).rstrip("\n")

def _cs_run(source):
    linecache.cache["main.py"] = (len(source), None, source.splitlines(True), "main.py")
    try:
        code = compile(source, "main.py", "exec")
    except SyntaxError as exc:
        return "".join(traceback.format_exception_only(type(exc), exc)).rstrip("\n")
    namespace = {"__name__": "__main__", "__builtins__": builtins}
    try:
        exec(code, namespace)
    except SystemExit:
        pass
    except BaseException as exc:
        return _cs_format_error(exc)
    finally:
        sys.stdout.flush()
        sys.stderr.flush()
    return None
`;

/** Module worker source. Talks only to the iframe that created it. */
export const PYTHON_WORKER_SOURCE = String.raw`
const INDEX_URL = ${toScriptLiteral(PYODIDE_INDEX_URL)};
const SETUP = ${toScriptLiteral(PYTHON_SETUP_SOURCE)};
const LINE_LIMIT = ${PYTHON_OUTPUT_LINE_LIMIT};
let pyodide = null;
let lineCount = 0;
let limitHit = false;

// Python blocks this worker while it runs, so a buffered line could wait
// forever behind a long loop. Post every line as soon as it is printed.
function emit(stream, text) {
  if (limitHit) return;
  lineCount += 1;
  if (lineCount > LINE_LIMIT) {
    limitHit = true;
    postMessage({ type: 'output-limit' });
    return;
  }
  postMessage({ type: 'output', lines: [[stream, text]] });
}

async function boot(snapshot) {
  const started = Date.now();
  const { loadPyodide } = await import(INDEX_URL + 'pyodide.mjs');
  const options = { indexURL: INDEX_URL, jsglobals: {} };
  if (snapshot) options._loadSnapshot = snapshot;
  else options._makeSnapshot = true;
  pyodide = await loadPyodide(options);
  pyodide.setStdout({ batched: (text) => emit('out', text) });
  pyodide.setStderr({ batched: (text) => emit('err', text) });
  if (!pyodide.globals.has('_cs_run')) pyodide.runPython(SETUP);
  let madeSnapshot;
  let snapshotError;
  if (!snapshot) {
    try { madeSnapshot = pyodide.makeMemorySnapshot(); }
    catch (error) { snapshotError = String((error && error.message) || error); }
  }
  const message = { type: 'ready', restored: !!snapshot, bootMs: Date.now() - started, snapshotError, snapshot: madeSnapshot };
  postMessage(message, madeSnapshot ? [madeSnapshot.buffer] : []);
}

function run(id, code, stdin) {
  lineCount = 0;
  limitHit = false;
  const text = String(stdin || '').replace(/\r\n?/g, '\n');
  const lines = text === '' ? [] : text.split('\n');
  if (text.endsWith('\n')) lines.pop();
  // Return the newline ourselves so a blank answer is not read as EOF.
  pyodide.setStdin({ stdin: () => (lines.length ? lines.shift() + '\n' : undefined) });
  let error = null;
  let fatal = false;
  const runner = pyodide.globals.get('_cs_run');
  try {
    const result = runner(String(code));
    if (typeof result === 'string') error = result;
  } catch (failure) {
    fatal = true;
    error = 'Python stopped unexpectedly: ' + String((failure && failure.message) || failure);
  } finally {
    if (runner && runner.destroy) runner.destroy();
  }
  postMessage({ type: 'done', id, error, fatal });
}

self.onmessage = (event) => {
  const data = event.data || {};
  if (data.type === 'boot') {
    boot(data.snapshot).catch((error) => {
      postMessage({ type: 'boot-error', fromSnapshot: !!data.snapshot, message: String((error && error.message) || error) });
    });
  } else if (data.type === 'run' && pyodide) {
    run(data.id, data.code, data.stdin);
  }
};
`;

/** Iframe-side recipe logic. Runs after the kernel in the same script. */
export const PYTHON_RECIPE_LOGIC = String.raw`
(function () {
  const WORKER_URL = 'data:text/javascript;charset=utf-8,' + encodeURIComponent(${toScriptLiteral(PYTHON_WORKER_SOURCE)});
  const BOOT_TIMEOUT_MS = ${PYTHON_BOOT_TIMEOUT_MS};
  const RUN_TIME_LIMIT_MS = ${PYTHON_RUN_TIME_LIMIT_MS};
  const LOAD_FAILED = 'Python could not load. Check that this device can reach cdn.jsdelivr.net, then click RETRY LOADING.';
  let worker = null;
  let snapshot = null;
  let snapshotBroken = false;
  let status = { state: 'loading' };
  let bootTimer = null;
  let current = null;
  let runCount = 0;

  function setStatus(state, message, detail) {
    status = { state: state };
    if (message) status.message = message;
    if (detail) status.detail = detail;
    sendPayload('RUNTIME_STATUS', status);
  }

  function fail(message) {
    clearTimeout(bootTimer);
    if (worker) worker.terminate();
    worker = null;
    setStatus('failed', LOAD_FAILED, message);
    sendPayload('RUNTIME_ERROR', LOAD_FAILED);
    finishRun();
  }

  function finishRun() {
    if (!current) return;
    clearTimeout(current.timer);
    const resolve = current.resolve;
    current = null;
    resolve();
  }

  function stopRun(message) {
    if (!current) return;
    if (worker) worker.terminate();
    worker = null;
    sendPayload('CONSOLE_WARN', message);
    finishRun();
    startWorker(true);
  }

  function handle(data) {
    if (!data) return;
    if (data.type === 'ready') {
      clearTimeout(bootTimer);
      if (data.snapshot) snapshot = data.snapshot;
      setStatus('ready', null, data.snapshotError ? 'snapshot-unavailable: ' + data.snapshotError : null);
    } else if (data.type === 'output') {
      for (const entry of data.lines) {
        sendPayload(entry[0] === 'err' ? 'RUNTIME_ERROR' : 'CONSOLE_LOG', entry[1]);
      }
    } else if (data.type === 'output-limit') {
      stopRun('Output limit reached: the program printed more than ${PYTHON_OUTPUT_LINE_LIMIT} lines.');
    } else if (data.type === 'done') {
      if (!current || data.id !== current.id) return;
      if (data.error) sendPayload('RUNTIME_ERROR', data.error);
      finishRun();
      if (data.fatal) startWorker(true);
    } else if (data.type === 'boot-error') {
      if (data.fromSnapshot && !snapshotBroken) {
        snapshotBroken = true;
        snapshot = null;
        startWorker(false);
      } else {
        fail(data.message);
      }
    }
  }

  function startWorker(fromSnapshot) {
    if (worker) worker.terminate();
    clearTimeout(bootTimer);
    setStatus('loading');
    let created;
    try {
      created = new Worker(WORKER_URL, { type: 'module' });
    } catch (error) {
      fail(String((error && error.message) || error));
      return;
    }
    worker = created;
    bootTimer = setTimeout(function () {
      if (worker === created && status.state === 'loading') fail('Timed out after ' + BOOT_TIMEOUT_MS + ' ms.');
    }, BOOT_TIMEOUT_MS);
    created.onmessage = function (event) { if (worker === created) handle(event.data); };
    created.onerror = function (event) {
      if (worker !== created) return;
      if (event && event.preventDefault) event.preventDefault();
      const message = (event && event.message) || 'Worker error';
      if (status.state === 'loading') fail(message);
      else { sendPayload('RUNTIME_ERROR', 'Python stopped unexpectedly: ' + message); finishRun(); startWorker(true); }
    };
    if (fromSnapshot && snapshot && !snapshotBroken) {
      const copy = snapshot.slice();
      created.postMessage({ type: 'boot', snapshot: copy }, [copy.buffer]);
    } else {
      created.postMessage({ type: 'boot' });
    }
  }

  window.__RUN_MODE__ = function (code, root, payload) {
    return new Promise(function (resolve) {
      if (status.state !== 'ready' || !worker) {
        sendPayload('RUNTIME_ERROR', status.state === 'failed' ? LOAD_FAILED : 'Python is still loading. Try again in a moment.');
        resolve();
        return;
      }
      if (current) finishRun();
      runCount += 1;
      const id = runCount;
      current = {
        id: id,
        resolve: resolve,
        timer: setTimeout(function () {
          stopRun('Stopped after ' + (RUN_TIME_LIMIT_MS / 1000) + ' seconds. Is there a loop that never ends?');
        }, RUN_TIME_LIMIT_MS),
      };
      const stdin = payload && typeof payload.stdin === 'string' ? payload.stdin : '';
      worker.postMessage({ type: 'run', id: id, code: String(code), stdin: stdin });
    });
  };

  window.__STOP_MODE__ = function () { stopRun('Program stopped.'); };
  window.__RETRY_MODE__ = function () { if (status.state === 'failed') startWorker(true); };
  // Status sent before the host's port existed was lost; send it again.
  window.__ON_PORT_READY__ = function () { sendPayload('RUNTIME_STATUS', status); };

  startWorker(false);
})();
`;
