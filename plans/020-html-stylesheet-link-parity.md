# Plan 020: Allow stylesheet links across HTML modes

Status: DONE. Implemented and verified 2026-10-18.

## Verified behavior

The request concerns CSS links such as `<link rel="stylesheet"
href="https://example.com/theme.css">`. The bundled `style.css` marker already
works in both multi-file modes.

| Mode | External CSS link | Mechanism |
| --- | --- | --- |
| `html` | Preserved | Passes authored HTML to an inner iframe's `srcdoc`. |
| `html-css` | Preserved | Replaces exact local `style.css` links with style elements, serializes the remaining document into `srcdoc`. |
| `html-css-js` | Removed | Deletes all stylesheet links, then imports only body nodes. |

Evidence: `runtime/runner.ts` HTML recipes, the corresponding template
descriptions, and a temporary Vitest harness executing each generated
`window.__RUN_MODE__` with the same full-document fixture. Parsing the inner
`srcdoc` for the first two modes preserved the external link; the three-file
mode's resulting DOM contained none. The harness plus `runtime/runner.test.ts`
passed 30 tests. The temporary harness was removed after verification.
This verifies DOM preservation/removal; real browser fetching and computed
styles remain an implementation acceptance check.

The restriction is intentional in Plan 016 and current documentation, rather
than a failed CSS download. Two causes need addressing: explicit link removal
and failure to restore head content. Merely deleting the removal line is
insufficient for the normal `<head>` placement.

## Intended contract

- All three modes accept authored external stylesheet links in full documents
  and HTML fragments. Leave the working `html` and `html-css` paths intact.
- Keep exact `link[rel="stylesheet"][href="style.css"]` resolution to the CSS
  tab, independent of the exact `script.js` marker and the unlinked-file hints.
- Preserve authored stylesheet order: equal-specificity rules follow document
  order across external links, inline styles, and resolved local CSS.
- Preserve link attributes, including `media`, `integrity`, `crossorigin`,
  `referrerpolicy`, and `disabled`. Let the browser resolve external hrefs as
  it does today in HTML/CSS mode; do not add a new URL allowlist or virtual file
  resolver. Only the existing exact local marker resolves to bundled CSS.
- Each Run replaces the previous learner DOM and all installed head resources;
  removing or changing a link must remove its old styling.
- Keep manual Run and existing JS execution timing. Stylesheet downloads are
  asynchronous; do not make bundled JS wait for external CSS.
- `html-js-css-media` inherits the recipe and gets the same behavior and tests.
  Other recipes and arbitrary head elements are outside this change.

## Implementation

1. Add behavior tests at the generated recipe seam in `runtime/runner.test.ts`,
   using its existing `new Function`/DOMParser execution pattern. First show
   that an external head link is missing in `html-css-js`. Cover body/fragment
   links as well, and keep parity checks for the other two modes.
2. In the three-file recipe in `runtime/runner.ts`, detect local CSS and JS
   markers before changing the parsed document. Continue stripping scripts.
   Replace each exact local CSS link with a style element populated through
   `textContent`. Preserve other stylesheet links rather than deleting them.
3. Import only head stylesheet links and head style elements into the sandbox
   document's head in source order. Track the imported nodes in recipe-owned
   state for removal at the beginning of the next Run. Import body nodes as
   before, preserving body stylesheet links/styles and their order. Local
   replacements in the body stay in place; avoid duplicate CSS injection.
   Keep the missing-CSS hint based on the original local-marker detection.
   The runtime host's own styles must survive cleanup.
4. Update the existing string-order test that currently requires blanket link
   removal. Prefer behavioral assertions for the changed resource lifecycle.
   Exercise `html-js-css-media` too because it copies this recipe.
5. Update `template_descriptions/html-css-js.md`,
   `template_descriptions/html-js-css-media.md`, `ENVIRONMENTS_README.md`,
   `CLAUDE.md`, and the three-file section of `README.md`. Explain external CSS
   support, exact bundled-file markers, asynchronous loading, and rerun cleanup.
   This plan supersedes Plan 016's stylesheet restriction; its historical
   implementation notes remain unchanged.

## Acceptance and verification

- Head and body external links survive with attributes intact; local markers
  resolve without a network request for `style.css`.
- Head inline styles survive, and ordering relative to external/local CSS is
  correct. Multiple links and repeated Runs do not accumulate head nodes.
- Run A links a stylesheet; Run B removes or changes it. Old head resources
  are disconnected and old body links disappear with the prior body.
- Missing local CSS still shows the hint even if external links exist. Missing
  JS does not stop stylesheet rendering. Linked bundled JS still executes once;
  authored script elements remain stripped.
- Build a deterministic browser check using a locally served CSS fixture and
  Playwright request logging: all three modes request it and apply its known
  computed color. Include a second rule with equal specificity to verify
  cascade order and a rerun that removes the external rule. Use local fixtures
  instead of public CDNs. Repeat for the Media alias.
- Run the focused runtime tests, then `npm test`, `npm run typecheck`,
  `npm run lint`, `npm run build`, and `git diff --check`, using
  `fnm exec --using default` for Node tooling.

No new dependency, public prop, bundle format, or sandbox permission is needed.
External CSS can affect the three-file sandbox's own hints because they share
its document; verify that common resets still leave output and console usable.

## Implementation results

- Restored external links and inline head styles in source order, with exact
  local CSS replacement and reference-based resource cleanup on rerun.
- Added eight behavioral tests across the four modes. All 191 tests pass;
  typecheck, lint, build, and whitespace checks pass. An initial full-suite run
  hit an unchanged editor-test timing failure; its isolated rerun and the full
  suite rerun passed.
- `npm run test:html-stylesheets` starts local HTML/CSS fixtures and checks the
  generated sandbox in Chromium: real CSS requests, computed styles, head/body
  and local/external cascade order, JS execution, and rerun cleanup all pass
  for `html`, `html-css`, `html-css-js`, and the Media alias.
