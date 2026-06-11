# Plan 003: Delete the dead legacy template layer in runtime/templates/

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 00c9834..HEAD -- runtime/templates/`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition. (Exception: plan 001 may have removed
> an unused `showPlaceholder` parameter in `express.ts`/`express-ts.ts` — that
> exact change is expected and fine.)

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: plans/001-verification-baseline.md
- **Category**: tech-debt
- **Planned at**: commit `00c9834`, 2026-06-10

## Why this matters

`runtime/runner.ts` holds the live implementation of every environment mode in
its `ENV_RECIPES` registry (each entry defines `window.__RUN_MODE__`, which the
kernel in `runtime/templates/common.ts` invokes on `EXECUTE`). But
`runtime/templates/` also contains a complete *older generation* of the same
system: per-mode `generate*Html()` functions whose logic strings define
`window.runMode` — a function name the current kernel **never calls**. None of
these functions is imported anywhere. They have already drifted from the live
recipes (different CDN pinning, different require-shims), and two independent
audit passes wasted effort proposing "deduplication refactors" of code that is
actually just dead. Deleting it removes ~700 lines of trap.

The maintainer explicitly declined wiring up the unshipped SQL mode
(`sql.ts`), so it is deleted with the rest; git history preserves it.

## Current state

What `runtime/runner.ts` actually imports from `runtime/templates/` (lines 3–5)
— this is the complete live surface:

```ts
import { BASE_HTML_WRAPPER } from "./templates/common";
import { EXPRESS_MOCK_SETUP } from "./templates/express";
import { HONO_MOCK_SETUP } from "./templates/hono";
```

Nothing else in the repo (components, hooks, demo app, `export.ts`, tests)
imports from `runtime/templates/` at all.

Inventory:

| File | Live content | Dead content |
|---|---|---|
| `runtime/templates/common.ts` | ALL (BASE_STYLES, KERNEL_SCRIPTS, BASE_HTML_WRAPPER) | none — **keep untouched** |
| `runtime/templates/express.ts` | `EXPRESS_MOCK_SETUP` (lines 5–147) | `EXPRESS_JS_RUNNER` (lines 149–161, defines `window.runMode`) and `generateExpressHtml` (lines 163–167); after removing them, the `import { BASE_HTML_WRAPPER } from "./common";` on line 2 is also unused |
| `runtime/templates/hono.ts` | ALL (`HONO_MOCK_SETUP` only) | none — **keep untouched** |
| `runtime/templates/dom.ts` | — | entire file (`generateDomHtml`) |
| `runtime/templates/typescript.ts` | — | entire file |
| `runtime/templates/react.ts` | — | entire file (`generateReactHtml`) |
| `runtime/templates/react-ts.ts` | — | entire file (`generateReactTsHtml`) |
| `runtime/templates/p5.ts` | — | entire file (`generateP5Html`) |
| `runtime/templates/headless.ts` | — | entire file |
| `runtime/templates/express-ts.ts` | — | entire file (`generateExpressTsHtml`; the live `express-ts` mode's logic lives inline in `runner.ts:172-194` and imports `EXPRESS_MOCK_SETUP` directly from `./templates/express`) |
| `runtime/templates/sql.ts` | — | entire file (unshipped SQL mode — maintainer declined wiring it; see plans/README.md) |

Telltale confirming deadness: the live kernel (`common.ts:100`) dispatches to
`window.__RUN_MODE__`; the dead layer defines `window.runMode` (e.g.
`dom.ts:5`, `express-ts.ts:18`) which nothing ever invokes.

## Commands you will need

| Purpose   | Command              | Expected on success |
|-----------|----------------------|---------------------|
| Typecheck | `npm run typecheck`  | exit 0              |
| Tests     | `npm test`           | 22+ tests pass      |
| Lint      | `npm run lint`       | exit 0              |
| Build     | `npm run build`      | exit 0              |

## Scope

**In scope**:
- Delete: `runtime/templates/dom.ts`, `typescript.ts`, `react.ts`,
  `react-ts.ts`, `p5.ts`, `headless.ts`, `express-ts.ts`, `sql.ts`
- Edit: `runtime/templates/express.ts` (remove dead tail + unused import)

**Out of scope** (do NOT touch):
- `runtime/templates/common.ts` and `runtime/templates/hono.ts` — fully live.
- `runtime/runner.ts` — the live registry; no changes needed here.
- `EXPRESS_MOCK_SETUP` inside `express.ts` — live; only the file's tail dies.
- Do not "improve" or consolidate anything while deleting. Pure removal.

## Git workflow

- Branch: `advisor/003-delete-dead-template-layer`
- Commit style: short imperative subject (match `git log`). A single commit
  ("Remove dead legacy template layer") is appropriate.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Prove each deletion target is unreferenced

For each file to be deleted, confirm zero imports outside the dead set itself:

```bash
grep -rn "templates/dom\|templates/typescript\|templates/react\|templates/react-ts\|templates/p5\|templates/headless\|templates/express-ts\|templates/sql" \
  --include="*.ts" --include="*.tsx" . | grep -v node_modules | grep -v ".demo-site" | grep -v "^./plans"
```

**Verify**: output is empty, OR every hit is inside one of the files being
deleted (e.g. `express-ts.ts` importing from `./express`). Any hit in a
surviving file → STOP.

### Step 2: Delete the eight dead files

```bash
git rm runtime/templates/dom.ts runtime/templates/typescript.ts \
  runtime/templates/react.ts runtime/templates/react-ts.ts \
  runtime/templates/p5.ts runtime/templates/headless.ts \
  runtime/templates/express-ts.ts runtime/templates/sql.ts
```

**Verify**: `npm run typecheck` → exit 0. `npm test` → all pass.

### Step 3: Trim runtime/templates/express.ts

Remove `EXPRESS_JS_RUNNER` and `generateExpressHtml` (everything after the
closing backtick+semicolon of `EXPRESS_MOCK_SETUP`), and remove the now-unused
`import { BASE_HTML_WRAPPER } from "./common";` at the top. The file should end
up containing only the import-free `EXPRESS_MOCK_SETUP` export.

**Verify**: `npm run typecheck` → exit 0. `npm test` → all pass.
`grep -rn "window.runMode\|generateExpressHtml" --include="*.ts" runtime/ components/` → no matches.

### Step 4: Full gate

**Verify**: `npm run lint` → exit 0. `npm run build` → exit 0 (the library
bundle must still build; `EXPRESS_MOCK_SETUP` and `HONO_MOCK_SETUP` reach it
via `runner.ts`).

## Test plan

No new tests. The existing suite — especially `runtime/runner.test.ts`, which
exercises `getSandboxHtml` for all 12 live modes — is the regression gate. If
any mode's generated HTML changes at all from this plan, something went wrong
(this plan must not affect runner.ts output).

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `ls runtime/templates/` shows exactly: `common.ts  express.ts  hono.ts`
- [ ] `grep -rn "window.runMode" --include="*.ts" .  | grep -v node_modules | grep -v plans` → no matches
- [ ] `npm run typecheck`, `npm run lint`, `npm test`, `npm run build` all exit 0
- [ ] No files outside the in-scope list are modified (`git status`)
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- Step 1's grep shows any surviving file importing a deletion target.
- Deleting a file produces a typecheck error in a file NOT in this plan's
  scope (means a reference this plan missed — report it, don't patch it).
- `runtime/runner.test.ts` fails after deletion (runner output should be
  byte-identical; a failure means runner.ts was somehow touched).

## Maintenance notes

- If the SQL mode is ever wanted: `git log --all -- runtime/templates/sql.ts`
  recovers the implementation, but it must be ported to the current
  `ENV_RECIPES` format (a recipe `logic` string defining `window.__RUN_MODE__`)
  — the recovered file's `window.runMode` form will not run under the current
  kernel.
- After this plan, "adding a mode = one entry in ENV_RECIPES" (per CLAUDE.md)
  is finally the *only* pattern in the tree; CLAUDE.md needs no update.
- Plan 004 (CDN pinning) assumes this deletion happened — it only pins the
  CDN URLs in `runner.ts`. If executed out of order, dead files would carry
  unpinned URLs (harmless but untidy).
