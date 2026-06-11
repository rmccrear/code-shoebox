# Plan 005: Small fixes — splitter listener leak, console log cap, localStorage validation, README version

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 00c9834..HEAD -- components/CodingEnvironment.tsx components/OutputFrame.tsx components/ServerOutput.tsx components/Console.tsx hooks/useSandboxState.ts hooks/useSandboxState.test.ts README.md`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition. (Exception: plan 001 removed unused
> imports/vars in CodingEnvironment.tsx and ServerOutput.tsx — those deletions
> are expected.)

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: plans/001-verification-baseline.md
- **Category**: bug (a), perf (b), bug (c), docs (d)
- **Planned at**: commit `00c9834`, 2026-06-10

## Why this matters

Four small, independent, verified issues bundled into one pass:

(a) The editor/output splitter in `CodingEnvironment` leaks a global `mouseup`
listener on every drag because `removeEventListener` is given a *different*
anonymous function than `addEventListener` received — the removal never
matches.
(b) Console logs accumulate without bound; a p5 sketch that logs in `draw()`
(60×/second — a typical learner mistake) grows the array and the re-render
cost forever.
(c) Values read back from localStorage are cast to enum types unvalidated; a
stale value written by an older version (e.g. a since-removed mode name) puts
an invalid mode into state.
(d) The README tells users to install `#v1.0.15` while `package.json` is at
`1.0.16` — readers install the previous release.

## Current state

### (a) Splitter leak — `components/CodingEnvironment.tsx:78-87`

```tsx
useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', () => setIsDragging(false));
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', () => setIsDragging(false));
    };
  }, [isDragging, handleMouseMove]);
```

The two `() => setIsDragging(false)` arrows are different function objects, so
the mouseup listener is never removed. The repo already contains the correct
pattern — **match this exemplar** from `components/OutputFrame.tsx:118-134`:

```tsx
const handleMouseUp = useCallback(() => setIsDragging(false), []);

useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'row-resize';
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
    }
    return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);
```

(For CodingEnvironment, omit the `document.body.style.cursor` lines — it
doesn't set a cursor today; this is a leak fix, not a feature.)

### (b) Unbounded logs — `components/OutputFrame.tsx` and `components/ServerOutput.tsx`

Every log append has the shape `setLogs(prev => [...prev, {...}])`. Append
sites: `OutputFrame.tsx:38-44` (`addSystemLog`) and `:56-64` (port message
handler); `ServerOutput.tsx:55-57` (`addSystemLog`), `:99-113` (two sites
inside `handleSandboxMessage`). `components/Console.tsx` renders the full
`logs` array and is not memoized (`export const Console: React.FC<...>` at
`Console.tsx:21`).

### (c) Unvalidated localStorage reads — `hooks/useSandboxState.ts:41-47`

```ts
const loadState = <T extends string>(keySuffix: string, fallback: T): T => {
    if (!persistenceKey || typeof window === 'undefined') return fallback;
    try {
      const saved = localStorage.getItem(getStorageKey(keySuffix));
      return (saved as T) || fallback;
    } catch { return fallback; }
  };
```

Call sites (lines 60–62): `loadState('env_mode', defaultMode)` (an
`EnvironmentMode`), `loadState('theme_mode', 'dark')` (a `ThemeMode`),
`loadState('theme_name', themes[0].name)` (must be a name in `themes` from
`../theme`). The valid mode list (12 modes) appears verbatim in
`runtime/runner.test.ts:5-8`:

```ts
const ALL_MODES: EnvironmentMode[] = [
  'dom', 'typescript', 'p5', 'p5-ts', 'react', 'react-ts',
  'express', 'express-ts', 'hono', 'hono-ts', 'node-js', 'node-ts'
];
```

Check `types.ts` for the `ThemeMode` union members before writing the
theme-mode validator (the `EnvironmentMode` union is at `types.ts:12`).

### (d) README — `README.md:28-34`

```
To install version **v1.0.15**:

​```bash
npm install github:rmccrear/code-shoebox#v1.0.15
# or
yarn add github:rmccrear/code-shoebox#v1.0.15
​```
```

`package.json` `"version"` is `1.0.16`.

## Commands you will need

| Purpose   | Command              | Expected on success |
|-----------|----------------------|---------------------|
| Typecheck | `npm run typecheck`  | exit 0              |
| Tests     | `npm test`           | all pass            |
| One file  | `npx vitest run hooks/useSandboxState.test.ts` | all pass |
| Lint      | `npm run lint`       | exit 0              |

## Scope

**In scope**:
- `components/CodingEnvironment.tsx` (fix a)
- `components/OutputFrame.tsx`, `components/ServerOutput.tsx`,
  `components/Console.tsx` (fix b)
- `hooks/useSandboxState.ts`, `hooks/useSandboxState.test.ts` (fix c + tests)
- `README.md` (fix d — the three `v1.0.15` occurrences only)

**Out of scope** (do NOT touch):
- `scripts/release.js` — automating the README version stamp is a noted
  follow-up, not this plan.
- Building a method selector or otherwise extending ServerOutput's UI.
- Any change to the kernel/template strings in `runtime/`.
- localStorage *write* paths and the persistence key scheme — reads only.

## Git workflow

- Branch: `advisor/005-small-fixes`
- Commit style: short imperative subject (match `git log`). One commit per
  lettered fix is ideal (4 commits).
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Fix the splitter listener leak (a)

In `components/CodingEnvironment.tsx`, add
`const handleMouseUp = useCallback(() => setIsDragging(false), []);` next to
the existing `handleMouseMove` (line 69), and rewrite the effect at lines 78–87
to match the OutputFrame exemplar shown above (add/remove the same stable
references; include `handleMouseUp` in the dependency array; keep the
else-branch removal AND the cleanup-function removal).

**Verify**: `npm run typecheck` → exit 0. `npm test` → all pass.

### Step 2: Cap the console log buffer and memoize Console (b)

In BOTH `components/OutputFrame.tsx` and `components/ServerOutput.tsx`, add at
module top level:

```ts
const MAX_CONSOLE_LOGS = 500;
const appendLog = (prev: LogEntry[], entry: LogEntry): LogEntry[] =>
  prev.length >= MAX_CONSOLE_LOGS
    ? [...prev.slice(-(MAX_CONSOLE_LOGS - 1)), entry]
    : [...prev, entry];
```

and change every `setLogs(prev => [...prev, {...}])` append site (listed in
Current state) to `setLogs(prev => appendLog(prev, {...}))`. The one
*non-append* call `setLogs([])` stays as is.

In `components/Console.tsx`, wrap the component in `React.memo`:

```tsx
export const Console = React.memo(function Console({ logs, onClear, themeMode, className = '' }: ConsoleProps) {
  ...same body...
});
```

Note: `Console.tsx` exports `LogEntry`; both host components import it — the
helper's type annotation needs no new imports.

**Verify**: `npm run typecheck` → exit 0. `npm test` → all pass.
`grep -n "\[...prev, {" components/OutputFrame.tsx components/ServerOutput.tsx` → no matches.

### Step 3: Validate localStorage reads (c)

In `hooks/useSandboxState.ts`, extend `loadState` with an allow-list:

```ts
const loadState = <T extends string>(keySuffix: string, fallback: T, validValues?: readonly string[]): T => {
    if (!persistenceKey || typeof window === 'undefined') return fallback;
    try {
      const saved = localStorage.getItem(getStorageKey(keySuffix));
      if (!saved) return fallback;
      if (validValues && !validValues.includes(saved)) return fallback;
      return saved as T;
    } catch { return fallback; }
  };
```

Define the mode list in the hook file (typed against the union so the compiler
catches drift):

```ts
const VALID_MODES: readonly EnvironmentMode[] = [
  'dom', 'typescript', 'p5', 'p5-ts', 'react', 'react-ts',
  'express', 'express-ts', 'hono', 'hono-ts', 'node-js', 'node-ts'
];
```

Update the three call sites: `loadState('env_mode', defaultMode, VALID_MODES)`;
`loadState('theme_mode', 'dark', [...])` using the `ThemeMode` union members
you confirmed in `types.ts`; `loadState('theme_name', themes[0].name,
themes.map(t => t.name))`.

**Verify**: `npm run typecheck` → exit 0.
`npx vitest run hooks/useSandboxState.test.ts` → all pass.

### Step 4: Tests for (c)

In `hooks/useSandboxState.test.ts`, following the file's existing style
(`renderHook`, real localStorage from jsdom, keys shaped
`cs_<persistenceKey>_<suffix>` — see the existing test at lines 17–22), add:

- "falls back to the default mode when localStorage holds an unknown mode":
  `localStorage.setItem('cs_lesson-x_env_mode', 'sql')`, render
  `useSandboxState('lesson-x')`, expect `environmentMode` to be `'dom'`.
- "honors a valid persisted mode": set `cs_lesson-y_env_mode` to `'p5'`,
  render with key `lesson-y`, expect `'p5'`.

(If the suite doesn't already clear localStorage between tests — check
`test/setup.ts` — use distinct persistence keys per test, as the existing
tests do.)

**Verify**: `npx vitest run hooks/useSandboxState.test.ts` → all pass,
including the 2 new tests.

### Step 5: README version (d)

Replace all three `v1.0.15` occurrences in `README.md` lines 28–33 with
`v1.0.16` (or with the current `version` from `package.json` if it has been
bumped since this plan was written — check first).

**Verify**: `grep -c "v1.0.15" README.md` → 0.
`npm run lint && npm test` → exit 0, all pass.

## Test plan

- Two new tests in `hooks/useSandboxState.test.ts` (step 4), modeled on the
  existing tests in that file.
- Fixes (a) and (b) have no jsdom-testable surface (global listener identity
  and render-frequency are browser concerns) — covered by typecheck + existing
  suite + reviewer reading the diff against the exemplar.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `grep -c "setIsDragging(false))" components/CodingEnvironment.tsx` shows the anonymous-arrow add/remove pair is gone (the only `setIsDragging(false)` in a listener context is inside the `handleMouseUp` useCallback)
- [ ] `grep -n "appendLog" components/OutputFrame.tsx components/ServerOutput.tsx` → every former append site converted
- [ ] `grep -c "React.memo" components/Console.tsx` → 1
- [ ] `npm run typecheck`, `npm run lint` exit 0
- [ ] `npm test` exits 0 with 2 new useSandboxState tests passing
- [ ] `grep -c "v1.0.15" README.md` → 0
- [ ] No files outside the in-scope list are modified (`git status`)
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- The excerpts in Current state don't match the live code beyond plan 001's
  expected unused-symbol deletions.
- A new useSandboxState test fails because localStorage leaks between tests
  and distinct keys don't isolate it — report rather than adding global
  setup changes.
- `ThemeMode` in `types.ts` turns out not to be a small string union (the
  validator approach assumes it is).

## Maintenance notes

- `VALID_MODES` in `useSandboxState.ts` must be updated when a mode is added
  to the `EnvironmentMode` union — the `readonly EnvironmentMode[]` typing
  catches removals but NOT missing additions; reviewer should remember this
  (a `satisfies`-based exhaustiveness trick was considered and skipped for
  simplicity).
- `MAX_CONSOLE_LOGS = 500` is a guess at a sane bound; if learners need deeper
  scrollback, raise it — the cap mechanism is the point.
- Deferred follow-ups: stamping the README install version automatically in
  `scripts/release.js`; an HTTP method selector for ServerOutput (the
  `method` state is currently fixed to `'GET'`).
