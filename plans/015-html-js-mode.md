# Plan 015: Add an editable HTML + JavaScript environment mode

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. Read the live files before editing because this plan is a handoff,
> not a substitute for checking current code. If anything in the "STOP
> conditions" section occurs, stop and report rather than widening scope. When
> finished, update this plan's row in `plans/README.md` unless a reviewer tells
> you they maintain the index.
>
> **Drift check (run first)**:
> `git diff --stat 98f454c..HEAD -- types.ts runtime/types.ts runtime/fileBundle.ts runtime/runner.ts components/CodingEnvironment.tsx components/CodeEditor.tsx components/OutputFrame.tsx hooks/useSandboxState.ts constants.ts App.tsx Demo.tsx demoPresets.ts prompts.ts README.md ENVIRONMENTS_README.md CLAUDE.md template_descriptions`
> The plan was prepared against commit `98f454c` on 2026-08-16. Drift is not
> automatically a blocker, but overlapping mode, file-bundle, editor-tab, or
> runtime changes must be read and reconciled before implementation.

## Status

- **Priority**: P1
- **Effort**: M-L
- **Risk**: MED (new persisted mode + multi-file editing + sandbox execution)
- **Depends on**: plans 007 and 014 (both DONE)
- **Category**: feature
- **Planned at**: commit `98f454c`, 2026-08-16
- **Implementation status**: DONE — merged as PR #4 at `ea5c8a9`; CI, 78
  tests, both builds, and the real-browser smoke test passed.

## Outcome

Add an `html-js` environment for exercises where the learner owns both the
page markup and the JavaScript behavior. The editor must expose exactly two
editable tabs:

```text
index.html | script.js
```

`script.js` runs only when `index.html` contains a literal
`<script src="script.js"></script>` connection. The page and console appear in
the existing sandbox output, JavaScript runs only when the learner presses
Run, and each run restores the current HTML before executing the current JS.

This fills the gap between:

- `html-css`, where both files are editable but JavaScript is intentionally
  blocked; and
- `dom` fixtures, where JavaScript is editable but the host owns read-only
  HTML/CSS.

## Locked design decisions

These decisions remove ambiguity for the executor.

1. Add one public environment identifier: `html-js`. Use the learner-facing
   label **HTML & JavaScript (script.js)**.
2. Show exactly two editable files in this order: `index.html`, `script.js`.
   Do not add `style.css`, file creation, deletion, renaming, folders, or a
   generic project explorer. Authors may use inline `style` attributes or a
   `<style>` element inside the body if an exercise needs incidental styling,
   but CSS authoring is not part of this mode.
3. Preserve the public `CodeShoebox` contract of one `code: string`. Store the
   two files in the existing version-1 JSON envelope:

   ```json
   {"__csFiles__":1,"files":{"index.html":"...","script.js":"..."}}
   ```

   Existing `html-css` envelopes must remain byte-compatible and parse exactly
   as they do now.
4. Treat a non-envelope string as `index.html` with an empty `script.js`, just
   as `html-css` treats it as HTML with an empty stylesheet. This is the
   backward-compatible fallback for direct consumers and stale saved data.
5. Use strict local-file linkage. Only a script element whose literal `src`
   attribute is exactly `script.js` connects the JS tab. Query it by attribute,
   not by the URL-resolved `.src` property. Additional attributes such as
   `defer` may be present, but this mode always executes the file after the
   learner body has been restored; it does not emulate parser-blocking,
   `async`, or `defer` timing.
6. If `script.js` is non-blank and no exact link exists, render the HTML but do
   not execute JS. Show a blue hint with the exact line to add:

   ```html
   <script src="script.js"></script>
   ```

7. Parse HTML with `DOMParser`, remove every `<script>` node from the parsed
   document before importing its body children into `#root`, and execute only
   the bundled `script.js` via `new Function('root', files.js)(root)`. Inline,
   remote, data-URL, and differently named script elements never execute in
   this mode. This keeps the dependency boundary explicit and avoids injecting
   learner text into iframe `srcDoc`.
8. Reuse the current `dom` execution semantics: learner code receives the
   `root` variable and can access the real sandbox `document` and `window`.
   The learner's `<body>` children live under `#root`; `<head>` metadata,
   document title, and body attributes are not reproduced. Document this
   limitation rather than silently promising full nested-document semantics.
9. Do not create a second inner iframe and do not relax
   `SANDBOX_ATTRIBUTES`. In particular, never add `allow-same-origin`. The
   existing outer iframe, kernel console bridge, runtime error formatting, and
   `postMessage` source guards remain the security boundary.
10. `html-js` is manual-run. Do not include it in the debounced static-HTML
    live-preview branch. It must show the existing console and preserve
    prediction-mode behavior so editing HTML cannot trigger side effects.
11. Every Run starts clean: clear prior learner DOM, rebuild it from the
    current `index.html`, then execute the current `script.js` once. Event
    listeners and DOM mutations from an earlier run must not survive on the
    removed learner nodes.
12. Keep the runtime message contract unchanged. The entire serialized bundle
    remains the `EXECUTE.code` string; do not introduce new public props or an
    execution payload for this mode. Existing `fixtureHtml`/`fixtureCss` props
    continue to apply only to `dom`.
13. Native browser JavaScript only: no Babel, TypeScript, JSX, npm packages,
    ESM `import`/`export`, import maps, or new CDNs.

## Current state

- `types.ts:12` and `runtime/types.ts:8` duplicate the `EnvironmentMode` union.
  Both contain `html`, `html-css`, and `dom`, but no `html-js`.
- `runtime/fileBundle.ts:16-34` fixes `WebFileBundle` to `index.html` plus
  `style.css`. `serializeFileBundle` writes a version-1 envelope and
  `parseFileBundle` gracefully falls back from plain text.
- `components/CodingEnvironment.tsx:19-104` already has all tab mechanics, but
  special-cases only `html-css` as an editable bundle. DOM fixture tabs reuse
  the same filenames but lock host-owned HTML/CSS.
- `components/CodeEditor.tsx:91-112` derives Monaco language from an active
  filename. Once `script.js` is supplied as `activeFile`, it already creates a
  JavaScript model without further language plumbing.
- `runtime/runner.ts:121-170` contains the `html-css` recipe. It parses an
  inline copy of the envelope, resolves only a literal `style.css` link, and
  renders through a nested `sandbox=""` iframe where scripts cannot execute.
- `runtime/runner.ts:171-197` contains the reusable DOM execution pattern:
  restore markup into `#root`, then run native JS with `new Function` so the
  existing kernel captures logs and errors.
- `components/OutputFrame.tsx:51-52` uses `isHtmlMode` for `html` and
  `html-css`. That flag simultaneously means live-preview, no console, ready
  before Run, and execute-on-load. `html-js` must not enter that branch; rename
  it to `isStaticHtmlMode` while preserving existing behavior.
- `hooks/useSandboxState.ts:21-45` duplicates the valid mode list and starter
  switch. Persistence is already per-mode through the
  `cs_<key>_code_<mode>` key shape.
- `App.tsx:115-119` exposes the static HTML modes and DOM mode in the Web & UI
  selector.
- `demoPresets.ts`, `Demo.tsx`, `README.md`, `ENVIRONMENTS_README.md`, and
  `template_descriptions/` provide the existing learner/demo/documentation
  patterns for a new mode.
- The verified baseline at plan time is: typecheck PASS, lint PASS, and 8 test
  files / 70 tests PASS. Vitest prints Vite React plugin deprecation warnings;
  those warnings are pre-existing and are not part of this plan.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Typecheck | `npm run typecheck` | exit 0, no TypeScript errors |
| Focused bundle tests | `npx vitest run runtime/fileBundle.test.ts` | all tests pass |
| Focused runtime tests | `npx vitest run runtime/runner.test.ts` | all tests pass |
| Focused component tests | `npx vitest run components/CodingEnvironment.test.tsx components/OutputFrame.test.tsx` | all tests pass |
| State/preset tests | `npx vitest run hooks/useSandboxState.test.ts demoPresets.test.ts` | all tests pass |
| Full tests | `npm test` | all test files pass; at least 78 tests total |
| Lint | `npm run lint` | exit 0 |
| Library build | `npm run build` | exit 0; CJS, ESM, declarations, and CSS produced in `dist/` |
| Demo build | `npm run build:demo` | exit 0; demo output produced in `.demo-site/` |
| Scope review | `git status --short` | only in-scope source/docs/tests plus `plans/README.md` and this plan |

The Vite/esbuild deprecation warnings seen during tests are an existing
toolchain concern tracked separately by plan 013. They are not a failure for
this plan if commands still exit 0.

## Scope

### In scope

- `types.ts`
- `runtime/types.ts`
- `runtime/fileBundle.ts`
- `runtime/fileBundle.test.ts`
- `runtime/runner.ts`
- `runtime/runner.test.ts`
- `components/CodingEnvironment.tsx`
- `components/CodingEnvironment.test.tsx`
- `components/OutputFrame.tsx`
- `components/OutputFrame.test.tsx`
- `components/CodeEditor.tsx` only if a small filename/model adjustment is
  actually required after tests; the current suffix logic should already work
- `hooks/useSandboxState.ts`
- `hooks/useSandboxState.test.ts`
- `constants.ts`
- `App.tsx`
- `Demo.tsx`
- `demoPresets.ts`
- `demoPresets.test.ts`
- `prompts.ts`
- `README.md`
- `ENVIRONMENTS_README.md`
- `CLAUDE.md`
- new `template_descriptions/html-js.md`
- `plans/README.md` status update

### Out of scope

- Changing `html`, `html-css`, or `dom` behavior beyond the minimal shared
  bundle/editor refactor needed to add `html-js`.
- Making DOM fixture HTML/CSS editable or routing `html-js` through fixture
  props.
- An `html-css-js` three-file mode or any third editable tab.
- A generic filesystem, project tree, arbitrary filenames, folders, file
  creation/deletion/renaming, or a new public file-array API.
- Executing inline or remote `<script>` elements from learner HTML.
- Full-document fidelity for learner `<head>`, `<title>`, `<meta>`, body
  attributes, parser timing, `async`, `defer`, or module scripts.
- TypeScript, JSX, source maps, packages, arbitrary dependency loading, ESM
  imports, or new CDN dependencies.
- Adding `allow-same-origin` or broadening any sandbox permission.
- Playwright infrastructure. Browser execution remains a documented manual
  smoke test in this slice.
- Version bumps, releases, tags, publishing, pushing, or opening a PR unless
  separately requested by the operator.
- Toolchain/dependency changes from plan 013.

## Git workflow

- Branch: `codex/015-html-js-mode`.
- Use small logical commits with imperative messages matching repository
  history, for example `Add HTML and JavaScript environment mode`.
- Do not push or open a pull request unless the operator explicitly asks.
- Do not commit generated `dist/` or `.demo-site/` output.

## Steps

### Step 1: Generalize the bounded file-bundle helper without changing its wire format

In `runtime/fileBundle.ts`, preserve `serializeFileBundle(files)` and the
`{"__csFiles__":1,"files":...}` envelope. Generalize parsing just enough to
support these two fixed schemas:

```ts
type HtmlCssFiles = {
  'index.html': string;
  'style.css': string;
};

type HtmlJsFiles = {
  'index.html': string;
  'script.js': string;
};
```

Use either typed overloads or a small generic helper that accepts an explicit
ordered filename tuple. Preserve the current one-argument
`parseFileBundle(code)` behavior as the `html-css` default so existing callers
and tests do not silently change. A suitable target contract is:

```ts
parseFileBundle(code) // index.html + style.css
parseFileBundle(code, ['index.html', 'script.js'] as const)
```

For every requested filename, coerce an envelope value with `String(...)` and
default a missing value to `''`. For non-envelope/malformed input, return the
raw code under `index.html` and empty strings for the other requested files.
Do not increment `__csFiles__`; the envelope already permits arbitrary named
entries and existing serialized values must remain valid.

In `runtime/fileBundle.test.ts`, retain every current test and add tests that:

- round-trip `index.html` + `script.js`, including quotes, braces, backslashes,
  template-literal characters, and a literal `</script>` inside JS;
- use the HTML/JS requested-file tuple when falling back from plain text; and
- tolerate a version-1 envelope with a missing `script.js` key.

**Verify**: `npx vitest run runtime/fileBundle.test.ts` -> all existing and new
bundle tests pass.

### Step 2: Register the mode and supply a valid starter bundle

Add `'html-js'` to both environment unions:

- `types.ts` (the public type); and
- `runtime/types.ts` (the runtime's currently duplicated type).

Add it to `VALID_MODES` in `hooks/useSandboxState.ts`. In `constants.ts`, add
`HTML_JS_STARTER_CODE` using `serializeFileBundle`. The starter must contain:

- a simple body control and output element;
- an exact `<script src="script.js"></script>` before `</body>`; and
- JavaScript that attaches an event listener and visibly changes the page,
  plus one `console.log` so both output surfaces are easy to verify.

Add a `getStarterCode('html-js')` branch. Update
`hooks/useSandboxState.test.ts` to prove that switching to `html-js`:

- returns `HTML_JS_STARTER_CODE`;
- parses into non-empty `index.html` and `script.js` files;
- contains the exact script link; and
- persists under `cs_lesson-1_code_html-js`.

Do not change persistence-key syntax or migrate other modes' saved code.

**Verify**: `npx vitest run hooks/useSandboxState.test.ts` -> all state tests
pass, including the new HTML/JS starter and persistence case.

### Step 3: Reuse the editable-tab UI for both bounded bundle modes

Refactor `components/CodingEnvironment.tsx` so bundle configuration is driven
by `environmentMode` rather than the single `isHtmlCssMode` boolean:

```ts
html-css -> ['index.html', 'style.css']
html-js  -> ['index.html', 'script.js']
```

Both bundle modes must:

- start on `index.html` after a mode/session remount;
- display tabs in the configured order;
- parse the single `code` string with the mode's expected filenames;
- update only the selected file before reserializing the whole envelope;
- keep both tabs editable unless prediction mode locks the entire editor; and
- retain a distinct Monaco model per filename so undo history and language
  services stay isolated across tab switches.

Do not disturb the separate DOM-fixture branch: it must still start on
editable `script.js`, show only supplied fixture files, and lock its HTML/CSS
tabs. Avoid turning the three known filenames into an open-ended file API.

`components/CodeEditor.tsx` already maps `.html`, `.css`, and `.js` active
filenames to the correct Monaco language. Change it only if the new focused
test demonstrates a real gap.

Extend `components/CodingEnvironment.test.tsx` with an `html-js` case modeled
after the existing `html-css` test. Assert:

- tabs are exactly `['index.html', 'script.js']`;
- the HTML tab is editable and uses language `html`;
- the JS tab is editable and uses language `javascript`;
- editing either file calls `onChange` with an envelope in which the other
  file is preserved; and
- DOM fixture lock behavior and HTML/CSS bundle behavior still pass unchanged.

**Verify**: `npx vitest run components/CodingEnvironment.test.tsx` -> all tab,
language, editability, serialization, routing, and fixture tests pass.

### Step 4: Add the sandbox recipe with strict script-link semantics

Add an `'html-js'` entry to `ENV_RECIPES` in `runtime/runner.ts`. Keep it in
the same registry; do not create a parallel runner file. Set its `styles` to
the existing `HTML_RUNTIME_STYLES` so the blue `.cs-hint-banner` is available.
The recipe logic must perform this order on every execution:

1. `root.replaceChildren()` to remove the prior learner DOM.
2. Parse the version-1 bundle with an inline plain-JS parser kept behaviorally
   synchronized with `runtime/fileBundle.ts`, selecting `index.html` and
   `script.js`.
3. Parse `index.html` through `DOMParser`.
4. Detect whether at least one element matches the literal attribute selector
   `script[src="script.js"]`.
5. Remove **all** script elements from the parsed document so learner HTML can
   never create a second execution path.
6. Import the parsed body child nodes into the real sandbox document and append
   them under `root` in source order.
7. If JS is non-blank but the exact link is missing, prepend or append a
   `.cs-hint-banner` explaining the exact tag to add, and stop without running
   JS.
8. If the exact link exists, execute `script.js` once with
   `new Function('root', files.js)(root)` inside `try/catch`, reporting through
   `console.error` exactly like the `dom` recipe.

Reuse the existing hint-banner styling without changing static HTML script
blocking. Do not set `innerHTML` from the entire raw envelope, concatenate JS
into a `<script>` string, create a nested `allow-scripts` iframe, interpolate
learner content into `getSandboxHtml`, or pass learner content through recipe
source strings.

Add `html-js` to `ALL_MODES` in `runtime/runner.test.ts`. Add a focused recipe
test that asserts generated sandbox HTML contains, in the required relative
order:

- the bundle marker parser;
- literal `script[src="script.js"]` detection;
- removal of parsed script nodes;
- body import/restoration; and
- `new Function('root', files.js)(root)`.

Also assert the recipe:

- includes the hint banner and exact missing-link guidance;
- includes no new CDN;
- retains the shared `event.source !== window.parent` guard;
- does not contain `allow-same-origin`; and
- does not use the static modes' inner `setAttribute('sandbox', '')` rendering
  path.

Keep the existing tests proving `html`/`html-css` scripts remain blocked and
the `dom` fixture order unchanged.

**Verify**: `npx vitest run runtime/runner.test.ts` -> every mode produces a
self-contained runner and all new strict-link/order/security assertions pass.

### Step 5: Keep HTML/JS manual-run and expose the console

In `components/OutputFrame.tsx`, rename `isHtmlMode` to
`isStaticHtmlMode` (or another equally explicit name) and leave its membership
as exactly:

```ts
environmentMode === 'html' || environmentMode === 'html-css'
```

Use the renamed flag at all current sites: initial readiness, live-preview
debounce, execute-on-iframe-load, splitter visibility, and console visibility.
Do not add `html-js` to this flag. It should therefore follow the visual DOM
path: no execution on mount or typing, execution when `runTrigger` increments,
visible console, and output marked ready after the first Run.

Extend `components/OutputFrame.test.tsx` to prove:

- `html-js` renders the visual iframe and console;
- loading the iframe does not execute the bundle;
- changing the bundle and advancing fake timers does not execute it; and
- incrementing `runTrigger` executes the exact serialized bundle once.

Retain the existing live-preview test for `html` and no-console assertion for
static HTML modes.

**Verify**: `npx vitest run components/OutputFrame.test.tsx` -> all output,
manual-run, live-preview, fixture, and MessageChannel tests pass.

### Step 6: Expose the mode in the demo app and hash presets

In `App.tsx`, add the mode to the Web & UI selector immediately after
`html-css`:

```tsx
<option value="html-js">HTML & JavaScript (script.js)</option>
```

In `prompts.ts`, add an `html-js` prediction prompt aligned with the starter
interaction (for example, ask what text changes after the learner activates
the control). Do not alter prompts for other modes.

In `demoPresets.ts`, add a unique `html-js-tabs-demo` preset containing a valid
two-file envelope and exact script link. Extend `demoPresets.test.ts` to prove
that the hash resolves to `html-js`, round-trips through
`getPresetHashForMode`, and parses into the expected two non-empty files.

In `Demo.tsx`, add one gallery sample adjacent to the existing HTML/HTML-CSS
sections. Give its `useSandboxState` instance a new unique persistence key,
include it in Reset All, label the section `Two Files (index.html +
script.js)`, and make the sample visibly demonstrate an event-driven DOM
change plus console output. Reuse existing layout and theme patterns; do not
redesign the gallery.

**Verify**:

- `npx vitest run demoPresets.test.ts` -> all preset tests pass.
- `npm run typecheck` -> the selector, prompt switch, preset, and gallery state
  are exhaustively typed with no errors.

### Step 7: Document the exact capability and its deliberate limits

Update `README.md`:

- add `html-js` to the feature list;
- add it to the `environmentMode` prop union (also correct that row if it still
  omits existing `html`/`html-css`/`p5-ts`/`p5play` modes); and
- add a short usage example showing `serializeFileBundle` only if that helper
  is publicly exported. If it is not exported (current state), show the hook's
  built-in starter/mode selection instead of documenting an inaccessible API.

Add a full `html-js` section to `ENVIRONMENTS_README.md` next to `html-css` and
`dom`. Document:

- two editable files and the version-1 envelope;
- strict literal script-link semantics and the missing-link hint;
- manual Run and visible console;
- native JS, real sandbox DOM, and `root`;
- fresh HTML restoration on each run;
- all non-bundled scripts being inert/removed;
- no module/import support or external dependency resolution; and
- body-under-`#root` semantics rather than a byte-verbatim full document.

Create `template_descriptions/html-js.md` following
`template_descriptions/html-css.md` and `template_descriptions/dom.md`. Make
the learner-facing guidance explicit: edit either tab, connect them with the
script tag, press Run, and use the console. Do not promise live preview.

Update `CLAUDE.md` so future runtime work knows:

- file bundles now serve two fixed schemas;
- `html-js` composes editable bundle tabs with DOM-style execution;
- it must remain manual-run and script-link-gated; and
- learner envelope contents must never be interpolated into iframe `srcDoc`.

**Verify**:

- `rg -n "html-js|HTML & JavaScript" README.md ENVIRONMENTS_README.md CLAUDE.md template_descriptions/html-js.md` -> each required documentation surface has a match.
- `rg -n "live preview" template_descriptions/html-js.md ENVIRONMENTS_README.md` -> no claim that HTML/JS auto-executes while typing; any match must explicitly say it does not.

### Step 8: Run full gates and perform the browser smoke test

Run the full automated gates in this order:

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm run build:demo
```

Expected: every command exits 0; all 8+ test files pass with at least 78 tests;
the library emits CJS/ESM/declarations/CSS; and the demo build completes.

Then run `npm run dev` and manually verify in a real browser:

1. Select **HTML & JavaScript (script.js)**; the tabs appear in the order
   `index.html`, `script.js`, both editable, starting on HTML.
2. Before Run, JavaScript has not executed and the console is present.
3. Press Run; the starter interaction works, a log appears, and no host/system
   page outside the sandbox changes.
4. Mutate the DOM through the interaction, then press Run again; the original
   HTML is restored before JS attaches its fresh listener.
5. Remove the exact script tag and Run; HTML renders, the blue hint appears,
   and JS does not execute.
6. Change the link to `main.js`; behavior remains unlinked.
7. Add an inline script and an absolute remote script; neither executes.
8. Put `throw new Error('html-js smoke')` in `script.js`; the visible console
   shows a readable error.
9. Switch tabs after edits; each tab retains its own Monaco undo/model state.
10. Reload with persistence enabled; saved HTML/JS and the `html-js` mode are
    restored.
11. Smoke `html`, `html-css`, plain `dom`, DOM fixtures, one React mode, and one
    headless mode to confirm their run/console/live-preview behavior did not
    change.

Finally inspect:

```bash
git status --short
git diff --check
```

Expected: no whitespace errors, no generated build artifacts staged or
tracked, and no unrelated source changes.

## Test plan

Add at least these regression cases, modeled after the named existing tests:

- `runtime/fileBundle.test.ts` — HTML/JS round-trip, hostile-looking learner
  text, plain fallback, and missing JS key; model after the current HTML/CSS
  round-trip/fallback tests.
- `hooks/useSandboxState.test.ts` — valid starter, dedicated persistence key,
  and mode switching; model after `switching to html-css loads a starter...`.
- `components/CodingEnvironment.test.tsx` — two editable tabs, language/model
  selection, and preservation of the inactive file; model after `preserves the
  two editable html-css files...`.
- `runtime/runner.test.ts` — registry inclusion, strict connection marker,
  reset/import/execute order, no CDN, source guard, and sandbox invariants;
  model after the existing HTML/CSS and DOM fixture recipe tests.
- `components/OutputFrame.test.tsx` — console visible, no mount/debounce
  execution, exact bundle executes on Run; model after the static HTML debounce
  and DOM run-trigger tests.
- `demoPresets.test.ts` — preset/hash round-trip and valid two-file bundle;
  model after the HTML/CSS preset test.

The automated tests deliberately assert generated runtime source rather than
executing it in jsdom. The manual browser smoke remains required because this
repository has no Playwright execution harness.

## Done criteria

- [ ] `html-js` exists in both environment unions, the state valid-mode list,
  runner registry/test mode list, selector, starter switch, and docs.
- [ ] `index.html` and `script.js` are exactly two ordered, editable Monaco
  tabs backed by one version-1 envelope.
- [ ] Existing HTML/CSS envelopes remain compatible and all prior tests pass.
- [ ] JS runs only after Run and only when HTML contains a literal
  `src="script.js"` connection.
- [ ] Every parsed HTML script node is removed; inline/remote/differently named
  scripts do not execute.
- [ ] Each Run restores current HTML before executing current JS once.
- [ ] The existing console shows `console.*`, synchronous errors, and rejected
  promises from `script.js` through the unchanged kernel bridge.
- [ ] No learner bundle content is interpolated into `srcDoc`; no sandbox
  permission or message-source guard is weakened.
- [ ] Static `html`/`html-css` live preview and no-console behavior is unchanged.
- [ ] DOM fixture tabs remain read-only and fixture execution remains unchanged.
- [ ] `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, and
  `npm run build:demo` all exit 0; at least 78 tests pass.
- [ ] The 11-step browser smoke test passes.
- [ ] `git diff --check` is clean and no generated artifacts are committed.
- [ ] This plan's `plans/README.md` row is updated to DONE with verification
  notes.

## STOP conditions

Stop and report; do not improvise if:

- An in-scope file has overlapping mode/bundle/runtime changes after commit
  `98f454c` that invalidate the current-state excerpts or locked decisions.
- Supporting HTML/JS appears to require `allow-same-origin`, a broader sandbox
  attribute, removal of `event.source` guards, or executing learner content in
  the host page.
- The proposed implementation would interpolate raw learner HTML/JS into
  `runtime/runner.ts` recipe source or the outer iframe `srcDoc`.
- Existing version-1 HTML/CSS bundles cannot remain backward-compatible while
  adding the second fixed schema.
- The implementation requires a public API beyond the `html-js` environment
  identifier and the existing `code` string.
- Correctness appears to require a generic filesystem/project abstraction, a
  third editable file, module loader, CDN, or dependency installer.
- HTML/JS can execute on mount or while typing after the output-host change,
  especially in prediction mode.
- Existing `html`, `html-css`, DOM fixture, React, or headless behavior changes
  in focused tests or browser smoke.
- A verification command fails twice after one reasonable in-scope correction.
- The only apparent fix requires editing an out-of-scope file; report the file
  and reason before widening scope.

## Maintenance notes

- Mode membership is duplicated today across `types.ts`, `runtime/types.ts`,
  `hooks/useSandboxState.ts`, the runner test's `ALL_MODES`, the demo selector,
  and documentation. Review this PR specifically for a missed registry.
- The iframe kernel cannot import `runtime/fileBundle.ts`, so the HTML/JS recipe
  will contain another small inline parser. Tests must lock its behavior to the
  shared helper. If more bundle modes arrive, consider a safe code-generation
  helper then; do not broaden this feature into that refactor now.
- `html-js` intentionally uses DOM-mode body-under-`#root` semantics. A future
  request for byte-verbatim full-document JS execution is a different security
  and console-bridging design, not a small extension of this mode.
- An eventual `html-css-js` mode should reuse the bounded bundle configuration
  introduced here, but it needs its own product decision about three-file
  linkage and is explicitly deferred.
- Reviewers should scrutinize three invariants: no auto-execution, no second
  script path from learner HTML, and no sandbox permission expansion.
