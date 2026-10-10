# Changelog

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
