# Changelog

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
