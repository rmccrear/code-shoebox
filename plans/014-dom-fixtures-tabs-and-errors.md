# Plan 014: DOM fixtures, bounded file tabs, and useful runtime errors

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. Read the live files before editing because this plan is a handoff,
> not a substitute for checking current code. If any STOP condition occurs,
> stop and report rather than widening scope. When finished, update this plan's
> row in `plans/README.md`.
>
> **Drift check (run first)**:
> `git diff --stat 373a58c..HEAD -- types.ts components/CodeShoebox.tsx components/CodingEnvironment.tsx components/CodeEditor.tsx components/OutputFrame.tsx runtime/runner.ts runtime/templates/common.ts Demo.tsx`
> The plan was prepared against commit `373a58c` on 2026-07-16. Drift is not
> automatically a blocker, but overlapping runtime or tab changes must be read
> and reconciled before implementation.

## Status

- **Priority**: P1
- **Effort**: M-L
- **Risk**: MED (public API + iframe message contract + editor state)
- **Depends on**: plan 012 (DONE; component tests are the safety net)
- **Category**: feature + runtime diagnostics
- **Planned at**: commit `373a58c`, 2026-07-16

## Outcome

Add a host-controlled DOM fixture to the published `CodeShoebox` component so
learner JavaScript can use APIs such as:

```js
const statusLine = document.getElementById('status-line');
statusLine.textContent = 'Systems: all green';
```

without forcing learner code to construct the page first.

The same slice must make runtime exceptions readable. A caught
`ReferenceError`, `TypeError`, `SyntaxError`, `DOMException`, or rejected
promise must reach the visible console as a useful name/message rather than
`{}`. For example, running `confetti()` without that library must display at
least:

```text
ReferenceError: confetti is not defined
```

Finally, add a gallery sample to the local demo that visibly exercises the
fixture and its file tabs.

## Locked design decisions

These decisions remove ambiguity for the executor.

1. **Use the real iframe DOM; do not add a DOM mock to production.** The `dom`
   recipe already executes in a browser iframe. The missing capability is
   host-provided markup, not `document` itself.
2. Add optional public props:

   ```ts
   fixtureHtml?: string;
   fixtureCss?: string;
   ```

   `fixtureHtml` is the primary feature. `fixtureCss` is the bounded companion
   that permits a third, read-only file tab and avoids embedding lesson styles
   inside the HTML string.
3. The props apply only to `environmentMode="dom"`. Other modes keep their
   current behavior and must not inject or display these fixture files.
4. Restore the fixture before **every** DOM execution, then run learner
   JavaScript. A rerun must start from pristine fixture markup/styles rather
   than the DOM left by the prior run.
5. The existing `code` prop remains the editable JavaScript string. Do not put
   fixture files into the `code` string and do not generalize
   `runtime/fileBundle.ts` for this feature.
6. When a DOM fixture is supplied, show bounded file tabs:
   - `script.js` — editable learner `code`;
   - `index.html` — read-only, shown when `fixtureHtml` is supplied;
   - `style.css` — read-only, shown when `fixtureCss` is supplied.

   Start on `script.js`. With HTML only there are two tabs; with HTML + CSS
   there are three. Never render more than these three. Fixture tabs are for
   visibility and understanding, not authoring.
7. Do **not** add a new environment mode such as `html-css-js`. The current
   `html-css` environment remains the editable, script-blocked page exercise;
   `dom` with fixture props remains the JavaScript exercise over fixed host
   files.
8. Send fixtures in the `EXECUTE` message payload. Do not interpolate fixture
   strings into iframe `srcDoc`; keeping them in structured-clone data avoids
   `</script>`/HTML serialization hazards and avoids iframe remounts when a
   fixture prop changes.
9. Fixtures are trusted host-authored input delivered to the already sandboxed
   iframe. This plan does not add sanitization, arbitrary dependency loading,
   module imports, or same-origin privileges.
10. Do not auto-run learner JavaScript merely to show the fixture. Preserve the
    Run-button and prediction semantics. The fixture appears as editor tabs
    immediately and in the output when the user runs code.

## Current state

- `types.ts` exposes no fixture props.
- `CodeShoebox.tsx` passes only code, mode, theme, session, prediction, and
  debug values to `CodingEnvironment`.
- `CodingEnvironment.tsx` has special tab behavior only for `html-css`; its
  two editable files are unpacked from the serialized `code` envelope.
- `CodeEditor.tsx` gives distinct Monaco models/languages only to the
  `html-css` files.
- `OutputFrame.tsx` calls `executeCodeInSandbox(window, code)` with no
  execution options.
- The kernel already destructures `payload` from messages but calls
  `window.__RUN_MODE__(code, root)` without it.
- The DOM recipe clears `root.innerHTML` before each run, leaving no element
  for `getElementById` unless learner code creates one.
- The console bridge JSON-stringifies objects. Native `Error` properties are
  non-enumerable, so `JSON.stringify(new ReferenceError(...))` produces `{}`.
- `Demo.tsx` has HTML and HTML/CSS samples but no DOM-fixture sample.

## Scope

### In scope

- `types.ts`
- `components/CodeShoebox.tsx`
- `components/CodingEnvironment.tsx`
- `components/CodeEditor.tsx`
- `components/OutputFrame.tsx`
- `runtime/runner.ts`
- `runtime/templates/common.ts`
- focused tests in `runtime/runner.test.ts` and `components/*.test.tsx`
- `Demo.tsx`
- `README.md`
- `ENVIRONMENTS_README.md`
- `template_descriptions/dom.md`
- `CLAUDE.md` if its execution-contract description needs synchronization
- `plans/README.md` status update

### Out of scope

- Changes in any consumer repository or curriculum renderer.
- Publishing, tagging, pushing, or running `npm run release` unless the
  operator separately requests it.
- Arbitrary `<script src>` dependencies, npm installs, import maps, or generic
  `import`/`export` support in `dom` mode.
- Making fixture HTML or CSS editable.
- A fourth tab, file creation/deletion/renaming, folders, or a generalized
  project-file abstraction.
- Replacing the existing `html-css` bundle format.
- A new `html-css-js`/`web-project` environment.
- Adding Playwright infrastructure in this slice.
- Broad console UI redesign or unrelated runtime cleanup.

## Step 1: Add and thread the public fixture API

In `types.ts`, add documented optional props to `CodeShoeboxProps`:

```ts
/** Trusted host-authored markup restored before each run in dom mode. */
fixtureHtml?: string;
/** Trusted host-authored styles restored with fixtureHtml in dom mode. */
fixtureCss?: string;
```

Thread both props through:

```text
CodeShoebox
  -> CodingEnvironment
    -> OutputFrame
      -> executeCodeInSandbox
```

Do not pass them to `ServerOutput`. `CodingEnvironment` should ignore them for
non-DOM modes even if a consumer accidentally provides them.

Use `undefined` to mean “file not supplied.” Do not collapse it to `''` in the
editor layer because presence determines whether the corresponding fixture
tab is shown.

**Tests**:

- Add a focused public-component or host-component assertion proving the two
  props reach `OutputFrame`/`executeCodeInSandbox` in `dom` mode.
- Prove non-DOM modes do not forward fixture execution data.

## Step 2: Add the two-or-three-tab DOM fixture presentation

Refactor the tab selection in `CodingEnvironment.tsx` carefully; do not force
DOM fixtures through `WebFileBundle`.

Recommended local model:

```ts
type EditorFileName = 'script.js' | 'index.html' | 'style.css';
```

Keep the existing `html-css` behavior unchanged. For `dom` with fixture props,
derive a `visibleFiles` list capped at three:

```ts
['script.js', fixtureHtml !== undefined && 'index.html',
 fixtureCss !== undefined && 'style.css']
```

Filter false entries. The behavior contract is:

- `script.js` value = `code`; edits call `onChange`.
- `index.html` value = `fixtureHtml`; editor is read-only.
- `style.css` value = `fixtureCss`; editor is read-only.
- prediction locking still makes `script.js` read-only after submission.
- fixture tabs remain read-only in every prediction state.
- when props/mode/session changes and the active tab is no longer available,
  return safely to `script.js` (or the existing first file for `html-css`).

Update `CodeEditor.tsx` so any supplied `activeFile` receives a deterministic
Monaco model path, and language follows the filename:

- `.js` -> `javascript`
- `.html` -> `html`
- `.css` -> `css`

Do not key multi-file behavior solely on `environmentMode === 'html-css'`
after this change. Preserve separate models so switching tabs retains the JS
undo stack and does not mix language services.

Make the read-only state visually understandable. A small lock indicator or
`title="Fixed fixture"` on the HTML/CSS tabs is enough; do not redesign the
toolbar.

**Tests in `components/CodingEnvironment.test.tsx`**:

1. Plain `dom` without fixtures remains a single JavaScript editor and shows
   no file-tab group.
2. `dom + fixtureHtml` shows exactly `script.js` and `index.html`.
3. `dom + fixtureHtml + fixtureCss` shows exactly three tabs.
4. The initial tab is editable `script.js` containing `code`.
5. Clicking `index.html` shows the fixture and makes the editor read-only.
6. Clicking `style.css` shows the fixture and makes the editor read-only.
7. Switching back to `script.js` restores the learner code and editability.
8. Existing `html-css` tests/behavior still show two editable tabs and still
   serialize edits into its existing envelope.

## Step 3: Restore fixtures in the iframe before each DOM run

Add a small internal execution-options type near `executeCodeInSandbox`, for
example:

```ts
export interface SandboxExecutionOptions {
  fixtureHtml?: string;
  fixtureCss?: string;
}
```

Update the helper without breaking callers that provide only two arguments:

```ts
executeCodeInSandbox(iframeWindow, code, options?)
```

Post a structured payload:

```ts
iframeContentWindow.postMessage({
  type: 'EXECUTE',
  code,
  payload: options
}, '*');
```

In `runtime/templates/common.ts`, pass the payload as the third recipe
argument:

```js
window.__RUN_MODE__(code, root, payload || {});
```

Only the DOM recipe needs to consume it. Before learner code runs:

1. Remove all prior root children so element-bound listeners/state from the
   previous run are discarded.
2. Install a fresh `<style data-code-shoebox-fixture>` element when
   `fixtureCss` was supplied.
3. Parse/clone the fixture HTML into `#root` without concatenating CSS and HTML
   strings.
4. Execute learner code with the existing `new Function('root', code)(root)`.

The ordering is mandatory: fixture reset -> fixture CSS/HTML -> learner code.
When no fixture is supplied, DOM mode must behave exactly as it does now: an
empty `#root` before execution.

Do not add `allow-same-origin`. Do not place fixture data in `srcDoc`. Do not
let fixture CSS escape the sandbox iframe (it cannot when inserted correctly).

**Tests in `runtime/runner.test.ts`**:

- `executeCodeInSandbox` still accepts the old two-argument call.
- With options, `postMessage` receives code plus exact HTML/CSS payload.
- The generated DOM recipe contains the reset/install-before-execute order.
- A fixture string containing quotes, backticks, `${...}`, and `</script>` is
  sent as message data, not interpolated into `getSandboxHtml('dom')`.
- Other recipes ignore the third argument and their existing generated HTML
  assertions remain green.

**Tests in `components/OutputFrame.test.tsx`**:

- Incrementing `runTrigger` in DOM fixture mode calls
  `executeCodeInSandbox(window, code, { fixtureHtml, fixtureCss })`.
- Plain DOM and every non-DOM mode preserve their expected call shape/options.
- Changing fixture props does not remount the iframe or recreate the existing
  `MessageChannel`; the latest values are used on the next run.

## Step 4: Serialize native errors usefully

In the iframe kernel, replace the ad hoc object branch in the console override
with one small formatter used by `console.log/error/warn/info` and async error
handlers.

Required formatting order:

1. Error-like values (`Error`, `ReferenceError`, `TypeError`, `SyntaxError`,
   `DOMException`, or an object with string `name` + `message`) ->
   `"<name>: <message>"`.
2. Plain objects/arrays -> pretty `JSON.stringify` when possible.
3. Circular/unserializable objects -> `String(value)`.
4. Primitives, including `null` and `undefined` -> readable strings.

The first line is the learner-facing contract. A stack may be appended only if
it remains readable and does not replace the name/message. Avoid exposing the
opaque iframe's giant generated `srcDoc` as the only useful output.

Update `window.onerror` to use its `error` argument when available and retain
line/column context when only a message is available. Add an
`unhandledrejection` listener that reports `event.reason` through the same
formatter as `RUNTIME_ERROR`.

Do not remove `original.apply(console, args)`; browser DevTools should still
receive the native log. Avoid double-posting the same caught synchronous error.

**Regression expectations**:

| Learner code | Visible console contains |
| --- | --- |
| `confetti()` | `ReferenceError: confetti is not defined` |
| `null.textContent = 'x'` | `TypeError:` plus a useful message |
| malformed JavaScript | `SyntaxError:` plus a useful message |
| `throw new Error('boom')` | `Error: boom` |
| `Promise.reject(new Error('later'))` | `Error: later` |
| `console.log({ ok: true })` | JSON containing `"ok": true` |

Extend generated-sandbox assertions for the formatter and rejection handler.
Because the suite does not execute real iframe code, the manual browser smoke
in Step 7 is mandatory for the exact visible messages.

## Step 5: Add a DOM fixture sample to the demo gallery

In `Demo.tsx`, add a new gallery section near the existing HTML/HTML-CSS
samples. Suggested title:

```text
DOM Fixture (script.js + index.html + style.css)
```

Create three constants:

- `DOM_FIXTURE_DEMO_CODE` — learner JavaScript using
  `document.getElementById`, `textContent`, and an event listener;
- `DOM_FIXTURE_DEMO_HTML` — a small status panel with at least one element id
  read by the JavaScript and a button;
- `DOM_FIXTURE_DEMO_CSS` — visible styling that makes it obvious CSS loaded.

Use a dedicated persistent state key for the JavaScript, such as
`demo_dom_fixture_v1`, with mode `dom`. Pass the fixed constants as
`fixtureHtml` and `fixtureCss`; only JavaScript should persist. Add the state to
the gallery's Reset All handler.

The sample must demonstrate all acceptance behaviors:

- exactly three tabs;
- HTML and CSS tabs visibly read-only;
- JavaScript tab editable;
- Run finds fixture ids and updates the page without a null error;
- editing JavaScript and rerunning starts from the original fixture;
- a button listener works after Run.

Do not replace the existing HTML or HTML/CSS gallery samples; this is a new
sample with a different teaching purpose.

## Step 6: Update public documentation

Update:

- `README.md` Props table with `fixtureHtml` and `fixtureCss`;
- a concise DOM fixture usage example showing the three props (`code`, HTML,
  CSS) and explaining read-only fixture tabs;
- `ENVIRONMENTS_README.md` DOM section: real DOM, fixture reset semantics,
  bounded tabs, DOM-only scope, and no module/import support;
- `template_descriptions/dom.md` with the fixture capability and the fact that
  fixture files are host-controlled/read-only;
- `CLAUDE.md` execution/message description if necessary so future runtime
  changes know `EXECUTE.payload` is part of the contract.

Document that fixtures are trusted host input inside the sandbox. Do not claim
they load arbitrary libraries or grant network/module capabilities.

## Step 7: Verification

Use Node through the machine's configured `fnm` runtime if the ordinary
`node`/`npm` binaries fail.

### Automated gates

```bash
npm test
npm run typecheck
npm run lint
npm run build
npm run build:demo
```

All must exit 0. Record before/after test counts in the implementation report.

### Mandatory browser smoke

Run `npm run dev`, open the Gallery, and verify:

1. The new DOM Fixture sample renders `script.js`, `index.html`, and
   `style.css`, with no fourth tab.
2. The fixture tabs display their exact content and cannot be edited.
3. `script.js` can be edited and retains undo/history when switching tabs.
4. Run updates the fixture elements and the sample button works.
5. Mutate the rendered DOM, rerun, and confirm the original fixture is restored
   before learner JavaScript executes.
6. Temporarily run `confetti()` and confirm the visible console says
   `ReferenceError: confetti is not defined`, not `{}`.
7. Temporarily run each error-regression snippet from Step 4 and confirm a
   readable error.
8. Confirm a plain-object `console.log` still renders useful JSON.
9. Confirm plain `dom` mode without fixtures still works.
10. Smoke `html-css`, one React mode, one p5 mode, and one headless mode to
    catch accidental tab/message regressions.
11. Toggle `debugMode` in the demo editor and confirm logs continue crossing
    the existing MessageChannel.

Stop the dev server after verification. Revert only temporary demo-code edits;
keep the new gallery sample.

## Done criteria

- [ ] `CodeShoeboxProps` publicly exposes optional `fixtureHtml` and
      `fixtureCss`.
- [ ] DOM execution restores fixture HTML/CSS before every run.
- [ ] No-fixture DOM behavior is unchanged.
- [ ] Fixture data travels in `EXECUTE.payload`, not iframe `srcDoc`.
- [ ] DOM fixture UI shows 1-3 bounded files: editable JS plus read-only HTML
      and optional CSS; it never shows more than three.
- [ ] `html-css` remains a separate two-editable-file mode with no behavior
      regression.
- [ ] ReferenceError, TypeError, SyntaxError, thrown Error, and unhandled
      rejection messages are readable in the visible console.
- [ ] Plain object/array console formatting still works.
- [ ] A new three-tab DOM fixture sample exists in the Gallery and Reset All
      resets its JavaScript.
- [ ] Automated gates and the mandatory browser smoke pass.
- [ ] Public/runtime documentation is synchronized.
- [ ] `plans/README.md` status row is updated.
- [ ] No consumer repository, release branch, tag, or remote was modified.

## STOP conditions

Stop and report rather than improvising if:

- The worktree contains overlapping uncommitted changes in the scoped runtime,
  editor, or demo files that cannot be preserved safely.
- Supporting fixtures appears to require `allow-same-origin`, weakening the
  current iframe sandbox, or embedding fixture strings in `srcDoc`.
- The requested UI starts requiring editable fixture files, file creation,
  imports/dependencies, or more than three tabs. Those requirements describe a
  separate editable web-project mode, not this fixture feature.
- Existing `html-css` persistence/bundle behavior would need a breaking format
  change.
- Fixture props cannot be added without a breaking change to existing
  two-argument `executeCodeInSandbox` callers.
- Error improvements require exposing raw host-page data or removing the
  current `event.source`/MessageChannel security checks.
- A source change outside the Code Shoebox repository appears necessary.

## Maintenance notes

- The host owns fixture files; `useSandboxState` persists only learner `code`.
- Resetting root children removes element-bound listeners from the prior run,
  but this plan does not promise cleanup for arbitrary listeners learner code
  attaches to `window` or `document`.
- The fixture tabs intentionally resemble the existing HTML/CSS tabs, but their
  mutability is different. Keep the lock/read-only cue obvious.
- If a future request needs editable JS + HTML + CSS, create a separate plan
  for a three-file web-project environment. Do not silently mutate this fixed
  fixture API into that feature.
- Browser execution remains manually verified until the repository gains a
  real E2E harness.
