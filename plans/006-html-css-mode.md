# Plan 006: Add an HTML & CSS environment mode

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat d71625e..HEAD -- types.ts constants.ts runtime/runner.ts runtime/runner.test.ts runtime/templates/common.ts hooks/useSandboxState.ts components/CodeEditor.tsx components/CodingEnvironment.tsx components/OutputFrame.tsx demoPresets.ts`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding.
> **Expected drift**: this plan was written against `main` (d71625e), but the
> advisor stack 001–005 (merged via `advisor/005-small-fixes`) edits
> `runtime/runner.ts` (CDN pinning, plan 004) and `hooks/useSandboxState.ts`
> (localStorage validation, plan 005). Neither conflicts with this plan's
> *additions*, but step 4 has an extra sub-step that only applies post-005.
> Execute this plan **after** merging the advisor stack so `npm run typecheck`
> / `npm run lint` / the Vitest suite exist as gates.

## Status

- **Priority**: P2 (feature)
- **Effort**: M
- **Risk**: LOW (purely additive — no existing mode's recipe, kernel, or
  message protocol changes)
- **Depends on**: plans/001-verification-baseline.md (gates); benefits from
  005 being merged first (see drift note)
- **Planned at**: commit `d71625e`, 2026-06-11

## Goal

A new `'html'` environment mode ("HTML & CSS") where learners write markup
and styles in one editor and see them rendered live — the missing first rung
on the ladder below the `dom` mode. Today every mode assumes the learner
writes JavaScript; there is no way to teach selectors, the box model, or
flexbox without wrapping everything in `document.createElement`.

## Design decisions (made; alternatives at the bottom)

1. **One mode, one document.** The learner writes a single buffer containing
   HTML with embedded `<style>` blocks (and optionally a full
   `<!DOCTYPE html>` document — both are accepted). No second CSS editor
   pane: the whole architecture is one-string-of-code per mode
   (`useSandboxState` persists one `code` string per mode; `EXECUTE` carries
   one string), and a split HTML/CSS editor would be a much larger change for
   little pedagogical gain at this level.
2. **`<script>` tags are inert, by design.** This is the HTML/CSS learning
   mode; JS belongs in `dom`. The executor strips `<script>` tags and logs a
   one-line `console.warn` pointing the learner at the DOM mode, so the
   behavior is discoverable rather than silently confusing.
3. **Executor strategy: DOMParser + style hoisting.** `DOMParser` parses the
   buffer (handles fragments and full documents uniformly), user
   `<style>` and `<link rel="stylesheet">` elements are hoisted into the
   sandbox `<head>` tagged `data-user-style`, and the parsed `<body>`
   contents become `#root.innerHTML`. Hoisted nodes are removed at the start
   of every run, so re-runs don't accumulate styles. Nothing about the
   kernel, the MessageChannel bridge, or `BASE_HTML_WRAPPER` changes.
4. **Renders through `OutputFrame`** like every visual mode — it is neither a
   server mode (`startsWith('express'|'hono')` in
   `components/CodingEnvironment.tsx:89`) nor headless
   (`components/OutputFrame.tsx:36`), so **no component changes are needed**.
   The Console stays visible (it carries the script warning and parse
   errors).
5. **The recipe overrides `#root` layout.** `BASE_STYLES`
   (`runtime/templates/common.ts:26-36`) makes `#root` a centered flex
   column with padding — sensible for widgets, hostile to teaching layout.
   The recipe's `styles` field (same mechanism p5 uses,
   `runtime/runner.ts:16-35` / `:70`) resets `#root` to a plain block with no
   padding so the learner's CSS sees a neutral canvas. Learner CSS targeting
   `body` still works: their hoisted `<style>` lands after `BASE_STYLES` in
   the head, so it wins ties.

## Current state

- `types.ts:12` — the `EnvironmentMode` union; every mode is listed here.
- `runtime/runner.ts:43` — `ENV_RECIPES`; adding a mode is one entry here
  (per CLAUDE.md, no new files). The `dom` recipe (`:44-52`) is the closest
  exemplar; `p5` (`:67-86`) shows the `styles` field.
- `constants.ts` — one exported `*_STARTER_CODE` string per mode.
- `hooks/useSandboxState.ts:19-34` — `getStarterCode` switch.
- `components/CodeEditor.tsx:24-48` — `modelPath` extension switch and
  `language` memo (currently only `typescript`/`javascript`).
- `runtime/runner.test.ts:5-8` — `ALL_MODES` list driving the every-mode
  assertions.
- `ENVIRONMENTS_README.md`, `template_descriptions/*.md` — per-mode docs.
- `demoPresets.ts` + `Demo.tsx` — demo-only showcase (optional step).

## Steps

### 1. `types.ts` — extend the union

Add `'html'` to `EnvironmentMode` (line 12).

### 2. `runtime/runner.ts` — add the recipe

Add to `ENV_RECIPES`, placed before `dom` (it's the new simplest mode):

```ts
html: {
  name: "HTML & CSS",
  styles: `
    #root {
      display: block;
      padding: 0;
    }
  `,
  logic: `
    window.__RUN_MODE__ = (code, root) => {
      document.querySelectorAll('[data-user-style]').forEach(el => el.remove());
      root.innerHTML = '';
      try {
        const doc = new DOMParser().parseFromString(code, 'text/html');
        if (doc.querySelector('script')) {
          console.warn('<script> tags are ignored in HTML & CSS mode. Switch to the DOM mode to write JavaScript.');
          doc.querySelectorAll('script').forEach(el => el.remove());
        }
        doc.querySelectorAll('style, link[rel="stylesheet"]').forEach(el => {
          el.setAttribute('data-user-style', '');
          document.head.appendChild(el);
        });
        root.innerHTML = doc.body.innerHTML;
      } catch (e) { console.error(e); }
    };
  `
},
```

Notes for the executor:
- `appendChild` on a node from the parsed `doc` adopts and *moves* it, so
  it is simultaneously removed from `doc` — no separate `el.remove()` needed
  for the hoisted nodes.
- A `<link rel="stylesheet">` moved this way *is* fetched and applied (the
  sandbox already loads CDN scripts; this enables Google Fonts etc.).
- `DOMParser` never throws on bad HTML — the try/catch is belt-and-braces.
- Do **not** add `cdns`, `mocks`, or `babelPresets`; this mode loads nothing.

### 3. `constants.ts` — starter code

Add `HTML_STARTER_CODE` exercising the things the mode exists to teach
(comment, `<style>` block, classes, a flex layout), e.g.:

```html
<!-- Welcome to HTML & CSS!
     Write markup and styles together; press Run to render. -->

<style>
  .card {
    max-width: 320px;
    margin: 2rem auto;
    padding: 1.5rem;
    border-radius: 12px;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    color: white;
    font-family: sans-serif;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  }

  .card h1 { margin: 0 0 0.5rem; font-size: 1.4rem; }

  .tags { display: flex; gap: 0.5rem; }

  .tag {
    padding: 0.2rem 0.6rem;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.25);
    font-size: 0.8rem;
  }
</style>

<div class="card">
  <h1>Hello, HTML!</h1>
  <p>Change the markup or the styles above, then run again.</p>
  <div class="tags">
    <span class="tag">html</span>
    <span class="tag">css</span>
    <span class="tag">flexbox</span>
  </div>
</div>
```

### 4. `hooks/useSandboxState.ts` — starter lookup

Add `case 'html': return HTML_STARTER_CODE;` to `getStarterCode` and the
corresponding import. **Post-005 only**: plan 005 added localStorage
validation of the persisted mode value — make sure `'html'` is included in
whatever valid-mode list that validation uses (if it derives from the
`EnvironmentMode` union via an array, update that array).

### 5. `components/CodeEditor.tsx` — Monaco wiring

- `modelPath` switch: add `case 'html': return \`${basePath}.html\`;`.
- `language` memo: return `'html'` for the new mode before the ts/js
  fallthrough. Monaco ships HTML language support (tag completion,
  auto-closing, and CSS highlighting inside `<style>`) — no extra config or
  `addExtraLib` shim is needed; the `handleEditorDidMount` TS branch simply
  won't run.

### 6. Tests — `runtime/runner.test.ts`

- Add `'html'` to `ALL_MODES` (the every-mode invariants then cover it).
- Add a mode-specific test:
  - `getSandboxHtml('html')` contains `DOMParser` and `data-user-style`;
  - contains `id="placeholder"` (it's a visual mode);
  - does **not** contain `unpkg.com` / `esm.sh` / `cdnjs` (no CDNs).
- `hooks/useSandboxState.test.ts`: add one case asserting switching to
  `'html'` loads `HTML_STARTER_CODE` and persists under `cs_<key>_code_html`
  (mirrors the existing per-mode persistence tests).

### 7. Docs

- `ENVIRONMENTS_README.md`: add an entry following the existing per-mode
  format — engine: DOMParser + innerHTML (no transpiler, no CDNs);
  limitations: scripts inert, `<body>`/`<html>` attributes ignored, sandbox
  base styles apply underneath (overridable).
- `template_descriptions/html.md`: learner-facing capability doc in the
  style of `template_descriptions/dom.md`.

### 8. Demo wiring (optional but recommended)

- `demoPresets.ts`: add an `html-css-demo` preset (`mode: 'html'`) so
  `#html-css-demo` deep-links work; `demoPresets.test.ts` conventions apply.
- `Demo.tsx`: add a showcase section instantiating `useSandboxState` with
  `defaultMode: 'html'`, matching the existing sections.

### Explicitly out of scope (v1)

- The `{environmentMode}.script` filename label in
  `components/CodingEnvironment.tsx:114` will read `html.script` — cosmetic;
  fix only if trivial.
- `docs.ts` / HelpSidebar entry for HTML & CSS reference — follow-up.
- Executing learner `<script>` tags — deliberate non-goal (decision 2).

## Verification

1. `npm run typecheck && npm run lint` — clean (post-001 gates).
2. `npx vitest run` — all suites pass, including the new cases.
3. Manual (`npm run dev`): switch a shoebox to HTML & CSS →
   - starter card renders styled; placeholder gone after Run;
   - edit a color, Run twice → style updates, no duplicate `<style>`
     accumulation (inspect iframe head: exactly one `data-user-style` node
     per user style block);
   - paste a full `<!DOCTYPE html>` document → body content renders;
   - add a `<script>alert(1)</script>` → no alert, console shows the warn;
   - toggle dark mode → sandbox background flips where learner CSS doesn't
     override it;
   - switch html → dom → html → code persists per mode (with a
     `persistenceKey`).

## STOP conditions

- The drift check shows `runtime/templates/common.ts` kernel changes beyond
  plans 002/004 (the executor contract `__RUN_MODE__(code, root)` must hold).
- Monaco fails to provide the `html` language (would indicate a packaging
  change in `@monaco-editor/react`) — stop rather than hand-rolling a
  tokenizer.
- Any *existing* runner test fails after adding the recipe — the addition
  must be inert for other modes.

## Alternatives considered (and why not)

- **Separate CSS-only mode with a fixed HTML scaffold** (learner writes only
  CSS against provided markup): pedagogically interesting for drills, but it
  needs per-exercise scaffolds — better expressed later via
  `initialCodeOverride` + a locked-region concept than a global mode. Revisit
  as `'css'` if wanted; this plan's union/recipe shape doesn't preclude it.
- **Nested iframe with `srcdoc = code`** (true full-document semantics,
  scripts included): doubles the bridge problem — the inner document has no
  kernel, so console capture and theming break unless the kernel is injected
  into learner-controlled markup. Real complexity, and JS-in-HTML is a
  non-goal here.
- **Two-pane HTML + CSS editors**: changes the one-string `code` contract
  across `useSandboxState`, persistence keys, `EXECUTE`, and `CodeShoebox`
  props. Out of proportion for v1.
- **`root.innerHTML = code` with no parsing**: nearly works (innerHTML does
  apply `<style>` and inert scripts already), but full-document pastes dump
  `<head>` content as text, and there's no clean style-dedup story across
  runs. DOMParser costs ~10 lines and removes both problems.
