# Plan 011: Small fixes — package metadata, stale doc version, undocumented HTML modes

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 341dafd..HEAD -- package.json README.md ENVIRONMENTS_README.md`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P3
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: dx / docs
- **Planned at**: commit `341dafd`, 2026-06-12

## Why this matters

Three small, independent paper cuts on a published package:

1. `package.json` has an empty `author` and no `repository`/`homepage` —
   consumers landing on the package can't find the maintainer or the repo.
2. `ENVIRONMENTS_README.md` (the self-described authoritative environment
   inventory) pins itself to `v1.0.15` while the package is at `1.0.16` —
   actively-wrong docs are worse than no version pin at all.
3. `README.md`'s feature list omits the two newest environment modes (`html`
   and `html-css`), which shipped in the last release cycle and are fully
   documented in `ENVIRONMENTS_README.md`. New users reading only the README
   won't know they exist.

## Current state

- `package.json:62` — `"author": "",` and there is no `repository` or
  `homepage` field anywhere in the file. The package is published via GitHub
  branch; the README's install snippet references
  `github:rmccrear/code-shoebox` (that is the canonical repo slug).
  Git identity in this clone: `Robert McCreary Mannino`.
- `ENVIRONMENTS_README.md:4`:

  ```
  This document provides a detailed inventory of the execution environments available in CodeShoebox (`v1.0.15`).
  ```

- `README.md:9–21` — the `Multiple Environments` feature list starts at
  line 11 with `- \`dom\`: Standard JavaScript manipulation.` and ends with
  `- \`node-ts\`: ...`. It contains no `html` or `html-css` entries.
  For reference, the authoritative descriptions are in
  `ENVIRONMENTS_README.md` (sections covering HTML and HTML & CSS) and the
  recipes are `html` and `html-css` in `runtime/runner.ts` (`ENV_RECIPES`).
  The `html` mode renders a static page with **no JS execution**; `html-css`
  is the two-tab variant (`index.html` + `style.css`, bundled via
  `runtime/fileBundle.ts`).
- `scripts/prepare-dist.js` — rewrites `package.json` for the published `dist`
  branch: strips the `dist/` path prefixes, removes the `files` allowlist,
  drops `scripts` and `devDependencies`. It does NOT remove other top-level
  fields, so `author`/`repository`/`homepage` added here will flow through to
  the published artifact unchanged. Do not edit this script.

## Commands you will need

| Purpose       | Command                              | Expected on success |
|---------------|--------------------------------------|---------------------|
| JSON sanity   | `node -e "require('./package.json')"`| exit 0, no output   |
| Typecheck     | `npm run typecheck`                  | exit 0              |
| Lint          | `npm run lint`                       | exit 0              |
| Tests         | `npm test`                           | all pass            |

## Scope

**In scope** (the only files you should modify):
- `package.json`
- `ENVIRONMENTS_README.md`
- `README.md`

**Out of scope** (do NOT touch):
- `scripts/prepare-dist.js` — already passes the new fields through.
- The README install snippet's version number (`v1.0.16`) — it is correct and
  is updated by the release flow, not this plan.
- Adding an `exports` map or `sideEffects` flag to `package.json` — a related
  but riskier change (it interacts with `prepare-dist.js` path rewriting);
  deliberately deferred, see plans/README.md.
- `template_descriptions/*.md`, `docs.ts`.

## Git workflow

- Branch: `advisor/011-metadata-and-docs`
- Commit style: short imperative subject, e.g. `Add package metadata and document HTML modes`.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Fill in package metadata

In `package.json`, replace `"author": "",` with:

```json
"author": "Robert McCreary Mannino",
"repository": {
  "type": "git",
  "url": "https://github.com/rmccrear/code-shoebox.git"
},
"homepage": "https://github.com/rmccrear/code-shoebox#readme",
```

**Verify**: `node -e "const p=require('./package.json'); if(!p.author||!p.repository||!p.homepage) process.exit(1)"` → exit 0.

### Step 2: Un-pin the version in ENVIRONMENTS_README.md

Change line 4 to drop the stale version reference entirely (so it cannot rot
again):

```
This document provides a detailed inventory of the execution environments available in CodeShoebox.
```

**Verify**: `grep -c "v1.0.15" ENVIRONMENTS_README.md` → 0.

### Step 3: Document the HTML modes in the README feature list

In `README.md`, insert two bullets at the TOP of the `Multiple Environments`
list (before the `- \`dom\`:` line), matching the list's existing voice:

```markdown
  - `html`: Static HTML pages with live preview (no JavaScript execution).
  - `html-css`: Two-tab HTML & CSS editing (`index.html` + `style.css`) with live preview.
```

**Verify**: `grep -n '`html`\|`html-css`' README.md` → both bullets present in
the Features section.

### Step 4: Run the standard gates

**Verify**: `npm run typecheck` → exit 0; `npm run lint` → exit 0;
`npm test` → all pass.

## Test plan

No new tests — metadata and prose only. The gate is the existing suite
(`npm test`) plus the grep checks above.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `node -e "const p=require('./package.json'); if(!p.author||!p.repository||!p.homepage) process.exit(1)"` exits 0
- [ ] `grep -c "v1.0.15" ENVIRONMENTS_README.md` → 0
- [ ] README Features section lists both `html` and `html-css`
- [ ] `npm run typecheck` && `npm run lint` && `npm test` all exit 0
- [ ] No files outside the in-scope list are modified (`git status`)
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- The GitHub slug `rmccrear/code-shoebox` appears to be wrong (e.g.
  `git remote -v` shows a different owner/name) — use what the remote says
  and note the discrepancy in your report.
- `README.md`'s feature list has been restructured since planning (drift).

## Maintenance notes

- When a new environment mode ships, both the README feature list and
  `ENVIRONMENTS_README.md` need entries — consider that part of any future
  "add a mode" plan's done criteria.
- Deferred from this plan: `exports` map + `sideEffects: false` in
  `package.json`. Whoever takes it must mirror the path rewriting in
  `scripts/prepare-dist.js` (the map's `./dist/...` paths must be stripped for
  the dist branch) and verify with a consumer install from the `dist` branch.
