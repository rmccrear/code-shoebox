# Plan 006: Add an HTML & CSS environment mode

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 99962c1..HEAD -- types.ts constants.ts runtime/runner.ts runtime/runner.test.ts runtime/templates/common.ts hooks/useSandboxState.ts hooks/useSandboxState.test.ts components/CodeEditor.tsx components/CodingEnvironment.tsx components/OutputFrame.tsx components/PreviewContainer.tsx demoPresets.ts demoPresets.test.ts Demo.tsx`
> If any in-scope file changed since this plan was committed, compare the
> "Current state" excerpts against the live code before proceeding.

## Status

- **Priority**: P2 (feature)
- **Effort**: M
- **Risk**: LOW–MEDIUM (additive recipe + one new layout variant and a
  mode-gated live-preview effect in `OutputFrame`; no existing mode's
  recipe, kernel, or message protocol changes)
- **Depends on**: plans/001-verification-baseline.md (gates) — **satisfied**:
  the 001–005 stack is merged as of `2b74f8c`
- **Planned at**: `d71625e`, 2026-06-11; **design revised same day after
  maintainer review** (grill session) — supersedes the original
  DOMParser/style-hoisting design, recorded under "Design history"

## Goal

A new `'html'` environment mode ("HTML & CSS") where learners write a real
HTML document — markup and styles in one buffer — and see it rendered live.
This is the missing first rung below the `dom` mode: today every mode
assumes the learner writes JavaScript; there is no way to teach selectors,
the box model, or flexbox without `document.createElement`.

## Design decisions (all confirmed with the maintainer, 2026-06-11)

1. **Audience: pre-JS beginners.** The first rung in the progression, below
   `dom`. Everything below follows from this.
2. **One mode, one buffer.** The learner writes a single document; no split
   HTML/CSS panes (the whole architecture is one `code` string per mode).
   Mode id `'html'`, display name **"HTML & CSS"**.
3. **Verbatim rendering via a nested iframe.** The executor renders the
   learner's buffer as the `srcdoc` of an **inner iframe with
   `sandbox=""`** — their text IS the document, exactly like opening a saved
   `.html` file. `<html>`/`<head>`/`<body>` tags, `<title>`, `<meta>`, and
   `<body class/style>` attributes are all honored. Fragments without the
   skeleton also render fine (the browser auto-wraps them).
4. **Scripts never run — blocked by the browser, not by stripping.** An
   iframe with `sandbox=""` (no `allow-scripts`) cannot execute script at
   the platform level. Nested sandbox flag sets intersect, so the outer
   frame's `allow-scripts` does NOT leak in. We DOMParse a copy of the
   buffer *only to detect* `<script>` tags and show a warning.
5. **No console in this mode.** `OutputFrame` gets a third layout variant:
   full-height output, no splitter, no `Console` panel.
6. **The script warning is a banner in the output**, injected by the
   executor above the inner iframe: "⚠ `<script>` is ignored in HTML & CSS
   mode — switch to the DOM mode to write JavaScript." It disappears on the
   next render if the script is removed. No new message types.
7. **Plain white page, theme-independent.** The learner's page renders on a
   browser-default white canvas regardless of the shoebox dark/light theme.
   The inner iframe gives this almost for free (its document doesn't
   inherit kernel styles); the recipe sets an explicit white background on
   the frame because iframe canvases are otherwise transparent.
8. **External resources allowed.** `<link rel="stylesheet">`, Google Fonts,
   and `<img>` all work naturally inside the inner document — no new
   security surface beyond what CDN-loading modes already have.
9. **Live preview + Run.** The page re-renders ~500 ms (debounced) after
   the learner stops typing — uniquely safe in this mode because scripts
   can't run — AND the Run button still works as a manual re-render
   (maintainer: fallback "if our debounce doesn't work for some reason").
   The starter page renders immediately on mount, not after a first Run.
10. **Starter code: full document skeleton** (`<!DOCTYPE html>` through
    `</html>`), modeling real page structure from day one (step 3 below).
11. **Demo wiring included**: a `Demo.tsx` showcase section and an
    `#html-css-demo` hash preset.

## Current state

- `types.ts:12` — the `EnvironmentMode` union; every mode is listed here.
- `runtime/runner.ts:46` — `ENV_RECIPES`; adding a mode is one entry here
  (per CLAUDE.md, no new files). `p5` shows the `styles` field. CDN URLs
  are version-pinned (plan 004) — this mode adds none.
- `runtime/templates/common.ts` — `BASE_STYLES` makes `#root` a centered,
  padded flex column; the recipe must override this.
- `constants.ts` — one exported `*_STARTER_CODE` string per mode.
- `hooks/useSandboxState.ts:19-22` — `VALID_MODES` allow-list (plan 005)
  validating persisted mode values; `:24-39` — `getStarterCode` switch.
- `components/CodeEditor.tsx:24-48` — `modelPath` extension switch and
  `language` memo (currently only `typescript`/`javascript`).
- `components/OutputFrame.tsx` — `isHeadless` flag selects between the two
  existing layouts (iframe+splitter+console / full-height console); the
  `runTrigger` effect dispatches `EXECUTE`; `PreviewContainer` receives
  `isReady={runTrigger > 0}`.
- `components/PreviewContainer.tsx:26-32` — `isReady` only gates a cosmetic
  "Click 'Run Code' to execute" overlay (verified safe to bypass).
- `components/CodingEnvironment.tsx` — server modes routed by
  `startsWith('express'|'hono')`; `'html'` correctly falls through to
  `OutputFrame` with no change there.
- `runtime/runner.test.ts` — `ALL_MODES` list driving every-mode assertions.
- `demoPresets.ts`, `demoPresets.test.ts`, `Demo.tsx` — demo-only showcase.
- `ENVIRONMENTS_README.md`, `template_descriptions/*.md` — per-mode docs.

## Steps

### 1. `types.ts` — extend the union

Add `'html'` to `EnvironmentMode` (line 12).

### 2. `runtime/runner.ts` — add the recipe

Add to `ENV_RECIPES`, placed before `dom` (it's the new simplest mode):

```ts
html: {
  name: "HTML & CSS",
  showPlaceholder: false,
  styles: `
    #root {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      padding: 0;
    }
    .cs-script-banner {
      flex-shrink: 0;
      padding: 6px 12px;
      font-size: 12px;
      font-family: -apple-system, sans-serif;
      background: #fef3c7;
      color: #92400e;
      border-bottom: 1px solid #fcd34d;
    }
    .cs-html-frame {
      flex: 1;
      width: 100%;
      border: none;
      display: block;
      background: #fff;
    }
  `,
  logic: `
    window.__RUN_MODE__ = (code, root) => {
      root.innerHTML = '';
      const probe = new DOMParser().parseFromString(code, 'text/html');
      if (probe.querySelector('script')) {
        const banner = document.createElement('div');
        banner.className = 'cs-script-banner';
        banner.textContent = '\\u26a0 <script> is ignored in HTML & CSS mode \\u2014 switch to the DOM mode to write JavaScript.';
        root.appendChild(banner);
      }
      const frame = document.createElement('iframe');
      frame.setAttribute('sandbox', '');
      frame.className = 'cs-html-frame';
      frame.srcdoc = code;
      root.appendChild(frame);
    };
  `
},
```

Notes for the executor:
- **`sandbox=""` is the load-bearing attribute** — it is the
  script-blocking mechanism (decision 4). Do not "fix" it to allow
  anything. We do NOT strip `<script>` from the srcdoc; the browser
  inerts it.
- `code` travels via `EXECUTE` postMessage and is assigned to `srcdoc` as
  a DOM property — no string-escaping concerns.
- Re-renders replace the inner iframe wholesale; there is no cross-run
  state and no cleanup.
- Do **not** add `cdns`, `mocks`, or `babelPresets`; this mode loads
  nothing.
- `showPlaceholder: false` because the page renders on mount (decision 9).

### 3. `constants.ts` — starter code

Add `HTML_STARTER_CODE` — full document skeleton, exactly this content
(approved by maintainer):

```html
<!DOCTYPE html>
<html>
<head>
  <title>My First Page</title>
  <style>
    body {
      font-family: sans-serif;
      margin: 2rem;
    }
    h1 { color: #6366f1; }
    .highlight {
      background: #fef08a;
      padding: 0 4px;
    }
  </style>
</head>
<body>
  <h1>Hello, HTML!</h1>
  <p>This is a <span class="highlight">real
     web page</span>. Edit it and press Run.</p>
  <a href="https://developer.mozilla.org">
    Learn more at MDN</a>
</body>
</html>
```

### 4. `hooks/useSandboxState.ts` — starter lookup + validation

- Add `case 'html': return HTML_STARTER_CODE;` to `getStarterCode` plus
  the import.
- Add `'html'` to the `VALID_MODES` allow-list (`:19-22`).

### 5. `components/CodeEditor.tsx` — Monaco wiring

- `modelPath` switch: add `case 'html': return \`${basePath}.html\`;`.
- `language` memo: return `'html'` for the new mode before the ts/js
  fallthrough. Monaco ships HTML language support (tag completion,
  auto-closing, CSS highlighting inside `<style>`) — no extra config; the
  `handleEditorDidMount` TS branch simply won't run.

### 6. `components/OutputFrame.tsx` — hidden console + live preview

Three mode-gated changes (suggest `const isHtmlMode = environmentMode ===
'html';`):

a) **Hide the console.** When `isHtmlMode`, render the iframe at full
   height and skip the splitter grip and the `Console` panel (a third
   layout variant alongside visual/headless). Keep the MessageChannel
   wiring as-is — harmless, and keeps the kernel contract uniform.

b) **Initial render.** In `handleIframeLoad`, after `INIT_PORT`/`THEME`,
   if `isHtmlMode` dispatch `executeCodeInSandbox(contentWindow, code)` so
   the starter page appears on mount without a Run click. Pass
   `isReady={isHtmlMode || runTrigger > 0}` to `PreviewContainer`
   (verified: `isReady` only gates the cosmetic "Click 'Run Code'"
   overlay).

c) **Live preview.** A debounced effect; the existing `runTrigger` effect
   stays untouched (Run remains the manual re-render, decision 9):

```tsx
useEffect(() => {
  if (!isHtmlMode) return;
  const t = setTimeout(() => {
    if (iframeRef.current?.contentWindow) {
      executeCodeInSandbox(iframeRef.current.contentWindow, code);
    }
  }, 500);
  return () => clearTimeout(t);
}, [code, isHtmlMode]);
```

Double-execution when Run fires near a debounce tick is harmless
(idempotent srcdoc replacement).

### 7. Tests

`runtime/runner.test.ts`:
- Add `'html'` to `ALL_MODES` (every-mode invariants then cover it).
- Mode-specific test: `getSandboxHtml('html')` contains
  `setAttribute('sandbox', '')` and `cs-script-banner`; does **not**
  contain `id="placeholder"`; does **not** contain `unpkg.com` / `esm.sh`
  / `cdnjs` (no CDNs).

`hooks/useSandboxState.test.ts`:
- Switching to `'html'` loads `HTML_STARTER_CODE` and persists under
  `cs_<key>_code_html` (mirror existing per-mode persistence tests).

`demoPresets.test.ts`:
- Cover the new preset per existing conventions (hash resolution).

Per CLAUDE.md, live iframe behavior (inner-frame rendering, script
blocking, debounce) is **not** unit-testable — it's the manual checklist
below.

### 8. Docs

- `ENVIRONMENTS_README.md`: add an entry following the per-mode format —
  engine: nested `sandbox=""` iframe rendering the buffer verbatim (no
  transpiler, no CDNs); behaviors to document: scripts inert (banner),
  live preview + Run as manual re-render, plain white theme-independent
  page, external stylesheets/fonts/images allowed, **link clicks navigate
  the inner frame away and Run/typing brings the page back** (accepted
  behavior, not a bug).
- `template_descriptions/html.md`: learner-facing capability doc in the
  style of `template_descriptions/dom.md`.

### 9. Demo wiring

- `demoPresets.ts`: add an `html-css-demo` preset (`mode: 'html'`) with a
  small distinct example (not the starter), so `#html-css-demo` deep-links
  work.
- `Demo.tsx`: add a showcase section instantiating `useSandboxState` with
  `defaultMode: 'html'`, matching the existing sections.

### Explicitly out of scope (v1 — each confirmed with maintainer)

- **CSS-only drill mode** (fixed HTML scaffold, learner writes only CSS) —
  future `'css'` mode via `initialCodeOverride`/per-exercise scaffolds;
  nothing here precludes it.
- **HelpSidebar/docs.ts entry** — the docs button simply won't appear for
  this mode, same as several existing modes.
- **`html.script` filename label** in `CodingEnvironment` — cosmetic; fix
  to `index.html` only if trivial in passing.
- **Link-click guard** — clicking `<a href>` navigates the inner frame;
  accepted and documented (a guard would fight legitimate anchor
  teaching).
- **Executing learner `<script>` tags** — deliberate non-goal (decision 4).

## Verification

1. `npm run typecheck && npm run lint` — clean.
2. `npx vitest run` — all suites pass, including the new cases.
3. Manual (`npm run dev`), in the html demo section:
   - starter page renders **immediately on load**, styled, on a white page;
   - edit a CSS color, stop typing → page updates within ~1 s without Run;
   - press Run → page re-renders (manual fallback works);
   - toggle dark mode → the learner's page stays white; only the app
     chrome changes;
   - add `<body style="background: lavender">` → background changes (body
     attributes honored);
   - add `<script>alert(1)</script>` → no alert, amber banner appears
     above the page; remove it → banner gone on next render;
   - paste a bare fragment (no html/body skeleton) → still renders;
   - add `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Lobster&display=swap">`
     and use the font → it loads;
   - click the MDN link → inner frame navigates; press Run → page
     restored;
   - switch html → dom → html with a `persistenceKey` → code persists per
     mode; `localStorage` shows `cs_<key>_code_html`.

## STOP conditions

- The drift check shows kernel changes in `runtime/templates/common.ts`
  (the executor contract `__RUN_MODE__(code, root)` must hold).
- The nested `sandbox=""` iframe executes scripts in any tested browser
  (would falsify the security model — do not ship with tag-stripping as a
  patch; stop and report).
- `PreviewContainer`'s `isReady` turns out to gate more than the cosmetic
  overlay and html mode can't render on mount cleanly.
- Monaco fails to provide the `html` language (packaging change in
  `@monaco-editor/react`) — stop rather than hand-rolling a tokenizer.
- Any *existing* test fails after adding the recipe — the addition must be
  inert for other modes.

## Design history — alternatives considered (and why not)

- **DOMParser + style hoisting into the kernel document** (this plan's
  original design, superseded in maintainer review): parse the buffer,
  hoist `<style>`/`<link>` into the kernel `<head>` tagged for cleanup,
  render body contents into `#root`. Rejected: it drops `<body>`/`<html>`
  attributes, ignores `<title>`, needs per-run style cleanup, and fights
  the kernel's base styles. Its only advantages — kernel console capture
  and theming inside the learner page — were both explicitly removed from
  this mode (no console; theme-independent white page), leaving costs
  without benefits. The verbatim inner iframe also upgraded script
  blocking from "strip tags ourselves" to "browser-enforced sandbox".
- **Strip scripts + console.warn** (original warning design): superseded —
  the console is hidden in this mode, so the warning moved to an in-output
  banner and blocking moved to the iframe sandbox.
- **Separate CSS-only mode with a fixed HTML scaffold**: pedagogically
  interesting for drills, but needs per-exercise scaffolds — better
  expressed later via `initialCodeOverride`. Deferred, not precluded.
- **Two-pane HTML + CSS editors**: changes the one-string `code` contract
  across `useSandboxState`, persistence keys, `EXECUTE`, and `CodeShoebox`
  props. Out of proportion.
- **`root.innerHTML = code` with no parsing**: full-document pastes dump
  head content as text; no style-dedup story across runs.
