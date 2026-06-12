# Plan 007: Two-tab HTML & CSS mode (`index.html` + `style.css`)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: this plan was written against the
> *uncommitted* plan-006 implementation on `advisor/006-html-css-mode`
> (commit it first — see Sequencing). After that commit, run
> `git diff --stat <006-commit>..HEAD -- types.ts constants.ts runtime/ hooks/ components/ App.tsx demoPresets.ts Demo.tsx`
> and compare any changed in-scope file against the "Current state" notes.

## Status

- **Priority**: P2 (feature)
- **Effort**: M–L (first multi-file mode; touches the editor chrome, not
  just the recipe registry)
- **Risk**: MEDIUM — introduces a serialized two-file bundle inside the
  one-string `code` contract; the public `CodeShoebox` API does **not**
  change, but the bundle format becomes a persistence format
- **Depends on**: plan 006 (the `html` mode) — committed, since this reuses
  its recipe pattern, OutputFrame variant, and docs shape
- **Planned at**: 2026-06-11, on `advisor/006-html-css-mode` (006 complete
  in working tree)

## Goal

A new `'html-css'` environment mode: the editor shows **two tabs —
`index.html` and `style.css`** — and the rendered page resolves
`<link rel="stylesheet" href="style.css">` against the CSS tab. This is the
second rung after the single-file `html` mode: it introduces *file
separation* and the `<link>` tag, the first multi-file concept a web
learner meets.

Also in scope (maintainer request): the toolbar filename label for the
single-file `html` mode changes from `html.script` to **`index.html`**.

## Design decisions (confirmed with the maintainer, 2026-06-11)

1. **Exactly two files, fixed names.** One HTML file (`index.html`), one
   CSS file (`style.css`). No add/remove/rename of tabs — the constraint is
   the pedagogy (and the simplicity).
2. **Strict link semantics + hint.** The CSS tab applies **only** when the
   HTML actually contains `<link rel="stylesheet" href="style.css">` — real
   browser behavior, teaches the `<link>` tag. If `style.css` has content
   but is not linked, a banner above the page says:
   *"style.css isn't linked — add `<link rel="stylesheet" href="style.css">`
   inside `<head>`."*
3. **Coexists with the single-file mode.** `'html'` stays as rung one.
   Display names disambiguate: `'html'` → **"HTML (single file)"**,
   `'html-css'` → **"HTML & CSS (style.css)"** (dropdown + recipe `name`).
4. **The public API stays one string.** `code` remains a single string at
   every boundary (`CodeShoebox` props, `useSandboxState`, localStorage,
   presets, `EXECUTE`). The two files are serialized into it as a small
   JSON envelope (see "Bundle format"). **No breaking change** for
   consumers.
5. **Everything else inherits from the `html` mode**: nested
   `<iframe sandbox="">` rendering (scripts blocked by the browser), script
   banner, no console panel, plain white theme-independent page, live
   preview (debounced) + Run as manual re-render, render on mount.
6. **Only `style.css` resolves.** Other *relative* hrefs (`main.css`)
   resolve against `about:srcdoc` and silently do nothing — documented
   limitation. *Absolute* URLs (`https://fonts.googleapis.com/...`) still
   work, as in the `html` mode.

## Bundle format

New module `runtime/fileBundle.ts` (pure logic — unit-testable per the
repo's testing philosophy):

```ts
export interface WebFileBundle { 'index.html': string; 'style.css': string; }

export const serializeFileBundle = (files: WebFileBundle): string =>
  JSON.stringify({ __csFiles__: 1, files });

export const parseFileBundle = (code: string): WebFileBundle => {
  try {
    const parsed = JSON.parse(code);
    if (parsed && parsed.__csFiles__ === 1 && parsed.files) {
      return {
        'index.html': String(parsed.files['index.html'] ?? ''),
        'style.css': String(parsed.files['style.css'] ?? '')
      };
    }
  } catch { /* not an envelope */ }
  // Fallback: any plain string is a bare HTML document with no CSS file.
  return { 'index.html': code, 'style.css': '' };
};
```

Why JSON + fallback (alternatives at the bottom):
- Robust against any learner content (no delimiter collisions).
- The fallback makes hand-authored strings, `initialCodeOverride` values,
  and stale localStorage content degrade gracefully to "it's all
  index.html".
- The same parse logic is **duplicated in plain JS inside the recipe's
  `logic` string** — the iframe kernel cannot import TS modules. The two
  copies must stay in sync; both are tiny and covered by tests/assertions.

## Current state (after plan 006)

- `types.ts:12` and `runtime/types.ts:8` — **two** `EnvironmentMode`
  unions; both must gain `'html-css'` (006 learned this the easy way).
- `runtime/runner.ts` — `ENV_RECIPES.html` is the template for the new
  recipe: `sandbox=""` inner iframe, `cs-script-banner`, recipe `styles`.
- `components/OutputFrame.tsx` — `isHtmlMode = environmentMode === 'html'`
  gates the no-console layout, render-on-mount, and the 500 ms live-preview
  effect.
- `components/CodingEnvironment.tsx:109-112` — toolbar label
  `{environmentMode}.script`; `CodeEditor` gets the raw `code` string.
- `components/CodeEditor.tsx` — `modelPath` / `language` switches keyed on
  mode only (one model per mode+session).
- `hooks/useSandboxState.ts` — `VALID_MODES` allow-list + `getStarterCode`.
- `App.tsx:115-122` — "Web & UI" optgroup with `<option value="html">`.
- `constants.ts`, `demoPresets.ts`, `Demo.tsx`, `ENVIRONMENTS_README.md`,
  `template_descriptions/` — per-mode additions, same shape as 006.

## Steps

### 1. Types

Add `'html-css'` to **both** `EnvironmentMode` unions (`types.ts` and
`runtime/types.ts`).

### 2. `runtime/fileBundle.ts` + tests

Create the module exactly as in "Bundle format". Add
`runtime/fileBundle.test.ts`: round-trip, envelope parsing, plain-string
fallback, malformed-JSON fallback, missing-key tolerance.

### 3. `runtime/runner.ts` — the `html-css` recipe

Copy the `html` recipe's shape; the `logic` differs in three ways:
(1) parse the bundle, (2) resolve the link tag, (3) add the unlinked-CSS
hint banner. Reuse the `html` recipe's `styles` (extract to a shared
`HTML_RUNTIME_STYLES` const, like `P5_RUNTIME_STYLES`) plus a
`.cs-hint-banner` variant (blue/informational, vs the amber script
banner).

```js
window.__RUN_MODE__ = (code, root) => {
  root.innerHTML = '';
  // Inline copy of parseFileBundle (kernel JS cannot import modules).
  let files;
  try {
    const parsed = JSON.parse(code);
    files = (parsed && parsed.__csFiles__ === 1 && parsed.files)
      ? { html: String(parsed.files['index.html'] ?? ''), css: String(parsed.files['style.css'] ?? '') }
      : { html: code, css: '' };
  } catch (e) { files = { html: code, css: '' }; }

  const doc = new DOMParser().parseFromString(files.html, 'text/html');

  if (doc.querySelector('script')) { /* amber script banner, as in html mode */ }

  // Strict link semantics: only a literal style.css href resolves to the tab.
  const links = doc.querySelectorAll('link[rel="stylesheet"][href="style.css"]');
  links.forEach(link => {
    const style = doc.createElement('style');
    style.textContent = files.css;
    link.replaceWith(style);
  });
  if (links.length === 0 && files.css.trim()) {
    /* blue hint banner: style.css isn't linked — add
       <link rel="stylesheet" href="style.css"> inside <head> */
  }

  const frame = document.createElement('iframe');
  frame.setAttribute('sandbox', '');
  frame.className = 'cs-html-frame';
  frame.srcdoc = '<!DOCTYPE html>' + doc.documentElement.outerHTML;
  root.appendChild(frame);
};
```

Notes:
- `sandbox=""` remains the script-blocking mechanism — same warning comment
  as the `html` recipe.
- Unlike the `html` mode, the document is parsed and re-serialized (needed
  to splice the `<style>` in). DOMParser normalization is acceptable here;
  the single-file mode stays byte-verbatim.
- Banner text must use unicode escapes (`\\u26a0`) as in the 006 recipe.

### 4. Starters — `constants.ts`

Import `serializeFileBundle` and export:

```ts
export const HTML_CSS_STARTER_CODE = serializeFileBundle({
  'index.html': `<!DOCTYPE html>
<html>
<head>
  <title>Two Files</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <h1>Hello, style.css!</h1>
  <p>The styles for this page live in the <strong>style.css</strong> tab.</p>
</body>
</html>
`,
  'style.css': `body {
  font-family: sans-serif;
  margin: 2rem;
}

h1 {
  color: #6366f1;
}

strong {
  background: #fef08a;
  padding: 0 4px;
}
`});
```

### 5. State hook — `hooks/useSandboxState.ts`

Add `'html-css'` to `VALID_MODES`; add
`case 'html-css': return HTML_CSS_STARTER_CODE;` + import. Persistence is
free (the bundle is one string under `cs_<key>_code_html-css`).

### 6. Editor chrome — tabs + filename label

`components/CodingEnvironment.tsx`:
- `const isTabbedMode = environmentMode === 'html-css';`
- Local state `activeFile: 'index.html' | 'style.css'` (default
  `'index.html'`; resets naturally on remount via `sessionId` key).
- `const files = useMemo(() => parseFileBundle(code), [code]);`
- **Toolbar label region** (`:109-112`):
  - Tabbed mode: render two tab buttons (`index.html` / `style.css`) in
    place of the static label — active tab highlighted, same font-mono
    styling, clickable.
  - Other modes: replace `{environmentMode}.script` with a small
    `getDisplayFilename(mode)` helper — `'html'` → `index.html`, everything
    else keeps `${mode}.script` (maintainer request; broader renames out of
    scope).
- **Editor wiring** (tabbed mode only): pass the active file's content to
  `CodeEditor`; on change, re-serialize:
  `onChange(serializeFileBundle({ ...files, [activeFile]: newValue }))`.
  Other modes: unchanged pass-through.

`components/CodeEditor.tsx`:
- New optional prop `activeFile?: string` (only set by tabbed mode).
- `modelPath`: for `'html-css'`, `` `${basePath}-${activeFile}` `` — distinct
  Monaco models per tab preserve per-file undo history; the existing
  `key={modelPath}` remount handles switching.
- `language`: `'html-css'` → `activeFile === 'style.css' ? 'css' : 'html'`
  (Monaco ships CSS language support; no config needed).

### 7. Output side — `components/OutputFrame.tsx`

Widen the gate: `const isHtmlMode = environmentMode === 'html' ||
environmentMode === 'html-css';` — everything 006 built (no console,
render-on-mount, debounced live preview) then applies to both modes. The
live-preview effect already depends on `code`, which changes whichever tab
is edited.

### 8. Dropdown + demo

- `App.tsx` "Web & UI" optgroup: rename `html` option to
  **HTML (single file)**; add `<option value="html-css">HTML & CSS
  (style.css)</option>` directly below it.
- `demoPresets.ts`: `html-css-tabs-demo` preset — `code:
  serializeFileBundle({...})` (import the helper); keep the example small
  and distinct from the starter.
- `Demo.tsx`: add a gallery section (`useSandboxState('demo_html_css_v1',
  HTML_CSS_DEMO_CODE, 'html-css')`), wired into `handleResetAll`, placed
  right after the "Web Page (HTML & CSS)" section.

### 9. Tests

- `runtime/fileBundle.test.ts` — as in step 2.
- `runtime/runner.test.ts`: add `'html-css'` to `ALL_MODES`; mode test:
  contains `setAttribute('sandbox', '')`, `__csFiles__`,
  `link[rel="stylesheet"][href="style.css"]`, `cs-hint-banner`; no CDN
  hosts; no placeholder.
- `hooks/useSandboxState.test.ts`: switching to `'html-css'` loads
  `HTML_CSS_STARTER_CODE`; `parseFileBundle(starter)['style.css']` is
  non-empty (guards the constants stay a valid envelope).
- `demoPresets.test.ts`: resolve `html-css-tabs-demo`; parse its code as a
  valid bundle.
- Tab UI, link resolution in a real iframe, and per-tab undo are
  browser-layer — manual checklist below.

### 10. Docs

- `ENVIRONMENTS_README.md`: `html-css` entry under "Web & DOM" — bundle
  semantics, strict-link rule + hint banner, only-`style.css`-resolves
  limitation, everything else "as `html` mode".
- `template_descriptions/html-css.md`: learner-facing; LLM hints must say
  code is a JSON envelope of two files OR plain HTML (fallback), always
  include the `<link>` tag in examples, never suggest a second CSS file or
  other filenames.
- Update `template_descriptions/html.md` + dropdown-name references for the
  "HTML (single file)" rename.

### Out of scope (v1)

- More than two files, JS tab, renaming tabs, file tree UI.
- Auto-migrating single-file `html` code when switching to `html-css`
  (separate localStorage keys; each mode keeps its own buffer).
- Exposing `parseFileBundle`/`serializeFileBundle` from `export.ts` for
  consumers building presets — worth considering at release time; flag in
  review.
- Hinting on *other* relative hrefs (`main.css`) — documented limitation.

## Verification

1. `npm run typecheck && npm run lint && npx vitest run` — clean.
2. Manual (`npm run dev`):
   - dropdown shows "HTML (single file)" and "HTML & CSS (style.css)";
   - single-file `html` toolbar now reads `index.html`;
   - new mode: two tabs render; starter page shows styled content on load;
   - edit `style.css` → page live-updates without switching tabs back;
   - per-tab undo: type in each tab, Cmd+Z only affects the active tab;
   - delete the `<link>` line → styles vanish AND the blue hint banner
     appears; restore it → styles + no banner;
   - empty the CSS tab and remove the link → no hint banner (nothing to
     link);
   - `<script>` in the HTML tab → amber banner, no execution;
   - Run button still force-re-renders; Reset restores both tabs;
   - reload the page → both tabs persist (one localStorage key);
   - switch html-css → html → html-css → buffers are independent.

## STOP conditions

- The recipe's inline bundle parser and `runtime/fileBundle.ts` produce
  different results for any test fixture — fix the drift before
  proceeding.
- Monaco loses undo history or content when switching tabs (model-path
  approach failing) — stop and report rather than switching to a
  single-model value-swap.
- Any plan-006 behavior regresses in the single-file `html` mode (it
  shares `OutputFrame` gates and recipe styles).
- The nested `sandbox=""` iframe executes scripts (same as 006).

## Sequencing

Commit the plan-006 work on `advisor/006-html-css-mode` first (this plan
builds directly on it — recipe pattern, OutputFrame gate, docs). Then
implement 007 on its own branch off that.

## Alternatives considered (and why not)

- **Change the public API to multi-file** (`code: Record<string,string>`)
  — breaks every consumer, persistence key shape, presets, and the
  `EXECUTE` protocol for one mode's benefit. The envelope keeps the
  one-string contract intact and invisible to existing integrations.
- **Delimiter-based bundle** (`/* === style.css === */`) — human-readable
  in localStorage, but learner content can collide with any delimiter;
  JSON cannot collide and the plain-string fallback preserves the
  readable case where it matters (hand-authored single-file content).
- **Host-side link resolution** (compose final HTML in `OutputFrame`
  before EXECUTE, reuse the `html` recipe verbatim) — keeps the kernel
  simpler but moves per-mode execution semantics out of the recipe
  registry, which CLAUDE.md establishes as the single source of truth per
  mode. The inline parser duplication is the lesser evil.
- **Auto-injecting the CSS without a link tag** — rejected by maintainer:
  teaches a falsehood; strict + hint banner chosen instead.
- **One Monaco model with value swapping on tab switch** — loses per-file
  undo stacks; distinct model paths are the supported Monaco pattern and
  the repo already remounts on `path` change.
