# Plan 004: Pin all sandbox CDN dependency versions

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 00c9834..HEAD -- runtime/runner.ts runtime/runner.test.ts`
> If `runtime/runner.ts` lines 9–37 changed since this plan was written,
> compare the "Current state" excerpts against the live code before
> proceeding; on a mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: plans/003-delete-dead-template-layer.md (so runner.ts is the only file carrying CDN URLs)
- **Category**: deps
- **Planned at**: commit `00c9834`, 2026-06-10

## Why this matters

The sandbox iframe loads its toolchain from CDNs at runtime. Two of those URLs
are not fully pinned: Babel standalone has **no version at all** (unpkg serves
the latest release, so a breaking Babel release instantly breaks every
transpiled mode — typescript, p5-ts, react, react-ts, express-ts, hono,
hono-ts, node-ts — for every consumer of the published package, with no code
change on our side), and React floats within the `@18` major. Pinning exact
versions makes sandbox behavior reproducible and turns upstream releases into
deliberate, testable upgrades.

## Current state

All CDN URLs live at the top of `runtime/runner.ts` (after plan 003, this is
the only file with CDN URLs — verify with the step-1 grep):

```ts
// runtime/runner.ts:9-15
const BABEL_CDN = '<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>';
const REACT_CDNS = [
  '<script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>',
  '<script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>',
  BABEL_CDN
];
const P5_CDN = '<script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.min.js"></script>';
```

```ts
// runtime/runner.ts:37
const HONO_CDN = '<script type="module">import { Hono } from "https://esm.sh/hono@4.1.0"; window.Hono = Hono;</script>';
```

Pinning status: Babel — UNPINNED; React/ReactDOM — major-only (`@18`);
p5 — pinned (1.9.0); Hono — pinned (4.1.0). The last two need no change.

`runtime/runner.test.ts` asserts substrings of the generated HTML (e.g. it
checks for `react@18` in react-mode output). `react@18.3.1` still contains the
substring `react@18`, so existing assertions should keep passing — but run the
suite to confirm, and tighten assertions per the test plan.

## Commands you will need

| Purpose   | Command              | Expected on success |
|-----------|----------------------|---------------------|
| Typecheck | `npm run typecheck`  | exit 0              |
| Tests     | `npm test`           | all pass            |
| Lint      | `npm run lint`       | exit 0              |

## Scope

**In scope**:
- `runtime/runner.ts` — the four CDN constant definitions only
- `runtime/runner.test.ts` — assertion updates/additions

**Out of scope** (do NOT touch):
- Switching React from `.development.js` to `.production.min.js` — the dev
  build's readable error messages are a deliberate choice for a learning tool.
- Upgrading any library's version (p5 1.9.0, hono 4.1.0 stay as they are);
  this plan pins, it does not bump.
- Self-hosting/bundling the CDN deps — bigger architectural question, not this
  plan.
- Any recipe `logic` string.

## Git workflow

- Branch: `advisor/004-pin-cdn-versions`
- Commit style: short imperative subject (match `git log`). Single commit.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Confirm runner.ts is the only CDN carrier

```bash
grep -rn "unpkg.com\|cdnjs\|jsdelivr\|esm.sh" --include="*.ts" --include="*.tsx" . \
  | grep -v node_modules | grep -v ".demo-site" | grep -v plans | grep -v "\.test\."
```

**Verify**: every hit is in `runtime/runner.ts`. Hits elsewhere (e.g. in
`runtime/templates/`) mean plan 003 hasn't run — STOP and report the ordering
problem.

### Step 2: Pin Babel and React

In `runtime/runner.ts`, change exactly:

- `https://unpkg.com/@babel/standalone/babel.min.js`
  → `https://unpkg.com/@babel/standalone@7.26.4/babel.min.js`
- `https://unpkg.com/react@18/umd/react.development.js`
  → `https://unpkg.com/react@18.3.1/umd/react.development.js`
- `https://unpkg.com/react-dom@18/umd/react-dom.development.js`
  → `https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js`

(7.26.4 is a known-stable @babel/standalone release; 18.3.1 is the final React
18 release.) Add one comment above the constants:

```ts
// CDN deps are pinned to exact versions for reproducible sandbox behavior.
// Bump deliberately: change the version, then manually verify every affected
// mode in `npm run dev` (see ENVIRONMENTS_README.md for the mode inventory).
```

**Verify**: `npm run typecheck` → exit 0. `npm test` → all pass.

### Step 3: Pin the pinning in tests

In `runtime/runner.test.ts`, following the existing substring-assertion style,
add (or tighten an existing assertion into) a test that:

- `getSandboxHtml('react')` contains `react@18.3.1` and `@babel/standalone@7.26.4`
- `getSandboxHtml('typescript')` contains `@babel/standalone@7.26.4`
- a regex check that no generated document for any mode in `ALL_MODES` matches
  `/unpkg\.com\/@babel\/standalone\/babel/` (the unpinned form)

**Verify**: `npm test` → all pass including new assertions.
`npm run lint` → exit 0.

## Test plan

Covered in step 3 — assertions live in `runtime/runner.test.ts`, modeled on its
existing `toContain` style. Automated tests cannot prove the pinned URLs
actually load (jsdom doesn't fetch them); flag in your report that a human
should run `npm run dev` and smoke-test one transpiled mode per CDN:
`typescript` (Babel), `react` (React UMD), `hono` (esm.sh — unchanged),
`p5` (cdnjs — unchanged).

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `grep -c "@babel/standalone@7.26.4" runtime/runner.ts` → 1
- [ ] `grep -rn "unpkg.com/@babel/standalone/babel" runtime/ --include="*.ts"` → no matches
- [ ] `grep -rn "react@18/umd\|react-dom@18/umd" runtime/ --include="*.ts"` → no matches
- [ ] `npm run typecheck`, `npm run lint`, `npm test` all exit 0
- [ ] No files outside the in-scope list are modified (`git status`)
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- Step 1 finds CDN URLs outside `runner.ts` (plan ordering broken).
- Any existing test fails after step 2 for a reason other than an assertion on
  the old unpinned URL text — report it.
- You are tempted to bump p5/hono or swap dev for prod React builds — out of
  scope; note the idea in your report instead.

## Maintenance notes

- Upgrading any sandbox CDN dep now requires editing the pinned version AND
  the step-3 test — that friction is intentional.
- The deeper option (bundling Babel/React into the package or self-hosting,
  removing the runtime CDN dependency entirely) was considered and deferred:
  it changes the package's size/architecture and deserves its own design pass.
- Reviewer: confirm the exact pinned versions resolve on unpkg (load the two
  URLs once in a browser).
