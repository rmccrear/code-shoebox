# Changelog

## 1.0.41-c — 2026-11-03 (CodeMirror QA)

- The Console copies Chrome DevTools (follow-up to
  [#29](https://github.com/rmccrear/code-shoebox/issues/29)). Plain log rows
  use Chrome's base text (`#1f1f1f` light, `#e3e3e3` dark) and its exact value
  colors, so numbers read as blue against the text.
- Console text is Chrome's one-line format: `(3) [1, 2, 3]`, `[1]`, `{qty: '1'}`,
  `(2) [{…}, {…}]`, `Map(2) {'a' => 1, 'b' => 2}`, `5n`, `-0`, `ƒ greet() {…}`.
  `console.log(element)` prints the element's HTML (`<input id="tickets">`)
  instead of `{}`. The plain-text `payload`/`content` changes accordingly;
  uncaught errors and rejections keep their text.
- Objects, arrays, Maps, Sets and elements expand with ▶/▼ to one row per
  property or child node. The tree is a snapshot taken at log time (depth 6,
  2000 nodes per call; circular references are marked). Like Chrome, native
  platform getters are read, so `console.log(response)` shows
  `Response {…, status: 200, ok: true, …}`; user-defined getters never run.
- Log rows wrap like Chrome's console (pre-wrap, breaking long words only when
  needed) instead of running past the panel; wrapped tree rows stay aligned.
  Console parts gain an optional `value` tree; older hosts ignore it.
- Retain CodeMirror defaults, opt-in HTML Emmet and the optional TypeScript checker.

## 1.0.40-c — 2026-11-02 (CodeMirror QA)

- Fix [#29](https://github.com/rmccrear/code-shoebox/issues/29)
  ([#30](https://github.com/rmccrear/code-shoebox/pull/30)): the Console shows
  value types the way DevTools does. Top-level strings print plain, numbers,
  bigints and booleans print blue, and `null`/`undefined` print gray, so
  `console.log("1")` and `console.log(1)` no longer look the same.
- Console messages keep the joined string in `payload` and add a `parts` array
  (`{ kind, text }` per argument); log entries gain an optional `parts` field.
  Hosts and messages without `parts` render as before.
- Retain CodeMirror defaults, opt-in HTML Emmet and the optional TypeScript checker.

## 1.0.39-c — 2026-10-28 (CodeMirror QA)

- Incorporate the v1.0.39 fix for [#26](https://github.com/rmccrear/code-shoebox/issues/26)
  ([#28](https://github.com/rmccrear/code-shoebox/pull/28)): HTML + JavaScript,
  HTML + JavaScript + Fetch, HTML + CSS + JavaScript and its Media variant render
  each Run in an isolated nested page frame, so learner `html`/`body` CSS no longer
  breaks preview scrolling.
- Retain CodeMirror defaults, opt-in HTML Emmet and the optional TypeScript checker.

## 1.0.39 — 2026-10-28

- Fix [#26](https://github.com/rmccrear/code-shoebox/issues/26) ([#27](https://github.com/rmccrear/code-shoebox/pull/27)):
  HTML + JavaScript, HTML + JavaScript + Fetch, HTML + CSS + JavaScript and its
  Media variant now render each Run in an isolated nested page frame. Learner
  `html`/`body` CSS (such as a centered full-height layout) no longer restyles
  the playground's internal document, so the preview scrolls normally.
- The page frame never gets `allow-same-origin`; `script.js` is delivered by
  message rather than embedded in any `srcdoc`.

## 1.0.38-c — 2026-10-20 (CodeMirror QA)

- Add optional TypeScript diagnostics through a host worker factory and a separately
  bundled `ts-checker.worker.js` export, suitable for Vite automatic asset handling.
- Start the checker only for editable TS/TSX lessons; preserve lightweight JS/JSX,
  read-only previews and independent Emmet support.

## 1.0.37-c — 2026-10-18 (CodeMirror QA)

- Incorporate the v1.0.37 external stylesheet fixes in the CodeMirror QA build.
- Retain CodeMirror defaults, opt-in HTML Emmet, Tab completion and no TypeScript
  compiler service.
- Publish compiled QA artifacts on `dist-c` and tag `v1.0.37-c`.

## 1.0.37 — 2026-10-18

- Fix [#24](https://github.com/rmccrear/code-shoebox/pull/24): allow external
  stylesheet links in HTML + CSS + JavaScript mode and its Media variant,
  matching HTML and HTML + CSS modes.
- Preserve head styles and stylesheet order, and remove prior resources on Run.

## 1.0.36-c — 2026-10-15 (CodeMirror QA)

- Default to CodeMirror 6 with HTML/CSS/JS/JSX/TS/TSX language support, snippets,
  local-name completion, per-file undo history and Tab completion.
- Preserve opt-in HTML Emmet through `enableEmmet` for Emmet lessons.
- Omit the experimental TypeScript compiler worker and its download.
- Publish compiled QA artifacts on `dist-c` and tag `v1.0.36-c`.

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
