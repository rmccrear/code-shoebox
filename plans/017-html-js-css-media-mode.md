# Plan 017: Add a four-tab HTML + CSS + JavaScript + Media mode

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving on. Read
> the live files before editing. If a STOP condition occurs, report it instead
> of widening scope. When done, update this plan's row in `plans/README.md`
> unless a reviewer maintains the index.
>
> **Drift check (run first)**:
> `git diff --stat 1a18475..HEAD -- types.ts runtime/types.ts runtime/runner.ts components/CodeShoebox.tsx components/CodingEnvironment.tsx components/OutputFrame.tsx hooks/useSandboxState.ts constants.ts App.tsx Demo.tsx demoPresets.ts prompts.ts README.md ENVIRONMENTS_README.md CLAUDE.md template_descriptions`
> This plan was prepared against the Plan 016 feature commit `1a18475` on
> 2026-08-16. It depends on that commit even though PR #5 was still a draft when
> the plan was written. Reconcile any overlapping mode, tab, runner, demo, or
> documentation drift before implementation.

## Status

- **Priority**: P1
- **Effort**: M–L
- **Risk**: MED (new public prop, non-editor tab UI, media loading, and another
  persisted execution mode)
- **Depends on**: plan 016 (DONE in draft PR #5 at `1a18475`)
- **Category**: feature
- **Planned at**: commit `1a18475`, 2026-08-16
- **Implementation status**: TODO

## Why this matters

The three-file `html-css-js` environment lets learners build a complete web
page, but lessons cannot place images, audio, or video beside the code as
discoverable, read-only resources. This mode adds a bounded media shelf without
turning CodeShoebox into an upload manager or generic filesystem: the host
supplies one to three assets, learners preview them in one fourth top-level tab,
and copy the shown HTML/CSS/JavaScript snippets into the existing editable
files.

```text
index.html | style.css | script.js | Media
                                      ├── image asset
                                      ├── audio asset
                                      └── video asset
```

The media descriptors are host state, not learner code. The version-1 code
envelope stays a three-file string, and the sandbox keeps using the verified
Plan 016 execution recipe.

## Outcome

Add public mode `html-js-css-media` with exactly four top-level tabs in this
order:

1. `index.html` — editable
2. `style.css` — editable
3. `script.js` — editable
4. `Media` — read-only, containing up to three asset sub-tabs

The Media tab previews the selected image, audio, or video and shows safe,
language-labelled usage snippets. Images get HTML and CSS snippets. Audio and
video get HTML and JavaScript snippets, including a native playback example.
The output remains manual-run with the existing console.

## Locked design decisions

1. Use the requested public identifier `'html-js-css-media'` and the
   learner-facing label **HTML, CSS, JavaScript & Media (4 tabs)**. The public
   identifier is intentionally not reordered; the visible code tabs retain the
   established HTML/CSS/JS order.
2. Add and export this discriminated public type from `types.ts`:

   ```ts
   export type MediaAsset =
     | { kind: 'image'; name: string; src: string; alt: string }
     | { kind: 'audio'; name: string; src: string }
     | { kind: 'video'; name: string; src: string };
   ```

   Add `mediaAssets?: readonly MediaAsset[]` to `CodeShoeboxProps`. Do not add
   uploads, `File` objects, binary serialization, MIME sniffing, or asset
   mutation callbacks.
3. `mediaAssets` is honored only in `html-js-css-media`. Other modes ignore it.
   The supported contract is one to three assets. Zero assets renders a clear
   read-only empty state. If a JavaScript caller supplies more than three, show
   only the first three and display a small “Only the first 3 assets are shown”
   notice; never crash or silently create extra tabs.
4. Keep media out of `code`, localStorage, `runtime/fileBundle.ts`, iframe
   messages, and sandbox `srcDoc`. The code value remains the existing envelope:

   ```json
   {"__csFiles__":1,"files":{"index.html":"...","style.css":"...","script.js":"..."}}
   ```

5. Media source strings are host-authored URLs. Render them only through native
   React `src` attributes and as text inside snippets. Do not use
   `dangerouslySetInnerHTML`, fetch media into JavaScript, or interpolate asset
   data into the sandbox bootstrap document.
6. Media content is never editable. When `Media` is selected, do not mount
   Monaco, do not expose a textarea/contenteditable surface, and do not call
   `onCodeChange`. Asset sub-tabs only choose which supplied descriptor to
   preview.
7. Render previews with native elements and no autoplay:
   - image: `<img>` with the required host-supplied `alt`;
   - audio: `<audio controls preload="metadata">` with an accessible label;
   - video: `<video controls preload="metadata">` with an accessible label.
   Keep previews contained within the editor pane and surface a readable load
   error without affecting other asset tabs.
8. Generate these snippet categories:
   - image HTML: `<img src="…" alt="…">`;
   - image CSS: `.media-image { background-image: url("…"); }`;
   - audio HTML: `<audio controls src="…"></audio>`;
   - audio JavaScript: `const audio = new Audio(…);` followed by
     `void audio.play();`;
   - video HTML: `<video controls src="…"></video>` with a stable id included
     if the JavaScript snippet targets it;
   - video JavaScript: select that video and call `play()` safely.
9. Snippets are display text, not executable UI. Escape HTML attribute values,
   CSS string values, and JavaScript strings for their target language. Use
   `JSON.stringify(src)` for JavaScript string literals. Tests must include
   quotes, ampersands, backslashes, and newlines so copied snippets remain
   syntactically bounded. Do not add a clipboard feature in this plan.
10. Reuse the `html-css-js` sandbox recipe rather than copying it. Extract the
    existing recipe into one constant if necessary, then register both mode ids
    against it (a shallow copy may change only the diagnostic `name`). Keep its
    exact marker semantics, cleanup order, script suppression, and security
    properties.
11. Keep this mode manual-run with console output. Do not add it to
    `isStaticHtmlMode`, live-preview debounce, or execute-on-iframe-load.
12. Preserve `SANDBOX_ATTRIBUTES = 'allow-scripts'`. Never add
    `allow-same-origin`, media-specific iframe permissions, autoplay, a second
    script-enabled iframe, or a new execution payload.
13. Add a distinct starter that tells learners to open Media and paste a
    snippet, while retaining the exact local `style.css` and `script.js`
    markers. The starter must still work when no assets are supplied.
14. Ship the selector option, persistence support, prediction prompt, hash
    preset, gallery demo, tests, and full documentation in the same change.

## Current state

- `types.ts:6-27` defines the public `EnvironmentMode` union and
  `CodeShoeboxProps`. The only host-owned lesson resources today are the DOM
  fixture strings. This is the public API boundary for `MediaAsset` and
  `mediaAssets`.
- `components/CodeShoebox.tsx:6-71` forwards public props to
  `CodingEnvironment`; media should follow the existing fixture prop path only
  as far as the editor UI, not into `OutputFrame`.
- `components/CodingEnvironment.tsx:25-31` has a three-entry bounded
  `EDITABLE_BUNDLE_FILES` registry, and lines 74-117 derive visible editable
  files and serialize the selected one. Extend this to a typed workspace-mode
  configuration with a `hasMediaTab` flag instead of adding another nested
  conditional.
- `components/CodingEnvironment.tsx:175-251` renders file tabs and always mounts
  `CodeEditor`. It needs a workspace-tab union (`EditorFileName | 'media'`) and
  a branch that renders a dedicated `MediaPanel` for the fourth tab.
- `components/CodeEditor.tsx:90-124` already selects deterministic Monaco
  models and languages for `.html`, `.css`, and `.js`; it should not change.
- `runtime/fileBundle.ts` already supports the exact three editable files via
  `HTML_CSS_JS_FILE_NAMES`; no bundle change is needed.
- `runtime/runner.ts:211-267` contains the verified `html-css-js` recipe. The
  media mode needs an alias to that recipe, not media-aware execution code.
- `components/OutputFrame.tsx:47-52` limits live/no-console rendering to
  `html` and `html-css`. Leaving the new mode outside that set provides the
  required manual execution and console behavior.
- `hooks/useSandboxState.ts:23-46` owns the persisted-mode allowlist and starter
  switch. Storage is already isolated by the mode suffix.
- `demoPresets.ts` maps one hash preset per mode; `App.tsx` consumes the preset
  mode/code and renders `CodeShoebox`; `Demo.tsx:408-480` demonstrates each
  bounded mode with an isolated persistence key.
- Plan 016's baseline at `1a18475`: clean install, typecheck, lint, 86 tests,
  both builds, GitHub CI, and browser smoke all passed.

## Commands you will need

CI uses Node 22/npm 10. On this workstation prefix Node commands with
`fnm exec --using 22.14.0`; elsewhere use an equivalent Node 22 environment.

| Purpose | Command | Expected |
|---|---|---|
| Install | `npm ci` | exit 0; lockfile unchanged |
| Media UI tests | `npx vitest run components/MediaPanel.test.tsx` | all pass |
| Editor tests | `npx vitest run components/CodingEnvironment.test.tsx` | all pass |
| Runtime/output tests | `npx vitest run runtime/runner.test.ts components/OutputFrame.test.tsx` | all pass |
| State/preset tests | `npx vitest run hooks/useSandboxState.test.ts demoPresets.test.ts` | all pass |
| Typecheck | `npm run typecheck` | exit 0 |
| Lint | `npm run lint` | exit 0 |
| Full tests | `npm test` | all pass; more than 86 tests |
| Library build | `npm run build` | exit 0 |
| Demo build | `npm run build:demo` | exit 0 |
| Hygiene | `git diff --check` | exit 0, no output |

Existing Vite plugin deprecation warnings belong to plan 013 and are not a
failure when commands exit 0. Do not commit generated `dist/` or `.demo-site/`.

## Suggested executor toolkit

- `fnm-node` for every Node/npm/npx command on this workstation.
- `vercel-react-best-practices` for the tab state and media component work.
- `playwright` or the in-app browser for the required real-browser media and
  sandbox smoke test. jsdom does not prove media loading or playback controls.
- `github:yeet` only if the operator asks to publish the finished branch.

## Scope

### In scope

- `types.ts`, `runtime/types.ts`
- `runtime/runner.ts`, `runtime/runner.test.ts`
- `components/CodeShoebox.tsx`
- `components/CodingEnvironment.tsx`, `components/CodingEnvironment.test.tsx`
- new `components/MediaPanel.tsx`
- new `components/MediaPanel.test.tsx`
- `components/OutputFrame.test.tsx`
- `hooks/useSandboxState.ts`, `hooks/useSandboxState.test.ts`
- `constants.ts`, `App.tsx`, `prompts.ts`
- `Demo.tsx`, `demoPresets.ts`, `demoPresets.test.ts`
- `README.md`, `ENVIRONMENTS_README.md`, `CLAUDE.md`
- new `template_descriptions/html-js-css-media.md`
- this plan and its row in `plans/README.md`

### Conditional scope

- `components/OutputFrame.tsx` only if the focused manual-run test proves the
  current classification does not cover the mode; expected outcome is no
  production edit.
- `components/CodeEditor.tsx` only if a test proves it is mounted or mutated by
  the Media tab; expected outcome is no production edit.
- Demo-only static media files under `public/demo-media/` only if the executor
  chooses repository-owned fixtures instead of the locked remote demo URLs
  below. Do not add both approaches.

### Out of scope

- Uploads, file pickers, drag/drop, recording, transcoding, media editing,
  deletion, renaming, folders, or arbitrary learner-created assets.
- Storing media bytes/descriptors in the version-1 bundle or localStorage.
- Adding a fifth top-level tab or more than three asset sub-tabs.
- MIME sniffing, format conversion, custom media players, waveforms, canvas
  analysis, captions tracks, posters, playlists, or autoplay.
- Proxying/caching remote assets, relaxing CORS, or promising that cross-origin
  media can be read through canvas/Web Audio APIs.
- Semantic changes to existing modes, code envelope version, DOM fixtures,
  sandbox messages, sandbox flags, or predecessor demo hashes.
- TypeScript/JSX/packages/import maps/CDNs for learner code.
- Dependency upgrades, releases, publishing, push, PR, or merge unless
  separately requested.

## Git workflow

- Create `codex/017-html-js-css-media-mode` from `1a18475`. Do not base it on
  `main` until Plan 016/PR #5 has landed.
- Use an imperative commit such as
  `Add HTML CSS JavaScript and media environment mode`.
- If publishing before PR #5 merges, open a stacked draft PR whose base is
  `codex/016-html-css-js-mode`; retarget it to `main` after PR #5 merges.
- Do not commit generated build output.

## Steps

### Step 1: Add the public mode and media descriptor contract

Add `'html-js-css-media'` to both environment unions. Export the locked
`MediaAsset` discriminated union and add `mediaAssets?: readonly MediaAsset[]`
to `CodeShoeboxProps`, with documentation that the first three host-authored
assets are shown only in this mode.

Thread the prop through `CodeShoebox` to `CodingEnvironment`. Do not pass it to
`OutputFrame` or add it to any execution ref/message.

**Verify**: `npm run typecheck` exits 0 after the mode is registered in every
exhaustive/allowlist site touched by later steps.

### Step 2: Build the read-only Media panel test-first

Create `components/MediaPanel.tsx` with props for `mediaAssets` and
`themeMode`. Keep selection local to the panel and clamp/reset it when the
bounded asset list changes. Render:

- an empty state for zero assets;
- one asset sub-tab per first-three descriptor, labelled by `name` and marked
  read-only/locked;
- the selected native preview with controls where applicable;
- a per-preview load error state;
- language-labelled `<pre><code>` snippets matching the locked matrix;
- an explicit truncation notice when the input contains more than three.

Keep snippet escaping in small pure helpers in the same module unless the file
becomes unwieldy. Never render snippet strings as markup. Use stable index-based
internal ids so duplicate display names do not break React keys or tab
selection.

Write `MediaPanel.test.tsx` first/alongside it. Cover zero, one, exactly three,
and four descriptors; image/audio/video native elements; no autoplay; asset
switching; accessible labels; image alt; load error; truncation notice; and
hostile strings in every snippet language. Assert the panel contains no
textarea/contenteditable and calls no editing callback (the component should
not accept one).

**Verify**: media UI tests pass.

### Step 3: Add the fourth top-level tab without changing the bundle

In `CodingEnvironment`, replace `EDITABLE_BUNDLE_FILES` with a typed config
that can express `{ files: HTML_CSS_JS_FILE_NAMES, hasMediaTab: true }`. Define
`WorkspaceTab = EditorFileName | 'media'`, but keep parsing/serialization typed
only to `EditorFileName`.

For the new mode, render exact top-level labels in order:

```text
index.html | style.css | script.js | Media
```

Use the existing active-tab pattern for the three files. When `media` is
selected, render `MediaPanel` in place of `CodeEditor`; when a code tab is
selected, preserve existing Monaco model/language/undo behavior. Make the tab
strip horizontally scrollable rather than wrapping or squeezing the Run/layout
controls on narrow widths. The Media tab and asset sub-tabs should expose
selected state (`aria-selected` or equivalent) and a lock/read-only cue.

Extend `CodingEnvironment.test.tsx` to prove exact order, three editable
languages, code preservation across all four top-level tabs, no `onChange`
from Media interactions, the first-three cap, and that `mediaAssets` is ignored
by `html-css-js` and unrelated modes.

**Verify**: editor tests pass.

### Step 4: Reuse the three-file sandbox recipe

Register `html-js-css-media` in `runtime/runner.ts` and `ALL_MODES`. Extract the
current `html-css-js` recipe to a constant and reuse it; do not copy its logic
string. A shallow object copy may change only its descriptive `name`.

Extend `runtime/runner.test.ts` to prove the two modes retain the same parser,
exact link detection, generated-style cleanup, parsed script/link removal,
body import, bundled-JS execution, and missing-link hints. Reassert no
`allow-same-origin`, no nested script iframe, no media payload/interpolation,
and no CDN addition.

Add an `OutputFrame` regression test modeled on the Plan 016 case: iframe and
console render; iframe load and a 500 ms code edit execute nothing; incrementing
`runTrigger` executes the exact latest three-file envelope once. Leave
`OutputFrame.tsx` unchanged if this passes.

**Verify**: runtime/output tests pass.

### Step 5: Add starter and persistence behavior

Add `HTML_JS_CSS_MEDIA_STARTER_CODE` as a distinct three-file envelope. HTML
must include the exact local CSS/JS markers and a visible `#media-gallery`
placeholder explaining that Media snippets can be pasted there. CSS should
style the placeholder, and JS should attach one harmless interaction/log so
the starter works even with zero assets.

Add the mode to `VALID_MODES` and `getStarterCode`. Test starter parsing,
non-empty files, exact markers, isolated persistence key
`cs_lesson-1_code_html-js-css-media`, reset, and rejection of an unknown saved
mode.

**Verify**: state tests pass.

### Step 6: Add the hash preset and both demos

In `demoPresets.ts`, define and export exactly three demo descriptors—one image,
one MP3/WAV audio asset, and one video—using small, stable, public CC0 sample
URLs. The recommended demo URLs are the MDN interactive-example assets:

- `.../media/cc0-images/grapefruit-slice-332-332.jpg`
- `.../media/cc0-audio/t-rex-roar.mp3`
- `.../media/cc0-videos/flower.mp4`

Use their full `https://interactive-examples.mdn.mozilla.net` URLs in code.
They are demo content, not runner dependencies. Verify all three in the real
browser before committing; if any is unavailable, use an equivalent stable
CC0 HTTPS source or repository-owned small fixture and document the change.

Add `html-js-css-media-tabs-demo` with a three-file bundle that visibly uses
the supplied assets across HTML, CSS, and JavaScript while retaining the exact
local CSS/JS markers. Add a helper such as
`getPresetMediaAssetsForMode(mode)` so `App.tsx` can pass the active preset's
assets to `CodeShoebox` without teaching `useSandboxState` to persist them.

Add the selector option after `html-css-js`, derive/pass demo media in `App`,
and add a gallery section titled **Four Tabs (HTML + CSS + JavaScript + Media)**
using persistence key `demo_html_js_css_media_v1`. Include it in Reset
Persistence. Add a prediction prompt grounded in the demo's media interaction.

Test hash resolution, mode lookup, exact three kinds/order, image alt, the
three-file envelope/markers, media helper behavior, and absence of media from
predecessor presets.

**Verify**: preset tests pass and `npm run build:demo` exits 0.

### Step 7: Document the public and learner contracts

Update the README feature list, public union/examples, and add a usage section
showing a typed `mediaAssets` array. Add a full environment reference entry,
update contributor architecture notes, and create
`template_descriptions/html-js-css-media.md`.

Document:

- exact top-level and asset-sub-tab limits;
- host ownership/read-only behavior and the explicit `MediaAsset` shape;
- supported image/audio/video preview behavior (including MP3/WAV subject to
  browser codec support);
- snippet matrix and escaping;
- media is not uploaded, persisted, bundled, proxied, or automatically added
  to learner output;
- learners paste snippets into their code, then press Run;
- absolute HTTPS/data URLs are the most portable; relative URL resolution is
  host-page dependent;
- external media causes the browser to request that host, and canvas/Web Audio
  access may still be restricted by CORS;
- manual Run, console, exact CSS/JS link semantics, and existing global
  listener/timer rerun caveat inherited from `html-css-js`.

**Verify**:
`rg -n "html-js-css-media|MediaAsset|first 3|read-only" README.md ENVIRONMENTS_README.md CLAUDE.md template_descriptions/html-js-css-media.md`

### Step 8: Run all gates and browser smoke

Run every command in the table. Restore generated build output, then inspect
scope with `git status --short` and run `git diff --check`.

Start the demo at `#html-js-css-media-tabs-demo` and verify:

1. Exact top-level order is HTML, CSS, JavaScript, Media; only the first three
   mount Monaco and accept edits.
2. Media shows exactly three sub-tabs and previews image/audio/video with no
   autoplay. Audio and video controls are usable.
3. Every shown snippet contains the selected asset's exact URL; the image has
   HTML/CSS snippets, audio and video have HTML/JS snippets.
4. Pasting each snippet into its intended file and pressing Run displays/plays
   the selected asset. A user gesture may be required for `play()`; that is
   expected browser policy, not a reason to add autoplay permission.
5. Switching media sub-tabs and top-level tabs never changes the code envelope
   or Monaco undo history.
6. A temporary fourth descriptor shows the truncation notice and creates no
   fourth asset sub-tab; zero descriptors shows the empty state.
7. Broken media URLs show a readable preview error without breaking code tabs,
   Run, output, or the other media sub-tabs.
8. Code does not execute on iframe load or edit debounce; Run renders linked
   CSS/JS and logs to the console.
9. `html-css-js-tabs-demo` remains three editable tabs with unchanged runtime;
   `html-js-tabs-demo` remains manual-run; `html-css-tabs-demo` remains live.

Record the smoke result and exact test count in the plan status when done.

## Test plan

- Public types: discriminated asset variants and exported prop compile.
- Media panel: empty/one/three/overflow, previews, accessibility, load errors,
  non-editability, native controls, snippet matrix, and hostile-string escaping.
- Editor: exact four-tab order, code languages/editability/preservation, Media
  isolation, overflow behavior, and predecessor-mode isolation.
- Runtime: shared recipe semantics/security and mode enumeration.
- Output: manual-only execution and console visibility.
- State: starter, allowlist, reset, and mode-specific persistence.
- Presets/demo: hash, three asset kinds, linked bundle, host asset lookup, and
  no accidental media on other modes.
- Regression: full suite total greater than 86, typecheck, lint, both builds.
- Browser: real image/audio/video preview, snippets used in output, user-gesture
  playback behavior, errors, cap, responsive tabs, and predecessor modes.

## Done criteria

- [ ] Public mode and exported `MediaAsset`/`mediaAssets` API match the locked
  contract.
- [ ] Exactly four top-level tabs render in the locked order.
- [ ] Media contains zero-to-three read-only asset sub-tabs and never mutates
  code.
- [ ] Image/audio/video previews are accessible, contained, non-autoplaying,
  and have a readable load-error state.
- [ ] Snippet categories and escaping match the locked matrix.
- [ ] Code remains a three-file version-1 envelope; media is absent from
  persistence and iframe messages.
- [ ] The new mode reuses the Plan 016 sandbox recipe and stays manual-run with
  console output.
- [ ] Starter, selector, prompt, hash preset, gallery demo, and docs exist.
- [ ] `npm ci`, typecheck, lint, all tests, both builds, and browser smoke pass.
- [ ] Test total is greater than 86; `git diff --check` exits 0.
- [ ] Lockfile and dependency versions are unchanged.
- [ ] No generated or out-of-scope files are in the diff.
- [ ] Plan 017 is marked DONE with commit, PR, checks, and smoke summary.

## STOP conditions

Stop and report rather than improvise if:

- Plan 016/commit `1a18475` is not in the branch history or drift invalidates
  the three-file bundle/tab/runner assumptions.
- Supporting media appears to require changing the code envelope version,
  persisting media, transferring media through `EXECUTE`, or adding a new
  sandbox permission.
- The implementation would execute host media/snippet strings as markup or
  script in the parent application.
- The mode cannot reuse the existing `html-css-js` recipe without changing
  predecessor behavior.
- A browser cannot load all three chosen demo assets; replace demo-only sources
  within scope, but STOP if runtime/proxy/CORS work seems required.
- A required production edit falls outside scope, or a gate fails twice after
  one focused correction.
- Install changes dependency versions/lockfile, or browser behavior contradicts
  the unit tests.

## Maintenance notes

- Media descriptors deliberately remain host state. Future upload/persistence
  work needs a separate design covering storage, quotas, lifecycle, security,
  and serialization; do not stretch this API into it.
- Review snippet escaping as code generation, even though the strings are only
  displayed. A valid React text node can still become unsafe/invalid after a
  learner pastes it into HTML/CSS/JS.
- Keep the media cap centralized in `MediaPanel`; avoid duplicating slicing and
  selection rules across `App`, `Demo`, and `CodingEnvironment`.
- The sandbox may display/play remote media tags, but cross-origin pixels or
  samples are not promised to learner JavaScript. Document rather than weaken
  CORS or sandboxing.
- If another specialized web mode is requested, promote the local typed
  workspace-mode config into a shared registry before adding more conditionals.
