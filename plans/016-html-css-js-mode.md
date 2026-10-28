# Plan 016: Add a bounded HTML + CSS + JavaScript environment mode

> **Executor instructions**: Follow this plan step by step and run every
> verification command. Read the live files before editing. If a STOP condition
> occurs, report it rather than widening scope. When done, update this plan's
> row in `plans/README.md` unless a reviewer maintains the index.
>
> **Drift check (run first)**:
> `git diff --stat ea5c8a9..HEAD -- types.ts runtime/types.ts runtime/fileBundle.ts runtime/runner.ts components/CodingEnvironment.tsx components/CodeEditor.tsx components/OutputFrame.tsx hooks/useSandboxState.ts constants.ts App.tsx Demo.tsx demoPresets.ts prompts.ts README.md ENVIRONMENTS_README.md CLAUDE.md template_descriptions`
> This plan was prepared against `ea5c8a9` on 2026-08-16. Reconcile any
> overlapping bundle, tab, runner, output, demo, or documentation drift before
> implementation.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED (new persisted mode + three-file editing + sandbox execution)
- **Depends on**: plan 015 (DONE at `ea5c8a9`)
- **Category**: feature
- **Planned at**: commit `ea5c8a9`, 2026-08-16
- **Implementation status**: DONE in draft PR #5 at `1a18475`; clean npm
  install, typecheck, lint, 86 tests, both builds, GitHub CI, and the planned
  browser smoke cases passed.

## Why this matters

CodeShoebox has `html-css` for editable structure/presentation and `html-js`
for editable structure/behavior, but neither lets a learner own all three web
layers in separate files. The shared version-1 bundle, filename-aware tabs,
DOM restoration, and manual JavaScript runner make a three-file mode a bounded
extension rather than a generic project system.

```text
index.html
  ├── <link rel="stylesheet" href="style.css">  -> style.css
  └── <script src="script.js"></script>         -> script.js
```

## Outcome

Add one public mode, `html-css-js`, with exactly these editable tabs in order:

```text
index.html | style.css | script.js
```

It renders only when Run is pressed, displays the existing console, applies
bundled CSS only through the exact local stylesheet marker, and executes
bundled JavaScript only through the exact local script marker. Every Run
restores current markup and CSS before executing current JS.

## Locked design decisions

1. Use identifier `'html-css-js'` and learner-facing label
   **HTML, CSS & JavaScript (3 files)**.
2. Expose only `index.html`, `style.css`, and `script.js`, in that order. Do not
   add file creation, deletion, renaming, folders, or a project tree.
3. Preserve the one-string public API and version-1 envelope:

   ```json
   {"__csFiles__":1,"files":{"index.html":"...","style.css":"...","script.js":"..."}}
   ```

   Existing `html-css` and `html-js` envelopes remain byte-compatible.
4. Non-envelope/malformed text becomes `index.html`; CSS and JS become `''`.
   Missing requested envelope keys also default to `''`.
5. Resolve links literally and independently:
   - CSS: `link[rel="stylesheet"][href="style.css"]`
   - JS: `script[src="script.js"]`
   Query strings, absolute URLs, paths, and different names do not count;
   otherwise matching elements may have extra attributes.
6. Non-blank unlinked CSS shows the existing blue CSS hint and is not applied.
   Non-blank unlinked JS shows the blue JS hint and is not executed. A missing
   CSS link must not suppress linked JS; a missing JS link must not suppress
   linked CSS/HTML. If both are missing, show CSS then JS hints.
7. Use the existing outer sandbox DOM, not the static modes' nested
   `iframe sandbox=""`, so JS can interact with learner DOM and use the console.
8. Every Run performs this order:
   - clear `#root` and remove this mode's previous generated stylesheet;
   - parse the three-file envelope and `index.html` with `DOMParser`;
   - detect both exact markers before removing resource nodes;
   - remove every parsed `<script>` and stylesheet `<link>`;
   - when linked, inject `files.css` via one marked `<style>` element's
     `textContent` in `document.head`;
   - add missing-link hints, then import body children under `#root`;
   - when linked, run `new Function('root', files.js)(root)` in `try/catch`.
9. Mark generated CSS with a unique attribute such as
   `data-code-shoebox-html-css-js`; remove only that element on rerun. Inline
   learner `<style>` elements may still work and disappear with the old root.
10. All parsed script nodes are removed, including the marker. Inline, remote,
    data-URL, module, and differently named scripts never execute. Bundled JS
    is the only execution path.
11. Use native browser JavaScript. Keep `root`, `document`, and `window`; do not
    add Babel, TypeScript, JSX, ESM imports, packages, import maps, or CDNs.
12. Keep the mode manual-run. Do not add it to `isStaticHtmlMode`, live-preview
    debounce, or execute-on-iframe-load behavior.
13. Keep `SANDBOX_ATTRIBUTES` and message contracts unchanged. Never add
    `allow-same-origin`, another script-enabled iframe, new fixture semantics,
    or learner text interpolation into the generated outer `srcDoc`.
14. Ship a starter, selector, hash preset, gallery demo, prediction prompt, and
    docs with the mode.

## Current state

- `runtime/fileBundle.ts:18-24` defines two fixed filename tuples and types.
  `parseFileBundle(code, tuple)` is already generic, so add one tuple/type and
  serializer input shape rather than a new format.
- `components/CodingEnvironment.tsx:67-91` maps the two bounded modes to tuples,
  derives tab order, and parses one `code` string. Extend this configuration;
  do not create another editor.
- `components/CodeEditor.tsx:90-123` already creates a Monaco model per active
  filename and recognizes `.html`, `.css`, and `.js`; it should need no change.
- `runtime/runner.ts:121-210` has the two recipes to combine: `html-css`
  resolves CSS but uses a script-blocked nested frame; `html-js` removes
  scripts, imports body nodes, and manually executes bundled JS.
- `components/OutputFrame.tsx:47-52` intentionally limits static/live behavior
  to `html` and `html-css`. Leaving the new mode outside that set provides
  manual execution and console behavior.
- `hooks/useSandboxState.ts:22-43` contains the persisted allowlist and starter
  switch. Storage is already isolated by the mode suffix.
- `constants.ts:32-83`, `App.tsx:115-125`, `demoPresets.ts`, and `Demo.tsx`
  contain the starter, selector, hash-preset, and gallery exemplars.
- Public behavior is documented in `README.md`, `ENVIRONMENTS_README.md`,
  `CLAUDE.md`, and `template_descriptions/html-js.md`.
- Baseline at plan time: clean `npm ci`, typecheck, lint, 8 files / 78 tests,
  both builds, GitHub CI, and browser smoke all pass on `ea5c8a9`.

## Commands you will need

CI uses Node 22/npm 10. On this workstation, prefix commands with
`fnm exec --using 22.14.0`; elsewhere use an equivalent Node 22 environment.

| Purpose | Command | Expected |
|---|---|---|
| Install | `npm ci` | exit 0; lockfile unchanged |
| Typecheck | `npm run typecheck` | exit 0 |
| Bundle tests | `npx vitest run runtime/fileBundle.test.ts` | all pass |
| Runtime tests | `npx vitest run runtime/runner.test.ts` | all pass |
| Component tests | `npx vitest run components/CodingEnvironment.test.tsx components/OutputFrame.test.tsx` | all pass |
| State/preset tests | `npx vitest run hooks/useSandboxState.test.ts demoPresets.test.ts` | all pass |
| Full tests | `npm test` | all pass; more than 78 tests |
| Lint | `npm run lint` | exit 0 |
| Library build | `npm run build` | exit 0 |
| Demo build | `npm run build:demo` | exit 0 |
| Hygiene | `git diff --check` | exit 0, no output |

Existing Vite plugin deprecation warnings belong to plan 013 and are not a
failure when commands exit 0. Do not commit generated `dist/` or `.demo-site/`.

## Suggested executor toolkit

- `fnm-node` for Node/npm/npx commands on this machine.
- `vercel-react-best-practices` for tab/output component changes.
- `playwright` or the in-app browser for the final browser smoke test; recipe
  string tests do not prove real execution.

## Scope

### In scope

- `types.ts`, `runtime/types.ts`
- `runtime/fileBundle.ts`, `runtime/fileBundle.test.ts`
- `runtime/runner.ts`, `runtime/runner.test.ts`
- `components/CodingEnvironment.tsx`, its test
- `components/OutputFrame.test.tsx`
- `hooks/useSandboxState.ts`, its test
- `constants.ts`, `App.tsx`, `prompts.ts`
- `Demo.tsx`, `demoPresets.ts`, `demoPresets.test.ts`
- `README.md`, `ENVIRONMENTS_README.md`, `CLAUDE.md`
- new `template_descriptions/html-css-js.md`
- this plan and its row in `plans/README.md`

### Conditional scope

- `components/OutputFrame.tsx` only if the new focused test shows the existing
  manual path does not cover the mode; expected outcome is no production edit.
- `components/CodeEditor.tsx` only if a test proves a filename/language defect;
  expected outcome is no production edit.

### Out of scope

- Semantic changes to `html`, `html-css`, `html-js`, or `dom` beyond a minimal
  shared tuple/config refactor that preserves existing tests.
- Combining/deleting modes; generic filesystems; arbitrary files/folders; a
  new public `files` prop; envelope-version changes.
- HTML-authored scripts, remote/module scripts, or remote stylesheets in this
  mode. Parsed stylesheet links are removed after marker detection.
- Full `<head>`/title/meta/body-attribute fidelity or parser timing.
- TypeScript, JSX, packages, source maps, ESM/import maps, or CDNs.
- DOM fixture changes, relaxed sandbox flags, or live preview.
- New Playwright infrastructure, dependency upgrades, releases, publishing,
  push, PR, or merge unless separately requested.

## Git workflow

- Branch: `codex/016-html-css-js-mode`.
- Use imperative commits, e.g. `Add HTML CSS and JavaScript environment mode`.
- Do not push/open a PR unless instructed. Never commit generated build output.

## Steps

### Step 1: Extend the bounded bundle schema

Add this tuple in `runtime/fileBundle.ts`:

```ts
export const HTML_CSS_JS_FILE_NAMES = [
  'index.html', 'style.css', 'script.js',
] as const;
```

Include it in `WebFileName`, add `HtmlCssJsFileBundle`, and let
`serializeFileBundle` accept it. Keep `parseFileBundle(code)` defaulting to
`HTML_CSS_FILE_NAMES`; the generic tuple overload handles three files.

Test three-file round-trip with hostile delimiter text, plain-text fallback,
missing CSS/JS keys, and unchanged two-file behavior.

**Verify**: bundle tests pass.

### Step 2: Register the mode and starter

Add `'html-css-js'` to both environment unions, `VALID_MODES`, and
`getStarterCode`. Add `HTML_CSS_JS_STARTER_CODE`: HTML with both exact markers,
visible non-empty CSS, and JS that attaches one click handler, changes text,
and logs once.

Test starter equality, three non-empty files, both markers, and persistence at
`cs_lesson-1_code_html-css-js`.

**Verify**: state tests pass.

### Step 3: Add three editable tabs

Replace `CodingEnvironment`'s nested two-mode conditional with an explicit
bounded mode-to-tuple configuration:

```text
html-css     -> index.html, style.css
html-js      -> index.html, script.js
html-css-js  -> index.html, style.css, script.js
```

Preserve initial HTML tab, tuple order, whole-envelope serialization, other
file values, per-file Monaco models, prediction locking, and DOM fixture rules.

Test exact order, editability, HTML/CSS/JS languages, and preservation of both
inactive files after editing each tab.

**Verify**: coding-environment tests pass.

### Step 4: Add the combined sandbox recipe

Add `'html-css-js'` beside the bounded recipes in `runtime/runner.ts`, using
`HTML_RUNTIME_STYLES` and `showPlaceholder: false`. Inline-parse all three
files with the shared fallback semantics, then implement the locked cleanup,
marker detection, node removal, CSS injection, hints, body import, and JS
execution order. CSS must use `style.textContent`; JS must use the existing
`new Function` path, never a generated script element.

Add the mode to `ALL_MODES`. Test relative source order: parser -> both marker
selectors -> prior-style cleanup -> script/link removal -> CSS text/head
insertion -> body import -> JS execution. Assert both hints, source guard, no
`allow-same-origin`, no nested empty sandbox, no CDN, and existing modes green.

**Verify**: runner tests pass.

### Step 5: Prove manual execution and console behavior

Do not add the mode to `isStaticHtmlMode`. Model a new OutputFrame test after
the existing `html-js` case: iframe + console render; iframe load and a 500 ms
edit debounce execute nothing; incrementing `runTrigger` executes the exact
latest three-file envelope once. Leave production `OutputFrame.tsx` unchanged
if the test passes.

**Verify**: output-frame tests pass; static modes still live-preview.

### Step 6: Add selector, preset, prompt, and gallery demo

- Add the locked label after `html-js` in `App.tsx`.
- Add `html-css-js-tabs-demo` in `demoPresets.ts` with all three files, both
  markers, visible styling, click-driven text, and console logging.
- Test hash resolution, mode lookup, three-file parsing, both markers, and
  non-empty CSS/JS.
- Add a gallery section titled
  `Three Files (index.html + style.css + script.js)` using the unique key
  `demo_html_css_js_v1`; include it in Reset Persistence.
- Add a mode-specific prediction prompt about the click result.

**Verify**: preset tests pass.

### Step 7: Document the contract

Update the README feature list/example/public union, add a full environment
entry, update contributor architecture notes, and create
`template_descriptions/html-css-js.md`. Document exact independent links,
manual Run, console, DOM-under-`#root`, generated CSS cleanup, native JS only,
ignored head metadata/body attributes, and unsupported imports/packages.

Also document that `window`/`document` listeners and timers created by learner
JS are not automatically disposed between Runs, matching `html-js`.

**Verify**:
`rg -n "html-css-js|HTML, CSS & JavaScript" README.md ENVIRONMENTS_README.md CLAUDE.md template_descriptions/html-css-js.md`

### Step 8: Run gates and browser smoke

Run every command in the table, restore generated build output, then verify
scope and `git diff --check`. Start the demo at `#html-css-js-tabs-demo` and:

1. Confirm exact three-tab order and no automatic execution.
2. Run: page is styled; click changes text and logs.
3. Remove only CSS marker: CSS hint/un-styled page, but linked JS still works.
4. Remove only JS marker: JS hint/no behavior, but linked CSS still applies.
5. Remove both: two CSS-first hints, no bundled CSS or JS.
6. Add inline/remote scripts: neither executes.
7. Restore and Run twice: old learner DOM/generated CSS do not accumulate.
8. Recheck predecessor demos: `html-css` remains live/no-console; `html-js`
   remains manual/console.

Record the smoke result in the plan status when done.

## Test plan

- Bundle: three-file round-trip, fallback, missing keys, delimiter text.
- State: starter integrity and isolated persistence.
- Editor: tab order/languages/editability/cross-file preservation.
- Runner: parser/detection/cleanup/style/import/execute order and sandbox guards.
- Output: no load/debounce execution; exact manual execution; console visible.
- Preset: hash mapping and linked non-empty three-file bundle.
- Regression: all existing tests plus new tests; total greater than 78.
- Browser: both independent missing-link paths, successful interaction/log,
  rerun cleanup, malicious script suppression, predecessor modes.

## Done criteria

- [ ] Mode exists in both unions, persistence allowlist, and starter switch.
- [ ] Editor shows exactly three editable tabs in the locked order.
- [ ] Version-1 envelope round-trips three files without two-file regressions.
- [ ] CSS and JS resolve independently through exact markers.
- [ ] Parsed scripts/stylesheet links cannot create alternate paths.
- [ ] Every Run removes prior generated CSS and learner DOM before rebuilding.
- [ ] No execution occurs on iframe load or debounce; console is visible.
- [ ] Starter, selector, preset, prompt, gallery, and docs exist.
- [ ] `npm ci`, typecheck, lint, all tests, both builds, and smoke test pass.
- [ ] Test total is greater than 78; `git diff --check` exits 0.
- [ ] No generated or out-of-scope files are in the diff.
- [ ] Plan 016 is marked DONE with commit and verification summary.

## STOP conditions

Stop and report if:

- Drift invalidates the current bundle/tab/runner assumptions.
- Three files require changing `code: string` or the envelope version.
- The mode appears to need `allow-same-origin`, another script iframe,
  HTML-authored executable scripts, or learner interpolation into outer srcDoc.
- CSS/JS cannot resolve independently without changing predecessor behavior.
- A required edit falls outside scope, or a gate fails twice after one focused
  correction.
- Install changes dependency versions/lockfile, or browser behavior contradicts
  recipe string tests.

## Maintenance notes

- The iframe recipe cannot import `runtime/fileBundle.ts`; future envelope
  changes must update bounded recipes and both test files together.
- Review CSS cleanup carefully: remove only this mode's marked style, not shared
  runtime or DOM fixture styles.
- Preserve detection-before-removal and body-import-before-JS ordering.
- Root replacement removes node listeners, but global listeners/timers survive;
  realm reset is intentionally deferred.
- If another bounded combination is requested, plan a typed mode registry
  instead of adding another nested conditional.
