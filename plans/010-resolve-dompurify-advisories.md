# Plan 010: Resolve the dompurify XSS advisories in the monaco-editor dependency chain

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 341dafd..HEAD -- package.json package-lock.json`
> If these changed since this plan was written, re-run `npm audit` first — the
> advisories may already be resolved; if `npm audit` shows no dompurify
> entries, mark this plan REJECTED (already fixed) in `plans/README.md` and stop.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: security (dependencies)
- **Planned at**: commit `341dafd`, 2026-06-12

## Why this matters

`npm audit` reports 8 moderate XSS/prototype-pollution advisories against
`dompurify@3.2.7` (vulnerable range `<=3.3.3`), pulled in transitively:
`@monaco-editor/react@4.7.0` → peer `monaco-editor@0.55.1` → `dompurify@3.2.7`.
Runtime exposure is limited — `components/CodeEditor.tsx` imports only
`@monaco-editor/react`, which loads the actual Monaco bundle from a CDN at
runtime, so the locally installed `monaco-editor` package is mostly a
types/peer artifact. But every consumer who installs this library inherits the
audit findings, and `npm audit` says a **non-breaking** fix is available. This
is cheap hygiene for a published package.

## Current state

- `package.json` — dependencies: `@monaco-editor/react@^4.6.0`,
  `lucide-react@^0.469.0`. `monaco-editor` is **not** declared; npm auto-installs
  it as a peer of `@monaco-editor/react` (peer range `>= 0.25.0 < 1`).
- Dependency chain (from `npm ls dompurify`):

  ```
  code-shoebox@1.0.16
  └─┬ @monaco-editor/react@4.7.0
    └─┬ monaco-editor@0.55.1
      └── dompurify@3.2.7
  ```

- `npm audit` (2026-06-12): 8 dompurify advisories (all moderate; e.g.
  GHSA-v2wj-7wpq-c8vv, GHSA-h8r8-wccr-v5f2), reported as
  "fix available via `npm audit fix`" (no `--force` needed). Separately, 1
  esbuild advisory via `vite<=6.4.1` requires `--force` to vite 8 (breaking) —
  that one is **out of scope** here (dev-only; tracked as a deferred finding
  in `plans/README.md`).
- The audit output also notes `monaco-editor >=0.54.0-dev-20250909` depends on
  vulnerable dompurify versions, so the resolver may fix this either by
  bumping dompurify within monaco's semver range, or by selecting
  `monaco-editor@0.53.x` (which has no dompurify dependency at all —
  verified: `npm view monaco-editor@0.53.0 dependencies` →
  `{ '@types/trusted-types': '^1.0.6' }`). Either outcome is acceptable; the
  peer range `>= 0.25.0 < 1` admits both.

## Commands you will need

| Purpose       | Command                              | Expected on success                       |
|---------------|--------------------------------------|-------------------------------------------|
| Install       | `npm ci`                             | exit 0                                    |
| The fix       | `npm audit fix`                      | exit 0; lockfile updated                  |
| Check chain   | `npm ls dompurify monaco-editor`     | dompurify ≥3.4.0, or absent entirely      |
| Re-audit      | `npm audit`                          | no dompurify entries (esbuild/vite may remain) |
| Typecheck     | `npm run typecheck`                  | exit 0                                    |
| Lint          | `npm run lint`                       | exit 0                                    |
| Tests         | `npm test`                           | all pass                                  |
| Library build | `npm run build`                      | exit 0; dist/ written                     |
| Dev smoke     | `npm run dev`                        | editor loads and edits text               |

## Scope

**In scope** (the only files you should modify):
- `package-lock.json` (via `npm audit fix` / `npm install`, not by hand)
- `package.json` (ONLY if the fallback in Step 2 is needed — an `overrides` block)

**Out of scope** (do NOT touch):
- The vite/esbuild advisory (`npm audit fix --force` would install vite 8 — a
  breaking dev-stack change; deliberately deferred, see plans/README.md).
- Source files, `tsconfig.json`, CI config.
- Upgrading `@monaco-editor/react` beyond the existing `^4.6.0` semver range.

## Git workflow

- Branch: `advisor/010-dompurify-advisories`
- Commit style: short imperative subject, e.g. `Resolve dompurify advisories via npm audit fix`.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Apply the non-breaking fix

Run `npm audit fix` (WITHOUT `--force`).

**Verify**:
- `npm ls dompurify` → either shows dompurify `>=3.4.0`, or reports the
  package is no longer in the tree (monaco downgraded to 0.53.x).
- `npm audit` → zero dompurify entries. The esbuild/vite advisory remaining
  is expected; do not fix it.
- `git diff --stat` → only `package-lock.json` changed (and possibly
  `package.json` if npm bumped a range — acceptable as long as
  `@monaco-editor/react` stays within `^4`).

### Step 2 (fallback — only if Step 1 leaves dompurify <=3.3.3 in the tree):

Add an overrides block to `package.json`:

```json
"overrides": {
  "dompurify": "^3.4.0"
}
```

Then `npm install` to apply, and re-run the Step 1 verifications.

### Step 3: Full gates + editor smoke test

Run all of: `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`.

Then `npm run dev`, open http://localhost:5173 and confirm: the Monaco editor
renders, accepts typing, and syntax-highlights; switch to the TypeScript demo
and confirm type errors still squiggle (Monaco TS services intact). This
guards the case where the resolver chose a different `monaco-editor` version
and `@monaco-editor/react`'s type imports shifted.

**Verify**: all commands exit 0; both editor checks pass.

## Test plan

No new tests — this is a lockfile-level change. The gate is the full existing
suite plus the Step 3 manual editor smoke test.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `npm audit 2>&1 | grep -c dompurify` → 0
- [ ] `npm run typecheck` exits 0
- [ ] `npm run lint` exits 0
- [ ] `npm test` exits 0
- [ ] `npm run build` exits 0
- [ ] `git status` shows changes only to `package-lock.json` (and
      `package.json` only if Step 2 fired)
- [ ] Step 3 editor smoke test performed and reported
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- `npm audit fix` wants to change `@monaco-editor/react` to a new major, or
  changes anything outside the monaco/dompurify chain.
- After both Step 1 and Step 2, dompurify advisories persist — the upstream
  state has changed since planning; report the current `npm audit` output.
- The editor fails to load in the Step 3 smoke test — revert the lockfile
  (`git checkout package-lock.json && npm ci`) and report which monaco version
  the resolver picked.

## Maintenance notes

- If a future change pins or bundles `monaco-editor` directly (e.g. to drop
  the CDN loader), re-check this chain — the advisory range was
  `monaco-editor >=0.54.0-dev-20250909` at planning time.
- The deferred vite-major upgrade (vite 5 → 8) will clear the remaining
  esbuild advisory when someone takes it on; it needs its own plan with a
  demo-app regression pass.
