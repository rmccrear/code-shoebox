# Changelog

## 1.0.40 — 2026-11-24

- New `python` mode ([#32](https://github.com/rmccrear/code-shoebox/pull/32)):
  real Python 3.14 (Pyodide 314.0.8) in a Web Worker inside the sandbox,
  console only. RUN CODE reads **LOADING PYTHON…** until Python is ready,
  becomes **STOP** while a program runs, and offers **RETRY LOADING** if
  `cdn.jsdelivr.net` cannot be reached within 30 s.
- A **Program input** box answers `input()` one line at a time; the new
  optional `pythonInput` prop pre-fills it. It is never persisted.
- Programs stop after 10 seconds or 5,000 output lines; Python restarts from a
  memory snapshot in about a quarter of a second. Each Run gets a fresh
  namespace, tracebacks show only `main.py` lines, and learner code cannot
  reach the network or browser APIs.
- Fix: toggling prediction mode no longer cuts off console output in
  `node-js` and `node-ts` (the hidden sandbox iframe now remounts with its
  message channel).
- CI now runs on `ubuntu-24.04`, where Playwright can install Chromium.

## 1.0.39 — 2026-10-28

- Fix [#26](https://github.com/rmccrear/code-shoebox/issues/26) ([#27](https://github.com/rmccrear/code-shoebox/pull/27)):
  HTML + JavaScript, HTML + JavaScript + Fetch, HTML + CSS + JavaScript and its
  Media variant now render each Run in an isolated nested page frame. Learner
  `html`/`body` CSS (such as a centered full-height layout) no longer restyles
  the playground's internal document, so the preview scrolls normally.
- The page frame never gets `allow-same-origin`; `script.js` is delivered by
  message rather than embedded in any `srcdoc`.

## 1.0.37 — 2026-10-18

- Fix [#24](https://github.com/rmccrear/code-shoebox/pull/24): allow external
  stylesheet links in HTML + CSS + JavaScript mode and its Media variant,
  matching HTML and HTML + CSS modes.
- Preserve head styles and stylesheet order, and remove prior resources on Run.

## 1.0.35 — 2026-10-09

- Fix [#20](https://github.com/rmccrear/code-shoebox/issues/20): distributed
  resets and utilities now apply only to the CodeShoebox root and descendants.
  Importing `code-shoebox/styles.css` no longer resets host controls or overrides
  host utilities. The ordinary CSS import requires no host cascade-layer setup.
- Namespace the package's animation keyframes to avoid host animation collisions.
- Preserve the host font on the component root and controls while retaining
  explicitly chosen monospace fonts for source code.
- Hosts that used the package stylesheet to style unrelated page elements must
  supply their own reset and utilities.
