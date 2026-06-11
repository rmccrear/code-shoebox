# Plan 001: Establish a working verification baseline (typecheck, lint, CI)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 00c9834..HEAD -- vite.config.ts package.json components/CodingEnvironment.tsx components/ServerOutput.tsx Demo.tsx runtime/runner.ts runtime/types.ts`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.
> **Note**: this plan was written against a working tree that had uncommitted
> changes on top of `00c9834` (including the entire Vitest test suite, which is
> untracked at that commit). If `npm test` reports "no test files found", the
> working-tree state was lost — STOP.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: LOW
- **Depends on**: none
- **Category**: dx
- **Planned at**: commit `00c9834`, 2026-06-10

## Why this matters

This repo currently has no working quality gate. `npm run lint` fails outright
(`eslint: command not found` — eslint is not a devDependency and no config file
exists), `npx tsc --noEmit` fails with 18 errors, there is no `typecheck`
script, and there is no CI configuration at all (no `.github/` directory).
Every other plan in `plans/` cites "typecheck passes, lint passes, tests pass"
as its done criteria — this plan is what makes those criteria checkable. It is
the prerequisite for all other plans.

## Current state

- `package.json` — `"lint": "eslint ."` exists (line 20) but eslint is not
  installed and there is no eslint config anywhere. There is no `typecheck`
  script. Test script is `"test": "vitest run"` and currently passes
  (3 files, 22 tests, ~1.5s).
- `vite.config.ts` — has a real type error (TS2769). Lines 1–6 today:

  ```ts
  /// <reference types="vitest/config" />
  import { defineConfig } from 'vite';
  import react from '@vitejs/plugin-react';

  // https://vitejs.dev/config/
  export default defineConfig({
  ```

  The `test:` block at line 15 is not part of Vite's `UserConfigExport` type.
  With Vitest 4, the fix is to import `defineConfig` from `'vitest/config'`
  instead of `'vite'`.
- `npx tsc --noEmit` reports exactly these errors today (all TS6133 "declared
  but never read" unless noted):
  - `components/CodingEnvironment.tsx(6,3)` `Book`, `(7,3)` `Brain`, `(8,3)` `Lock`, `(13,3)` `Maximize2` — unused lucide-react icon imports.
  - `components/CodingEnvironment.tsx(18,1)` — `HelpSidebar` imported, never rendered.
  - `components/CodingEnvironment.tsx(48,10)` `isHelpOpen` / `(48,22)` `setIsHelpOpen` — `const [isHelpOpen, setIsHelpOpen] = useState(false);` never used.
  - `components/CodingEnvironment.tsx(56,9)` `hasDocs` — `const hasDocs = !!getDocsForMode(environmentMode);` never used. NOTE: once `hasDocs` is removed, the `import { getDocsForMode } from '../docs';` on line 21 also becomes unused — remove it too.
  - `components/ServerOutput.tsx(3,10)` `Send`, `(3,44)` `XCircle` — unused icon imports (the line imports `Send, Server, Clock, AlertCircle, XCircle, GripHorizontal`; only `Server`, `Clock`, `AlertCircle`, `GripHorizontal` are used).
  - `components/ServerOutput.tsx(42,18)` `setMethod` — `const [method, setMethod] = useState('GET');` — `method` IS used (request payload + UI badge + effect deps); only the setter is unused. Change to `const [method] = useState('GET');`.
  - `Demo.tsx(2,27)` `Box` (unused icon in the lucide-react import) and `(5,18)` `Theme` (unused type in `import { themes, Theme } from './theme';` → keep `themes`).
  - `runtime/runner.ts(2,46)` `BabelPreset` — unused in `import { EnvironmentMode, EnvironmentRecipe, BabelPreset } from "./types";`.
  - `runtime/templates/express.ts(163,37)` and `runtime/templates/express-ts.ts(44,39)` — unused `showPlaceholder` parameters on `generateExpressHtml` / `generateExpressTsHtml`. These two functions are DEAD CODE that plan 003 deletes entirely. For this plan, just delete the unused parameter (one-line change each); do not refactor these files further.
  - `runtime/types.ts(2,1)` — `import React from 'react';` unused (file is types-only).
  - `vite.config.ts(15,3)` — the TS2769 described above.
- `npm audit` reports 5 vulnerabilities (4 moderate, 1 high — picomatch ReDoS),
  all in devDependencies.
- These unused symbols around `HelpSidebar`/`getDocsForMode` are remnants of a
  disconnected in-app help feature. Removing the unused *references* is
  correct; do NOT delete `components/HelpSidebar.tsx` or `docs.ts` themselves
  (a future revival of that feature was considered and may still happen).

## Commands you will need

| Purpose   | Command              | Expected on success |
|-----------|----------------------|---------------------|
| Install   | `npm install`        | exit 0              |
| Typecheck | `npx tsc --noEmit`   | exit 0, no output   |
| Tests     | `npm test`           | 3 files, 22 tests pass |
| Lint      | `npm run lint`       | exit 0 (after this plan) |
| Build     | `npm run build`      | exit 0, writes `dist/` |

## Scope

**In scope** (the only files you should modify/create):
- `vite.config.ts`
- `components/CodingEnvironment.tsx`, `components/ServerOutput.tsx`, `Demo.tsx`,
  `runtime/runner.ts`, `runtime/types.ts`, `runtime/templates/express.ts`,
  `runtime/templates/express-ts.ts` — unused-symbol removals ONLY
- `package.json`, `package-lock.json` — scripts + devDependencies + audit fix
- `eslint.config.js` (create)
- `.github/workflows/ci.yml` (create)

**Out of scope** (do NOT touch):
- `components/HelpSidebar.tsx` and `docs.ts` — keep the files; only remove the
  unused imports/variables that reference them.
- Any behavior change anywhere. This plan removes dead symbols and adds
  tooling; rendered output must be identical.
- `runtime/templates/*.ts` beyond the two one-line parameter deletions listed.
- `tsconfig.json` — do not loosen compiler options to make errors disappear.

## Git workflow

- Branch: `advisor/001-verification-baseline`
- Commit style per `git log`: short imperative subject, e.g.
  "Add server startup timeout to prevent hanging requests". One commit per step
  is fine.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Fix the vite.config.ts type error

Change line 2 from `import { defineConfig } from 'vite';` to
`import { defineConfig } from 'vitest/config';`. Keep everything else,
including the `/// <reference types="vitest/config" />` line (harmless) and the
react plugin import.

**Verify**: `npx tsc --noEmit 2>&1 | grep vite.config` → no output.
`npm test` → 22 tests pass.

### Step 2: Remove the unused symbols listed in Current state

Make exactly the removals listed above. For `setMethod`, use
`const [method] = useState('GET');` (preserves the state value and effect-dep
behavior). For `CodingEnvironment.tsx`, remove the four icon names from the
import list, the `HelpSidebar` import line, the `isHelpOpen` useState line, the
`hasDocs` line, and the `getDocsForMode` import.

**Verify**: `npx tsc --noEmit` → exit 0, zero errors.
`npm test` → 22 tests pass.

### Step 3: Add a typecheck script

In `package.json` scripts, add: `"typecheck": "tsc --noEmit"`.

**Verify**: `npm run typecheck` → exit 0.

### Step 4: Install and configure ESLint (flat config)

`npm install --save-dev eslint typescript-eslint eslint-plugin-react-hooks globals`

Create `eslint.config.js` (the repo is `"type": "module"`, so ESM syntax works):

```js
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';

export default tseslint.config(
  { ignores: ['dist', '.demo-site', 'node_modules', '.agents', '.claude', 'plans', 'scripts'] },
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    plugins: { 'react-hooks': reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // The runtime templates intentionally use `any`-ish dynamic patterns;
      // tune these rather than fighting them:
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
);
```

Run `npm run lint`. Fix what is quick and safe (unused vars should already be
gone from step 2). If rules produce a large number of errors that would require
behavior-risky edits (e.g. `no-empty` on intentional empty catches in the
runtime logic strings, `@typescript-eslint/no-unused-expressions` in template
strings), disable those specific rules in `eslint.config.js` with a one-line
comment saying why. The deliverable is a *meaningful* config that exits 0, not
a maximal one.

**Verify**: `npm run lint` → exit 0. `npm test` → 22 tests pass.

### Step 5: Apply the safe dependency audit fix

Run `npm audit fix` (NOT `--force`). Then check nothing major moved:
`git diff package.json` — devDependency ranges may tighten but no package may
change major version.

**Verify**: `npm test` → 22 tests pass. `npm run build` → exit 0.
If `npm audit` still reports issues afterward, that is acceptable — note the
remaining count in your report; they are dev-only.

### Step 6: Add CI

Create `.github/workflows/ci.yml`:

```yaml
name: CI
on:
  push:
    branches: [main]
  pull_request:

jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run typecheck
      - run: npm run lint
      - run: npm test
      - run: npm run build
```

**Verify**: `npx tsc --noEmit && npm run lint && npm test && npm run build`
→ all exit 0 locally (CI itself can only be verified after push).

## Test plan

No new tests — this plan must not change behavior. The existing suite
(3 files / 22 tests) is the regression gate and must pass unchanged after every
step.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `npm run typecheck` exits 0
- [ ] `npm run lint` exits 0 (eslint actually runs — `npx eslint --version` succeeds)
- [ ] `npm test` exits 0 with 22 passing tests
- [ ] `npm run build` exits 0
- [ ] `.github/workflows/ci.yml` exists and runs typecheck, lint, test, build
- [ ] `git status` shows no modified files outside the in-scope list
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- `npm test` reports zero test files (the untracked test suite was lost — see
  drift note at top).
- After step 1, `tsc` reports errors OTHER than the TS6133 list in Current
  state (the codebase drifted).
- Step 4 lint cleanup would require changing any runtime behavior (anything in
  a `logic`/mock template string, any hook dependency array) — report the rule
  and location instead of editing.
- `npm audit fix` changes the major version of vite, vitest, react, or
  typescript.

## Maintenance notes

- Plan 003 deletes `runtime/templates/express-ts.ts` and most of
  `runtime/templates/express.ts`'s tail; the two parameter removals here will
  disappear with it. That's expected.
- The removed `HelpSidebar`/`getDocsForMode`/`isHelpOpen` references were an
  unfinished in-app help feature. If it is revived later, `HelpSidebar.tsx` and
  `docs.ts` are still in the repo, and `git log` has the wiring that was
  removed here.
- Reviewer: scrutinize step 2's diff for anything that is more than a deletion;
  and check the eslint config's disabled rules each have a justification.
