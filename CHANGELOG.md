# Changelog

## Unreleased — CodeMirror

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
