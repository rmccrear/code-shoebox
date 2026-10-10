# Plan 019: Isolate distributed styles from host applications

## Status

- **Issue**: [GitHub #20](https://github.com/rmccrear/code-shoebox/issues/20)
- **Priority**: P1
- **Effort**: M
- **Risk**: MEDIUM — changes selector matching and inherited defaults
- **Depends on**: none
- **Status**: DONE — implemented and verified locally on 2026-10-09
- **Planned at**: 2026-10-09, against `340d357`

## Problem and intended behavior

Importing `code-shoebox/styles.css` currently changes controls elsewhere in
the host application. Tailwind v3 preflight emits global, unlayered resets;
these override normal host declarations inside Tailwind v4 cascade layers.
The distributed stylesheet also emits global utility classes, so removing
preflight alone would leave class collisions.

Keep the existing CSS import and component API. After the fix, importing the
stylesheet must leave elements outside CodeShoebox unchanged, while preserving
the component's layout, controls, editor alignment, and themes. Hosts should
not have to provide Tailwind, a reset, or a particular cascade-layer order.

## Selected approach

Add a stable `data-code-shoebox` attribute to the existing component root and
scope the complete generated stylesheet to that root and its descendants.
Retain the internal reset so the component remains usable in plain React
applications. Namespace generated keyframes and their animation references.

Perform scoping after Tailwind expands its directives, using a CSS parser and
selector parser. Avoid regex-based rewriting of selectors or CSS values.
Declare build dependencies directly rather than relying on transitive packages.

A layer-only fix is smaller, but requires the host to establish layer order
correctly. Tailwind's `prefix` and `important` options do not scope preflight.
Shadow DOM and a Tailwind major-version migration introduce unnecessary scope
for this issue. Explicit selector scoping resolves the reported leak without
requiring consumer configuration.

## Files and boundaries

Expected changes: `components/CodeShoebox.tsx`, `styles/input.css`, a CSS build
script under `scripts/`, `package.json`, `package-lock.json`, focused regression
tests, a browser fixture, `README.md`, and the CI workflow if needed for the
regression command.

Preserve the `styles.css` export and `scripts/prepare-dist.js` path rewriting.
Keep runtime iframe CSS and learner-authored HTML/CSS unchanged: the iframe is
a separate document. Preserve unrelated working-tree edits, including existing
changes under `plans/`.

## Implementation steps

### 1. Capture the failing consumer behavior

Use the [four-scenario reproduction in the issue comment](https://github.com/rmccrear/code-shoebox/issues/20#issuecomment-6093427817)
as the baseline: A uses host CSS alone, B adds the package stylesheet without
a layer, C imports it into a layer established after the host layers, and D
establishes the package layer first. The comment reports A/D passing and B/C
failing with the old stylesheet pinned to distribution commit `5407f77`.
Keep this historical baseline distinct from assertions against the fixed build.

Build a small local consumer fixture that mounts the real exported component
and imports the built package's CSS through JavaScript, as documented.
Provide host styles in `theme`, `base`, `components`, and `utilities` layers.
Include controls outside CodeShoebox with `bg-primary`, `text-white`, and
`text-zinc-400`, plus a class also emitted by the library with a deliberately
different host value. Include a heading, list, input, and image to cover reset
effects beyond buttons.

Record computed styles before loading the library CSS and after it loads.
Confirm the current artifact changes the external button background, inactive
tab color, and at least one colliding utility. Use a real browser; jsdom does
not establish the relevant cascade behavior.

Serve the stylesheet locally for automated checks rather than relying on the
comment's jsDelivr URL. Confirm that each link/import actually loads and applies
before asserting computed styles: a missing stylesheet can falsely make an
isolation check pass. Keep a packaged-style assertion inside the component as
an additional check that the CSS loaded. Treat load failure as a test failure.

### 2. Add the component boundary

Put `data-code-shoebox` on the existing outer div in
`components/CodeShoebox.tsx`. Preserve its theme variables and layout classes.
Avoid an extra wrapper, which could change percentage heights and flex sizing.

The CSS transformation must cover classes on this root as well as descendants.
Do not require consumers to add the attribute themselves. Inspect Monaco
widgets and any detached UI before deciding whether they need a separate
owned boundary; do not apply the boundary to the host document body.

### 3. Build scoped CSS

Replace the Tailwind CLI portion of `npm run build` with one reusable CSS build
entry point that expands `styles/input.css`, applies scoping, and writes
`dist/styles.css`. Keep the existing tsup build and clean behavior.

The transformation must:

- Scope every ordinary selector, including custom Monaco defensive styles,
  utilities, reset rules, and Tailwind custom-property initialization.
- Use `:where([data-code-shoebox])` for the boundary so it does not artificially
  increase utility specificity.
- Preserve root matching and descendant matching, selector lists, combinators,
  escaped utility names, pseudo-elements, hover/focus states, dark variants,
  arbitrary values, and rules nested inside media/supports blocks.
- Map document-level preflight selectors such as `html`, `:host`, and `body`
  to component-local defaults. Preserve their declaration ordering and decide
  explicitly which defaults belong on the root rather than its descendants.
- Preserve keyframe step selectors such as `from`, `to`, and `50%`; they are
  not DOM selectors. Rename the generated `pulse` keyframes and references to
  a package-specific name, and handle any additional generated keyframes.
- Fail with a useful error for unsupported global constructs instead of
  silently leaving a selector or animation name unscoped.

Keep preflight defaults local. Do not set `important: true` or introduce
blanket `!important` rules. Preserve existing deliberate Monaco declarations.

### 4. Add regression coverage and verify consumers

Add focused transformation tests for root utilities, universal resets,
`::before`/`::after`, document selectors, escaped classes, variant selectors,
conditional rules, and keyframe references. Parse the final artifact to check
that ordinary rules cannot match outside the component boundary.

Run the browser fixture against the final built artifact. Cover both CSS
load orders, predeclared host layers, a plain host without Tailwind, and two
CodeShoebox instances. Verify external computed styles stay unchanged and
component root sizing and controls remain correct. Adapt scenarios B/C/D from
the issue reproduction to load the fixed artifact; all must preserve the same
external button backgrounds and inactive-tab color as control A, regardless
of layer order. Verify the component's own styling for the documented JS import;
layered imports primarily check external isolation. Include a host `pulse`
animation to catch a global keyframe collision. Wire the focused browser check
into CI with a pinned browser tool version; reuse existing tooling if available.

Smoke-test dark/light themes, Split/Stacked layout, Run, file tabs, console,
prediction input, media previews, Monaco typing and suggestions, and sandbox
execution. Check the production artifact rather than relying on the demo's
Tailwind CDN, which can mask missing packaged styles.

Run the existing typecheck, lint, tests, library build, and demo build with
`fnm exec --using default`. Pack the package and verify its CSS export, then
run `scripts/prepare-dist.js` and verify the rewritten distribution package
resolves the same scoped stylesheet. These checks must not publish anything.

### 5. Document and prepare the release

Document that the distributed stylesheet is scoped to the component and that
the ordinary JS CSS import remains supported. Mention that consumers relying
on the package to style unrelated page elements must supply their own styles.

Prepare a patch-version change and release notes referencing #20. Release
publication and a Lesson-Architect dependency bump are separate follow-up
actions. After the host installs the released artifact, verify the reported
roster button, confirm-dialog action, and inactive tabs in Lesson-Architect.

## Acceptance criteria

- [x] Importing packaged CSS does not change styles outside the component.
- [x] No ordinary generated selector escapes the component boundary.
- [x] Host keyframes are unaffected by the package's animation definitions.
- [x] The existing import works without host layer configuration or Tailwind.
- [x] Root and descendant styles render correctly in plain and layered hosts.
- [x] Browser regressions are wired into CI and pass locally against built CSS.
- [x] Existing checks, library/demo builds, and package resolution checks pass.
- [x] Documentation and patch-release preparation are complete.
- [x] Plan index records implementation and validation results.

## Implementation and validation

Implemented on `codex/isolate-distributed-styles`. The CSS build uses a parsed
subject constraint, `:where([data-code-shoebox], [data-code-shoebox] *)`, to
preserve specificity, root utility matching, and ancestor variants. Document
defaults map to the existing component root; body inheritance does not override
its local line height. Keyframes and animation references are namespaced.
Unsupported global constructs and ambiguous animation names fail the build.

Validation on 2026-10-09:

- The old unscoped artifact failed the browser regression, including button
  backgrounds, tab text, utility collisions, reset effects, and host animation.
- Typecheck and lint passed; all 173 tests passed, including 20 CSS tests.
- All 16 stylesheet scenarios passed with the fixed artifact, covering plain
  and layered hosts, both load orders, and scenarios A/B/C/D from the issue.
- The editable browser smoke passed Monaco typing and completions, owned
  suggestion-widget placement, tabs, media preview, sandbox execution, and
  console clearing. Prediction gating, dark/light controls, root sizing, and
  layout switching passed in the stylesheet scenarios.
- Library and demo builds passed. All 388 ordinary selector branches in the
  final CSS have a constraint on the styled element itself.
- Packed source and prepared distribution packages resolve their JS and CSS
  exports and contain the same scoped CSS. Lockfile compatibility passed an
  offline `npm ci --dry-run`. Existing dependency versions were preserved.

The browser fixture serves Monaco locally and disables background automatic
suggestions and occurrence highlighting before editor creation to avoid
cancellation races during rapid model switches. It explicitly requests and
checks completions; all browser runtime errors remain failures. Production
editor options are unchanged.

Version 1.0.35 and release notes are prepared. Publication, the remote CI run,
and verification in Lesson-Architect after its dependency update remain release
follow-ups. No release or host-app update was performed.

### Host QA follow-up

Lesson-Architect QA of `dev/release` at `e74d353` found zero external style
changes across seven pages and passed 977 host tests and the production Monaco
build. It identified one package regression: mapping the document font default
to the component root replaced the host's Inter font with the system font stack.

The CSS transformation now sets document-default font-family declarations to
`inherit` when mapping them to the component root. Explicit utility fonts and
Monaco font options are preserved. A browser assertion reproduced the old root
font override before the correction; root and Run-control inheritance then
passed in plain and layered hosts with both load orders. The local suite now
has 174 passing tests, including 21 CSS tests, and typecheck/lint/build pass.
All 16 browser isolation scenarios and the editable smoke passed twice from
fresh Vite caches. The completion smoke now waits for the public JavaScript
worker to return `console.log` completions before checking the visible menu;
each run uses a separate temporary cache to avoid other dev servers.

The handoff's missing theme provider is a Lesson-Architect issue. Automatic
completion and quote/bracket closing require comparison with the old package
before attributing them to this change. Neither was changed by this follow-up.

## Conditions requiring a revised approach

Reassess if required Monaco UI renders outside the owned boundary, selector
rewriting cannot preserve existing variants, or the component only works when
the demo CDN supplies missing CSS. Resolve these before releasing; do not
weaken the external-style regression assertions or restore global resets.
