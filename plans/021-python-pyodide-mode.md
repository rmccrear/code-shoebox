# Plan 021: Add a Python console mode powered by Pyodide

> **Executor instructions**: Follow this plan step by step and run every
> verification command. Read the live files before editing. If a STOP condition
> occurs, report it rather than widening scope. When done, update this plan's
> row in `plans/README.md` unless a reviewer maintains the index.
>
> **Drift check (run first)**:
> `git diff --stat eb6dcc0..HEAD -- types.ts runtime/types.ts runtime/runner.ts runtime/templates/common.ts components/CodeShoebox.tsx components/CodingEnvironment.tsx components/OutputFrame.tsx components/CodeEditor.tsx hooks/useSandboxState.ts constants.ts App.tsx Demo.tsx demoPresets.ts prompts.ts README.md ENVIRONMENTS_README.md CLAUDE.md template_descriptions`
> This plan was prepared against `origin/main` at `eb6dcc0` on 2026-11-24.
> Reconcile any drift in the run lifecycle, kernel message contract, or
> headless-mode handling before implementation.

## Status

- **Priority**: P1
- **Effort**: L
- **Risk**: MED-HIGH (new runtime lifecycle state, Web Worker inside the
  sandbox, an experimental Pyodide snapshot API, and a CDN dependency of ~6 MB)
- **Depends on**: none
- **Category**: feature
- **Planned at**: commit `eb6dcc0`, 2026-11-24
- **Implementation status**: TODO

## Why this matters

CodeShoebox teaches JavaScript and web topics only. Python is the most common
first language in schools, and Code.org's Python Lab already teaches it in the
browser with Pyodide. Pyodide is real CPython (3.14 at the pinned version) compiled to
WebAssembly, so learners get the real standard library, real tracebacks, and
real `input()`. Everything stays in the browser, so there is still no backend.

## Evidence from prototypes (2026-10-28 and 2026-11-24)

Prototypes ran in Chromium inside an iframe with exactly
`SANDBOX_ATTRIBUTES` (`allow-scripts allow-modals allow-forms`, opaque
origin) and a `connect-src https://cdn.jsdelivr.net` CSP.

| Check | Result |
|---|---|
| Load Pyodide from jsDelivr in the opaque-origin iframe | Works (`access-control-allow-origin: *`) |
| Download size (brotli) | ~3.4 MB WASM + ~2.5 MB stdlib zip + small JS |
| First-ever boot (cold network) | 4–10 s |
| Boot with files in HTTP cache | ~1.7–2.3 s on a quiet machine (compiling the WASM is only ~55 ms; the rest is Python starting up) |
| `makeMemorySnapshot()` after boot with `_makeSnapshot: true` | 13 ms, ~30 MB `Uint8Array`, transferable |
| New **worker** restored with `_loadSnapshot` | **340–460 ms** to ready; stdlib, `input()`, and errors all work |
| `while True: pass` in a worker, then `terminate()` | Stops it; the iframe stays responsive |
| `crossOriginIsolated` / `SharedArrayBuffer` in the sandbox | `false` / `undefined` → Pyodide's interrupt buffer is **not** available |
| Worker from a blob URL (classic or module) | Fails (`importScripts` network error / silent module error) |
| Module worker from a **`data:` URL** + `import(BASE + 'pyodide.mjs')` | Works |
| Classic worker + `pyodide.mjs` | Refused: "Classic web workers are not supported" |
| `setStdin({ stdin: () => queue.shift() })` | `input()` works; `undefined` raises `EOFError` |
| Fresh namespace per run (`runPython(code, { globals })`) | No variables leak between runs |
| Learner `pyfetch("https://example.com")` under the CSP | Blocked (`AbortError`) |
| `loadPackage('numpy')` from the same CDN | Works (~0.4–1.5 s) — **not** used in this plan |
| Raw tracebacks | Include 5–15 lines of `/lib/python314.zip/_pyodide/...` frames; must be trimmed |
| 1M-iteration loop | 0.16–0.45 s (MicroPython: 1–2.3 s) |

Code.org's Python Lab (`code-dot-org/code-dot-org`,
`apps/src/pythonlab/pyodideWebWorker.ts`, `pyodideWorkerManager.ts`) uses the
same overall shape. It boots one worker at page load, reuses it across runs
with globals reset, and on Stop terminates and boots a new worker at full cost.
It self-hosts the files and sets `jsglobals: {}`. Its live `input()` needs a
service worker on a real origin, which our opaque-origin sandbox cannot
register. Prototype pages live outside the repo and are not part of this plan.

## Outcome

Add one public mode, `python`, labelled **Python (Console)**. It is a
console-only mode like `node-js`:

- Pyodide starts loading in a Web Worker inside the sandbox iframe as soon as
  the component mounts. **RUN CODE is disabled and reads "LOADING PYTHON…"**
  until the worker reports ready. Learners are expected to be reading lesson
  text during this time.
- Every Run executes `main.py` in a fresh namespace in the warm worker. Output
  streams to the existing Console. Errors show a traceback trimmed to the
  learner's own frames.
- While a program runs, the Run button becomes **STOP**. Stop or the time limit
  terminates the worker, and a new one is restored from the memory snapshot in
  well under a second.
- `input()` reads lines from a **Program input** box shown above the console.
  Each consumed line is echoed after its prompt, so the console reads like a
  terminal. Running out of lines raises a friendly `EOFError`.

## Locked design decisions

1. Identifier `'python'`; label **Python (Console)**; editor filename
   `main.py`; Monaco language `python`. Single file only. No tabs, packages,
   imports of other learner files, turtle, or graphics.
2. Pin Pyodide to **`v314.0.8`** with one constant in `runtime/runner.ts`:
   `const PYODIDE_INDEX_URL = 'https://cdn.jsdelivr.net/pyodide/v314.0.8/full/'`.
   Follow the existing "pin and bump deliberately" CDN rule (`runner.ts:11-13`).
3. Recipe CSP is exactly `connect-src https://cdn.jsdelivr.net`. Do not add
   `allow-same-origin` or any other sandbox token.
4. **Execution happens only in a Web Worker** owned by the recipe logic, never
   on the iframe main thread. Create it with
   `new Worker('data:text/javascript;charset=utf-8,' + encodeURIComponent(WORKER_SOURCE), { type: 'module' })`.
   The worker loads Pyodide with `await import(PYODIDE_INDEX_URL + 'pyodide.mjs')`.
   Blob URLs and classic workers are known not to work (see Evidence).
5. Learner code never enters `srcDoc` or the worker source string. It travels
   in `EXECUTE.code` → kernel → `worker.postMessage`, like every other mode.
6. **Boot once, then snapshot.** The first worker boots with
   `_makeSnapshot: true`, runs the setup Python (decision 9), calls
   `makeMemorySnapshot()`, and transfers the snapshot to the iframe main
   thread. The iframe keeps the only copy. That worker stays alive and serves
   runs.
7. **Reuse the warm worker across runs**, each run with a fresh `__main__`
   namespace (Code.org's model). Restore a new worker from the snapshot (pass
   `snapshot.slice()` and transfer the copy) only after Stop, a time limit, a
   worker crash, or an internal error. If `_makeSnapshot`/`_loadSnapshot`
   throws, fall back to a full boot for every restart. That is slower, but it
   still works. Emit one debug-only system log line when this happens.
8. **Runtime status contract.** The kernel reports
   `sendPayload('RUNTIME_STATUS', { state, message? })` with
   `state ∈ 'loading' | 'ready' | 'failed'`. `'failed'` covers a boot error or
   no `ready` within **30 s**. Its message names `cdn.jsdelivr.net` so school
   IT can unblock it. In `'failed'` state the button reads **RETRY LOADING**
   and clicking it sends a `RETRY` message that re-runs the boot.
9. **Setup Python baked into the snapshot.** Define `_cs_run(source)` and
   `_cs_input(prompt="")`, and set `builtins.input = _cs_input`:
   - `_cs_run` compiles with filename `"main.py"`, runs it with
     `exec(code, {"__name__": "__main__"})`, and catches `BaseException`
     (except `SystemExit`, which counts as a normal finish). It returns the
     formatted traceback text, keeping only `main.py` frames plus the final
     exception line. A `SyntaxError` keeps its caret block. No
     `/lib/python…/_pyodide/` line may reach the learner.
   - `_cs_input` reads `sys.stdin.readline()`. On `''` it raises
     `EOFError("input() ran out of lines. Add more to the Program input box.")`.
     Otherwise it strips the trailing newline, prints `prompt + line`, and
     returns the line.
   - Learner code runs synchronously (no top-level `await`, no `asyncio.run`).
10. **stdin per run.** `EXECUTE.payload.stdin` is a string. The worker splits
    it on `\n` and installs `setStdin({ stdin: () => queue.shift() })` before
    each run. Host input text never enters `srcDoc`, persistence, or the code
    envelope.
11. **Stop and time limit.** Add a generic, optional kernel hook: on
    `{ type: 'STOP' }` from `window.parent`, call `window.__STOP_MODE__?.()`.
    Other modes don't define it, so nothing else changes. The Python recipe
    also enforces a **10 s per-run limit**. Both paths terminate the worker,
    write a system line ("Program stopped." or "Stopped after 10 seconds — is
    there a loop that never ends?"), resolve the pending run so
    `EXECUTION_COMPLETE` fires, then restore from the snapshot with status
    `loading` → `ready`.
12. **Output limits.** The worker batches stdout/stderr lines and flushes them
    to the iframe at most every 50 ms. After **5,000 lines in one run**, it
    stops the program the same way as decision 11 with "Output limit reached."
    Stdout → `CONSOLE_LOG`; stderr and the trimmed traceback →
    `RUNTIME_ERROR`. The host's existing 500-entry console cap stays.
13. **Lock down JS access.** Pass `jsglobals: {}` to `loadPyodide` so learner
    `import js` exposes no `fetch`, `XMLHttpRequest`, or `importScripts`. Call
    nothing that auto-loads packages (`loadPackagesFromImports`, micropip).
    The CSP remains the backstop: the only reachable host is jsDelivr.
14. Keep `isRunning` honest for Python. CodeShoebox uses `EXECUTION_COMPLETE`
    (matched by `executionId`, as mock-API runs already do) instead of the
    500 ms fallback. Its safety fallback is 10 s + 5 s.
15. Program input UI (confirmed by the maintainer 2026-11-24): a small labelled textarea ("Program input — one line per
    `input()`") between the output area and the console in Python mode only.
    Its initial value comes from a new optional prop
    `pythonInput?: string` on `CodeShoeboxProps`. It is ephemeral component
    state. It resets with `sessionId` and is not saved to localStorage.
16. Ship a starter, selector option, hash preset, gallery demo, prediction
    prompt, and docs with the mode, like plans 015–017.

## Architecture

```text
Host (CodeShoebox → CodingEnvironment → OutputFrame)
  │  postMessage: EXECUTE {code, payload:{stdin}, executionId} | STOP | RETRY
  ▼
Sandbox iframe (opaque origin, CSP connect-src cdn.jsdelivr.net)
  kernel (common.ts)  ── RUNTIME_STATUS / CONSOLE_LOG / RUNTIME_ERROR / EXECUTION_COMPLETE ──▶ host
  python recipe logic: owns `worker`, `snapshot`, run timer, line counter
  │  worker.postMessage: {type:'run', code, stdin} ; terminate() on stop
  ▼
Module worker from data: URL
  import(pyodide.mjs) → loadPyodide({_makeSnapshot | _loadSnapshot, jsglobals:{}})
  setup Python (_cs_run, _cs_input) → makeMemorySnapshot() (first boot only)
  posts {type:'ready'|'out'|'err'|'done'|'error'}
```

## Current state (at `eb6dcc0`)

- `runtime/templates/common.ts:112-140` is the kernel listener. It handles
  only `INIT_PORT`, `THEME`, and `EXECUTE`, and sends `EXECUTION_COMPLETE`
  after `__RUN_MODE__`'s promise settles. Add `STOP`/`RETRY` → optional hooks.
- `runtime/runner.ts:245-843` holds `ENV_RECIPES`; `node-js`
  (`runner.ts:817-826`) is the headless exemplar. `getSandboxHtml`
  (`:854`) and `executeCodeInSandbox` (`:877`) are the host entry points.
  `SandboxExecutionOptions` (`:871`) needs `stdin?: string`. Add a sibling
  `postSandboxControl(win, type: 'STOP' | 'RETRY')`.
- `runtime/types.ts` and `types.ts` each declare `EnvironmentMode`. Update
  both.
- `components/CodeShoebox.tsx:20-49` owns `runTrigger`/`isRunning` and the
  500 ms / 10 s fallback. Add `runtimeStatus`, `stopTrigger`, and the
  Python-specific completion path here.
- `components/CodingEnvironment.tsx:307-316` renders RUN CODE. Add the
  loading, stop, and retry states there. `getDisplayFilename` must return
  `main.py`.
- `components/OutputFrame.tsx:53` hardcodes headless modes as
  `node-js`/`node-ts`. `handleKernelMessage` (`:79-97`) only forwards
  `EXECUTION_COMPLETE` when mock API is on. The `runTrigger` effect
  (`:118-149`) builds `EXECUTE`. The Program input box and `RUNTIME_STATUS`
  forwarding go here.
- `components/CodeEditor.tsx:100-137` maps modes to model path and language.
  Add `.py` and `'python'`.
- `hooks/useSandboxState.ts:27-55` has the persisted-mode allowlist and
  starter switch. `constants.ts` holds starters, and `NODE_JS_STARTER_CODE`
  (`:602`) is the style reference.
- `prompts.ts`, `App.tsx:139` (selector), `demoPresets.ts` (around `:502`), and
  `Demo.tsx:432` (gallery state) are the per-mode exemplars.
- Docs: `README.md` mode list, `ENVIRONMENTS_README.md` §5 (`:262`),
  `CLAUDE.md` "Mode-specific gotchas", and `template_descriptions/node-js.md`
  as the template for `template_descriptions/python.md`.
- CI (`.github/workflows/ci.yml`) runs typecheck, lint, vitest, build, and
  `test:styles`. Browser checks that need the network
  (`test:html-stylesheets`) are run by hand.

## Commands you will need

CI uses Node 22/npm 10. On this workstation, prefix commands with
`fnm exec --using 22.14.0`.

| Purpose | Command | Expected |
|---|---|---|
| Install | `npm ci` | exit 0; lockfile unchanged (no new npm deps) |
| Typecheck | `npm run typecheck` | exit 0 |
| Lint | `npm run lint` | exit 0 |
| Unit tests | `npm test` | all pass |
| Focused | `npx vitest run runtime/runner.test.ts components/OutputFrame.test.tsx components/CodingEnvironment.test.tsx hooks/useSandboxState.test.ts` | all pass |
| Library build | `npm run build` | exit 0; `dist/` size essentially unchanged |
| Demo build | `npm run build:demo` | exit 0 |
| Browser check | `npm run test:python` (new, needs network) | all scenarios pass |
| Manual | `npm run dev` → `#python-console-demo` | see Step 9 |

## Scope

### In scope
- The `python` mode, its recipe, and its worker; kernel `STOP`/`RETRY` hooks;
  `RUNTIME_STATUS`.
- Run-button states (loading / run / stop / retry), the Program input box, and
  the `pythonInput` prop.
- Starter, selector, preset, gallery demo, prediction prompt, and docs.
- Unit tests plus a Playwright browser check script.

### Out of scope (do not add)
- Packages (`numpy`, `matplotlib`, micropip), multiple files, `turtle`, or
  graphics/canvas output.
- Live interactive `input()` while a program runs (needs `SharedArrayBuffer`
  or a service worker; neither exists in the opaque-origin sandbox).
- Self-hosting Pyodide or a configurable index URL (follow-up; see
  Maintenance notes).
- Sharing one Pyodide between several CodeShoebox instances on a page.
- Python type checking or language-server features in the editor.
- CodeMirror changes (the `codex/codemirror6-prototype` branch is separate;
  see Maintenance notes).

## Git workflow

Branch from current `origin/main` as `codex/python-pyodide-mode`. Commit per
step or per coherent pair of steps. Open a draft PR when Step 8 passes.

## Steps

### Step 1: Register the mode
- Add `'python'` to both `EnvironmentMode` unions, `VALID_MODES`, and
  `getStarterCode`. Add `PYTHON_STARTER_CODE` to `constants.ts`: a short
  program using `print`, an f-string, a loop, a function, and one `input()`
  call whose line the demo supplies.
- `CodeEditor.tsx`: model path `${basePath}.py`; language `'python'`.
  `CodingEnvironment.getDisplayFilename('python')` → `main.py`.
- **Verify**: typecheck; `npx vitest run hooks/useSandboxState.test.ts` with a
  new case showing that switching to `python` loads the starter.

### Step 2: Kernel control hooks
- In `KERNEL_SCRIPTS`, handle `type === 'STOP'` → `window.__STOP_MODE__?.()` and
  `type === 'RETRY'` → `window.__RETRY_MODE__?.()`, behind the existing
  `event.source !== window.parent` guard.
- In `runner.ts`, add `postSandboxControl(win, type)` and `stdin?: string` on
  `SandboxExecutionOptions`.
- **Verify**: `runner.test.ts`. Assert that every mode's `srcDoc` contains the
  hook dispatch, and that `executeCodeInSandbox` puts `stdin` in `payload`.

### Step 3: Python recipe and worker
- Add `PYODIDE_INDEX_URL`, `PYTHON_WORKER_SOURCE` (string), and
  `PYTHON_SETUP_SOURCE` (Python string) to `runner.ts`, or to a new
  `runtime/templates/python.ts` imported like `express.ts`/`hono.ts`.
- Recipe `python`: `name: "Python (Console)"`, `headless: true`,
  `showPlaceholder: false`,
  `contentSecurityPolicy: "connect-src https://cdn.jsdelivr.net"`, no `cdns`.
  `logic` implements decisions 4–13. It starts the boot immediately, defines
  `__RUN_MODE__` (returns a promise settled on `done`/`error`/stop),
  `__STOP_MODE__`, and `__RETRY_MODE__`, and reports `RUNTIME_STATUS`.
- If `__RUN_MODE__` is called before ready (it shouldn't be, because the
  button is disabled), send `RUNTIME_ERROR` "Python is still loading." and
  resolve.
- **Verify**: `runner.test.ts` covers:
  - `getSandboxHtml('python')` contains the pinned index URL exactly once and
    the exact CSP.
  - It contains `type: 'module'`, `data:text/javascript`, `_makeSnapshot`,
    `_loadSnapshot`, and `jsglobals`.
  - It contains no `allow-same-origin`.
  - A sentinel learner string passed to `executeCodeInSandbox` never appears
    in `getSandboxHtml` output.

### Step 4: Host lifecycle (CodeShoebox / OutputFrame)
- `OutputFrame`:
  - Add `python` to the headless set.
  - Forward `RUNTIME_STATUS` through a new `onRuntimeStatus` prop.
  - For Python, always send `executionId` and forward a matching
    `EXECUTION_COMPLETE` to `onExecutionComplete`.
  - Include `stdin` from the input box in the payload.
  - Add a `stopTrigger`/`retryTrigger` effect that calls `postSandboxControl`.
  - Reset the status to `loading` whenever the iframe remounts.
- `CodeShoebox`:
  - Hold `runtimeStatus` (default `'ready'` for non-Python modes; `'loading'`
    for Python on mount and on every `sessionId` change).
  - Add `stopTrigger`/`retryTrigger` counters.
  - Apply the Python fallback from decision 14.
  - Pass `pythonInput` through.
- **Verify**: `OutputFrame.test.tsx` covers:
  - A status message reaches `onRuntimeStatus`.
  - Python EXECUTE carries `executionId` and `stdin`.
  - `stopTrigger` posts `{type:'STOP'}`.
  - Python renders no visible iframe, plus the input box.

### Step 5: Run-button states and the input box
- In `CodingEnvironment`, the Python button is:
  - `loading` → disabled **LOADING PYTHON…** (spinner icon)
  - `ready` and idle → **RUN CODE**
  - `ready` and `isRunning` → enabled **STOP** (square icon; calls `onStop`)
  - `failed` → **RETRY LOADING**
- Prediction gating still applies to RUN CODE. Other modes render exactly as
  before.
- Program input textarea: label, monospace, 3 rows, resizable; theme-aware
  classes copied from the prediction textarea.
- **Verify**: `CodingEnvironment.test.tsx` checks each button state and its
  callback. A snapshot-style assertion confirms the `dom` and `node-js`
  toolbars are unchanged.

### Step 6: Selector, preset, prompt, gallery
- `App.tsx` option "Python (Console)"; `demoPresets.ts` preset
  `python-console-demo` with a `pythonInput` value; `prompts.ts` case;
  `Demo.tsx` gallery entry via `useSandboxState('demo_python_v1', …, 'python')`.
- **Verify**: `npx vitest run demoPresets.test.ts` resolves the new hash.

### Step 7: Browser check script
- Add `scripts/check-python-mode.mjs`, modelled on
  `scripts/check-html-stylesheets.mjs` (Vite SSR-load `runner.ts`, Chromium,
  iframe with `SANDBOX_ATTRIBUTES`), and `"test:python"` in `package.json`.
  Do not add it to CI: it needs jsDelivr. Scenarios, each with a timeout:
  1. `ready` arrives; `print` output arrives; `EXECUTION_COMPLETE` fires.
  2. Two runs: a variable from run 1 raises `NameError` in run 2.
  3. `input()` ×2 with two stdin lines echoes `Name? Grace`; a third call shows
     the friendly `EOFError`.
  4. `1/0` and a `SyntaxError`: the error text contains `main.py` and no
     `_pyodide`.
  5. `while True: pass` + STOP: "Program stopped." appears,
     `EXECUTION_COMPLETE` fires, `ready` returns in < 2 s, and the next run
     works.
  6. `while True: pass` without STOP stops at ~10 s with the time-limit
     message.
  7. `while True: print(1)` stops with "Output limit reached." and the page
     stays responsive.
  8. `import js; js.fetch` raises `AttributeError`, and
     `pyodide.http.pyfetch('https://example.com')` fails.
  9. Snapshot fallback: with `_loadSnapshot` forced to throw (test-only
     flag), a restart still reaches `ready`.
- **Verify**: `npm run test:python` passes twice in a row.

### Step 8: Documentation
- `ENVIRONMENTS_README.md`: new `### python (Python Console)` under §5. Cover
  engine and version, the worker/snapshot model, load times, stdin box, the
  10 s and 5,000-line limits, no packages, `jsglobals: {}`, CSP, and that
  `cdn.jsdelivr.net` must be reachable.
- `template_descriptions/python.md` (learner-facing, modelled on `node-js.md`).
- `README.md`: mode list and the `pythonInput` prop.
- `CLAUDE.md` gotcha bullet: the worker must be a `data:` URL module worker;
  learner code never enters `srcDoc`; snapshot plus warm reuse; Stop uses
  `__STOP_MODE__`.
- **Verify**: docs mention every limit in decisions 8–13 with matching numbers.

### Step 9: Gates and manual smoke
- Run the full command table.
- Manual `npm run dev` smoke:
  - The button shows LOADING PYTHON… then RUN CODE.
  - The starter runs with input.
  - STOP during an infinite loop recovers quickly.
  - Switching modes away and back re-boots cleanly.
  - Dark theme looks right.
  - Prediction mode gates Run.
  - Two Python instances in the gallery both reach ready.
- Record the measured cold and warm boot times in this plan's "Implementation
  results" section.

## Test plan

Unit tests cover only generated documents, message shapes, and UI state,
following the repo's rule that execution needs a real browser. All Python
execution is covered by `test:python` (Step 7) and the manual smoke (Step 9).

## Done criteria

- All command-table gates pass. `test:python` passes twice. Manual smoke is
  done.
- No new npm dependencies. `dist/` gains only the new strings.
- Non-Python modes behave byte-for-byte the same in `getSandboxHtml`, except
  for the generic STOP/RETRY hook lines.
- Docs and the `plans/README.md` row are updated.

## STOP conditions

Report and stop instead of widening scope if:
- `jsglobals: {}` breaks Pyodide boot or snapshot creation. Report it, and
  propose deleting `fetch`/`XMLHttpRequest`/`importScripts` from the worker
  global scope before learner code runs instead.
- A `data:` URL module worker cannot reach jsDelivr under the recipe CSP in
  current Chromium, Firefox, or Safari.
- Snapshot restore fails in any of those browsers **and** the full-boot
  fallback takes > 5 s on a warm cache.
- Implementing decision 14 requires changing `isRunning` behavior for
  non-Python modes.
- Any step would put learner code, stdin text, or host input into `srcDoc` or
  localStorage.

## Maintenance notes

- `_makeSnapshot`, `_loadSnapshot`, and `makeMemorySnapshot` are underscore
  (experimental) Pyodide APIs. Re-verify them on every Pyodide bump, and keep
  the full-boot fallback.
- Memory: about 30 MB snapshot in the iframe plus one Pyodide heap per
  instance. A page with many Python instances pays this for each one.
- Follow-up candidates, not planned:
  - Optional self-hosted index URL for school firewalls (Code.org's approach).
    Its CSP origin would have to follow the URL.
  - A separate `python-data` mode preloading numpy/matplotlib.
  - CodeMirror support on `codex/codemirror6-prototype`: add
    `@codemirror/lang-python`, plus `.py`/`python` branches in
    `editorLanguage()` and `editorFilename()`.
  - Live `input()` if the sandbox ever gains a real origin.

## Implementation results

_Not started._
