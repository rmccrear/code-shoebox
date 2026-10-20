# CodeMirror 6 experiment

Branch: `codex/codemirror6-prototype`.

An internal context selects a lazy-loaded Monaco or CodeMirror implementation.
The `1.0.38-c` QA release defaults to CodeMirror; the public `CodeShoebox` API
remains unchanged. The demo can still select either implementation.
The demo's **Editor engine** selector preserves source when switching engines;
engine switches start fresh editor history. File tabs preserve document,
selection and undo history within an implementation. Session resets clear
CodeMirror's cached file states. The iframe execution engine and persistence
are shared.

## Try it

Run `fnm exec --using default npm run dev`, then choose **CodeMirror 6
(experimental)** in the header:

- [HTML/CSS/JS](http://localhost:5173/?editor=codemirror#html-css-js-tabs-demo)
- [React JSX](http://localhost:5173/?editor=codemirror#react-app-counter-demo)
- [TypeScript](http://localhost:5173/?editor=codemirror#ts-logic-demo)

Use `editor=monaco` for the baseline. The selector also applies to the Gallery.

Use the existing `enableEmmet` prop or the comparison harness's **Enable Emmet**
checkbox. For example:

`http://localhost:5173/tests/editor-comparison/index.html?editor=codemirror&scenario=html-css-js-tabs-demo&emmet=1`

Build first (`fnm exec --using default npm run build`) because the harness uses
the packaged stylesheet. The same three preset IDs work as `scenario` values.
The harness serves installed Monaco assets locally by default. `assets=cdn`
uses the wrapper's default CDN configuration; its version may differ from the
installed peer package.

## Assistance included

CodeMirror uses its built-in language support:

- HTML, CSS, JavaScript, JSX, TypeScript and TSX highlighting and indentation.
- JavaScript/TypeScript snippets, keywords and locally declared name completion.
- Folding, search, bracket matching, wrapping, themes and read-only source.
- Controlled updates that acknowledge delayed local echoes without overwriting
  newer typing.
- Opt-in Emmet suggestions and Tab expansion in editable HTML. It is removed
  when disabled, read-only, or on another file type.

Completion keys retain the requested customization: Tab accepts the selected
suggestion; Enter inserts a newline. Ctrl-Space opens suggestions; arrows select
and Escape dismisses. With no suggestion open, Tab retains snippet-field
navigation, Emmet expansion or indentation; Shift-Tab retains previous
snippet-field navigation/outdent.

## TypeScript service removed — 2026-10-14

The experimental semantic service was removed in favor of CodeMirror's built-in
support. CodeMirror no longer downloads a compiler, standard-library declaration
pack or language-service worker. The previous standalone worker asset was
6,043,322 bytes (1,357,277 bytes gzipped); the library build no longer emits it.
TypeScript is again a development-only dependency. The VFS/Comlink dependencies
and custom worker packaging were also removed.

CodeMirror does not infer member types, show type/documentation hovers, resolve
cross-file imports for suggestions, or report semantic type mismatches. Its
TypeScript syntax support and snippets remain. TypeScript/JSX execution still
uses the existing Babel-based iframe runtime and does not require this service.
Monaco retains its existing assistance. Themes differ: One Dark versus Monaco's
VS choices and Shiki JSX integration.

An existing execution readiness issue remains: non-React runs can be sent before
a newly reset iframe loads its runtime. The harness waits for readiness. Before
adoption, Run should wait or queue early runs (currently only React App runs are
queued). This experiment does not change the execution runtime.

## Validation — 2026-10-14

All 201 unit tests, type checking, lint and the library build pass. The three
Monaco baseline scenarios and all three CodeMirror scenarios pass in Chromium;
CodeMirror creates zero language-service workers in every case. Local-name
completion, Tab acceptance, Enter newline behavior, HTML Emmet and execution
pass, as does the demo engine selector/source preservation check. Monaco and
CodeMirror were checked in separate runs after updating the harness.

## Repeat the checks

`fnm exec --using default npm run compare:editors` prepares an isolated dependency
cache before navigation, disables hot reload, and asserts one page navigation
per case. `COMPARE_EDITORS` and `COMPARE_SCENARIOS` can narrow a debug run; omit
them for the full comparison.

All three scenarios check typing, file history, themes, resets and execution.
CodeMirror additionally checks built-in local-name completion, Tab acceptance,
Enter inserting a newline and zero language-service workers. HTML checks cover
Emmet, linked CSS and button interaction. React checks verify the counter.
TypeScript checks verify transpilation and visible console output. Monaco alone
checks inferred member completions, type hovers and diagnostic TS2322.

Screenshots and JSON results are written to
`output/playwright/editor-comparison/`. The TypeScript fixture substitutes
`console.log(tasks)` for `console.table(tasks)` because the existing bridge does
not intercept `table`. The demo selector/source preservation is also checked.

Unit tests cover parsers, built-in completions/snippets, history, delayed
controlled echoes, Emmet opt-in/removal, read-only/theme changes and resets.
`npm run test:styles` checks the packaged stylesheet and default CodeMirror
editor, including opt-in Emmet.

Previous performance numbers used the full TypeScript worker and are superseded.
Development timings and allocated JS heap snapshots are smoke measurements,
not production benchmarks. Production transfer, input latency, mobile behavior
and multiple-playground scaling remain unmeasured.

## Optional diagnostics (v1.0.38-c)

The new `createTypeScriptWorker` prop opts CodeMirror TS/TSX lessons into a real
checker. The host imports `code-shoebox/ts-checker.worker.js?worker` and supplies
its constructor factory; Vite emits the self-contained worker as a separate
hashed application asset. It contains TypeScript 5.9.3 and matching libraries,
without VFS, Comlink, remote type fetching or learner-code execution. No factory
means no diagnostics or compiler download. JS/JSX lessons remain on built-in
assistance even when the factory is supplied. Emmet remains independent.

Only diagnostics are restored: completions and hovers retain their built-in
behavior. See README for configuration and framework-typing limits. The new
`test:typescript-worker` check tests package exports in real consuming builds.
