# Plan 013: Harden build-toolchain audit findings (Vite + esbuild)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat HEAD -- package.json package-lock.json vite.config.ts`
> If these files have changed since this plan was written, re-run `npm audit`
> and `npm ls esbuild vite tsup` before proceeding; the vulnerable dependency
> graph may have changed.

## Status

- **Priority**: P2
- **Effort**: S-M
- **Risk**: MEDIUM
- **Depends on**: 010
- **Category**: security (dev/build dependencies)
- **Planned at**: 2026-06-12 after plan 010 investigation

## Why this matters

After the dompurify/Monaco audit findings are resolved, `npm audit` still
reports dev/build-toolchain findings through Vite and esbuild:

- `vite<=6.4.1` has a moderate optimized-deps `.map` path traversal advisory.
- `esbuild<0.28.1` has high/moderate/low advisories, including binary
  integrity verification and dev-server exposure findings.
- `tsup@8.5.1` declares `esbuild@^0.27.0`, so plain `npm audit fix` can drift
  the lockfile from `esbuild@0.27.3` to `0.27.7` without resolving the audit
  issue.

This is dev/build tooling, not shipped runtime code, but it keeps CI/audit
noisy and should be fixed deliberately instead of hidden inside unrelated
dependency hygiene.

## Current state

- `package.json`:
  - `vite`: `^5.0.0`
  - `@vitejs/plugin-react`: `^4.3.4`
  - `tsup`: `^8.0.0`
  - `vitest`: `^4.1.8`
- `npm ls esbuild vite tsup` before this plan:

  ```
  tsup@8.5.1 -> esbuild@0.27.3
  vite@5.4.21 -> esbuild@0.21.5
  vitest@4.1.8 -> vite@8.0.16 -> esbuild@0.27.3
  ```

- Registry probe on 2026-06-12:
  - `esbuild@latest` is `0.28.1`.
  - `tsup@8.5.1` still depends on `esbuild@^0.27.0`.
  - `vite@6.4.3` exists on the previous Vite line, supports Node
    `^18.0.0 || ^20.0.0 || >=22.0.0`, and is above the vulnerable Vite range.
  - `vite@8.0.16` is latest but raises the Node engine floor to
    `^20.19.0 || >=22.12.0`.

The conservative path probed in `/private/tmp` was:

```json
"devDependencies": {
  "vite": "^6.4.3"
},
"overrides": {
  "esbuild": "0.28.1"
}
```

That reduced audit to only the dompurify/Monaco findings before plan 010, and
should reduce audit to zero after plan 010 is complete.

## Commands you will need

| Purpose       | Command                              | Expected on success |
|---------------|--------------------------------------|---------------------|
| Install       | `npm install`                        | exit 0; lockfile updated |
| Check chain   | `npm ls esbuild vite tsup`           | esbuild `0.28.1`; root Vite `6.4.3` |
| Re-audit      | `npm audit`                          | zero vulnerabilities |
| Typecheck     | `npm run typecheck`                  | exit 0 |
| Lint          | `npm run lint`                       | exit 0 |
| Tests         | `npm test`                           | all pass |
| Library build | `npm run build`                      | exit 0 |
| Demo build    | `npm run build:demo`                 | exit 0 |
| Dev smoke     | `npm run dev`                        | app loads; editor renders and executes |

## Scope

**In scope**:
- `package.json`
- `package-lock.json`

**Out of scope**:
- Source behavior changes.
- Vite 8 / plugin-react 5 or 6 migration unless Vite 6.4.3 fails.
- Replacing `tsup`.
- CI Node version changes unless local verification proves the existing CI
  Node 22 setup is incompatible.

## Steps

### Step 1: Apply the conservative toolchain fix

In `package.json`:

- Change `devDependencies.vite` from `^5.0.0` to `^6.4.3`.
- Add or merge:

```json
"overrides": {
  "esbuild": "0.28.1"
}
```

If another override already exists, merge this key into the existing
`overrides` object instead of replacing it.

Run `npm install`.

### Step 2: Verify the dependency graph

Run `npm ls esbuild vite tsup`.

Expected:

- root `vite` resolves to `6.4.3` or later within `^6.4.3`
- all reported esbuild instances resolve to `0.28.1`
- `tsup` remains on the existing major

### Step 3: Re-audit

Run `npm audit`.

Expected: zero vulnerabilities. If only a newly published unrelated advisory
appears, report it separately rather than broadening this plan.

### Step 4: Full gates + smoke tests

Run:

- `npm run typecheck`
- `npm run lint`
- `npm test`
- `npm run build`
- `npm run build:demo`

Then run `npm run dev` and smoke-test:

- the demo app loads at `http://localhost:5173`
- Monaco editor renders and accepts typing
- a basic mode executes code
- server/iframe modes still render without runtime console errors

## Test plan

No new unit tests are expected. This is a build-toolchain upgrade and override
change; verification is the full existing gate set plus browser smoke testing.

## Done criteria

- [ ] `npm audit` exits 0
- [ ] `npm ls esbuild vite tsup` shows Vite `6.4.x` and esbuild `0.28.1`
- [ ] `npm run typecheck` exits 0
- [ ] `npm run lint` exits 0
- [ ] `npm test` exits 0
- [ ] `npm run build` exits 0
- [ ] `npm run build:demo` exits 0
- [ ] Dev browser smoke test performed and reported
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back if:

- `npm install` upgrades Vite to 7 or 8 despite the `^6.4.3` range.
- `npm ls` shows more than one esbuild version after the override.
- Vite 6 breaks the dev server, demo build, or Vitest config.
- `npm audit` still reports the same Vite/esbuild advisories after the
  dependency graph matches this plan.
- The fix requires changing runtime source code.

## Maintenance notes

- This intentionally avoids Vite 8 because Vite 8 has a higher Node engine
  floor and a wider plugin/tooling migration surface.
- Revisit the `esbuild` override periodically. Once `tsup` or the chosen
  bundler accepts `esbuild@^0.28.1` naturally, remove the override and verify
  audit remains clean.
