# Plan 018: Persistence-key lifecycle contract — docs, save guard, test coverage

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 0274daa..HEAD -- hooks/useSandboxState.ts hooks/useAutoKey.ts hooks/useSandboxState.test.ts README.md CLAUDE.md`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Implementation**: DONE on `codex/persistence-key-lifecycle`, 2026-08-17
- **Priority**: P2 — hardening; the live consumer bug is fixed host-side
- **Effort**: S–M
- **Risk**: LOW–MED (touches the primary consumer-facing hook, but the guard
  is a no-op for every correct consumer)
- **Depends on**: none in this repo. The external sequencing gate is cleared:
  Lesson Architect PR #157 merged as `b240f6e0e3127fe329e174e39067ba1810ef8ccd`.
- **Category**: bug-hardening / docs / tests
- **Planned at**: commit `0274daa` (v1.0.24), 2026-08-17
- **Tracks**: [code-shoebox issue #7](https://github.com/rmccrear/code-shoebox/issues/7)
- **Origin**: root-cause analysis of
  [Lesson-Architect issue #156](https://github.com/rmccrear/Lesson-Architect/issues/156)
  (learner drafts destroyed by lesson navigation) and its
  [Plan 028 / PR #157](https://github.com/rmccrear/Lesson-Architect/pull/157)

## Why this matters

`useSandboxState` hydrates **only at mount**: every localStorage read happens
inside a `useState` initializer, and React never reruns initializers when hook
arguments change. But the persistence effect *does* react to argument changes —
`persistenceKey` is in its dependency array. So when a host changes the key on
a mounted hook, the effect fires immediately with the previous key's state and
writes it wholesale into the new key's namespace. The new namespace's saved
draft is destroyed before the host has any chance to intervene.

This is not hypothetical. Lesson Architect renders one `CodingActivityWidget`
in a stable tree position and recomputes `useAutoKey(title, starterCode)` when
the learner navigates between coding activities. The still-mounted hook wrote
activity A's code under activity B's key, the host then reset to B's starter,
and the round trip back destroyed A's saved draft — permanent, reload-proof
loss of learner work (Lesson-Architect #156, P0 there). The README's own
"Automatic Key Generation" example wires `useAutoKey` props straight into
`useSandboxState`, so any consumer copying the example inherits the hazard.

The host-side fix (remount on identity change, via a React `key`) merged in
Lesson Architect PR #157. This plan makes the *package* safe by
contract and by construction: document that the identity arguments are
mount-stable, and make the save effect refuse to write under a key it never
hydrated from.

## Baseline state before implementation

Relevant files:

- `hooks/useSandboxState.ts` — the primary consumer-facing hook.
  Hydration-only-at-mount initializers at lines 77–82; persistence effect at
  lines 85–91; `switchMode`/`resetCode` at 94–105.
- `hooks/useAutoKey.ts` — key helper. `useMemo` at lines 16–44 bakes
  `window.location.pathname` into the hash but lists only
  `[identifier, initialCode, prefix]` as deps.
- `hooks/useSandboxState.test.ts` — covers persistence, mode switching,
  `sessionId` bumps, ephemeral mode. **No test changes the key on a mounted
  hook.**
- `README.md` — "Persistence Strategy" section (~line 270) with the
  `useAutoKey` example (~line 288).
- `CLAUDE.md` — hook notes at line 79.

The defect, concretely. `hooks/useSandboxState.ts:77–91`:

```tsx
const [environmentMode, setEnvironmentMode] = useState<EnvironmentMode>(() => loadState('env_mode', defaultMode, VALID_MODES));
const [themeMode, setThemeMode] = useState<ThemeMode>(() => loadState('theme_mode', 'dark', ['light', 'dark']));
const [activeThemeName, setActiveThemeName] = useState<string>(() => loadState('theme_name', themes[0].name, themes.map(t => t.name)));
const [code, setCode] = useState<string>(() => loadCode(environmentMode));
// ...
useEffect(() => {
  if (!persistenceKey) return;
  localStorage.setItem(getStorageKey('env_mode'), environmentMode);
  localStorage.setItem(getStorageKey('theme_mode'), themeMode);
  localStorage.setItem(getStorageKey('theme_name'), activeThemeName);
  localStorage.setItem(getStorageKey(`code_${environmentMode}`), code);
}, [environmentMode, themeMode, activeThemeName, code, persistenceKey, getStorageKey]);
```

When `persistenceKey` changes on a mounted hook: `getStorageKey` changes →
the effect runs → four writes land in the **new** namespace carrying the
**old** namespace's values. Note the fourth write can additionally land under
the wrong `code_<mode>` suffix, because `environmentMode` was hydrated from
the old namespace (or from a stale `defaultMode`).

## Design

### 1. Save guard: never write under a key you did not hydrate from

Capture the hydration key once, at mount, in a ref, and gate the persistence
effect on it:

```tsx
const hydratedKeyRef = useRef(persistenceKey);
const persistenceDisabledRef = useRef(false);
const keyChangeWarnedRef = useRef(false);

useEffect(() => {
  if (persistenceDisabledRef.current) return;
  if (persistenceKey !== hydratedKeyRef.current) {
    persistenceDisabledRef.current = true;
    if (!keyChangeWarnedRef.current) {
      keyChangeWarnedRef.current = true;
      console.warn(
        '[code-shoebox] useSandboxState: persistenceKey changed on a mounted hook; ' +
        'persistence is disabled for this instance. Remount the component ' +
        '(e.g. with a React key) when the activity identity changes.'
      );
    }
    return;
  }
  if (!persistenceKey) return;
  localStorage.setItem(getStorageKey('env_mode'), environmentMode);
  localStorage.setItem(getStorageKey('theme_mode'), themeMode);
  localStorage.setItem(getStorageKey('theme_name'), activeThemeName);
  localStorage.setItem(getStorageKey(`code_${environmentMode}`), code);
}, [environmentMode, themeMode, activeThemeName, code, persistenceKey, getStorageKey]);
```

Semantics: the first key mismatch permanently latches persistence off for the
rest of that mounted hook's lifetime. This includes key addition/removal and
an A → B → A round trip: returning to the hydration key never resumes writes,
because the in-memory state may already belong to the intervening activity.
The hook warns once and degrades to **ephemeral** (scratchpad mode) instead of
corrupting either namespace. Behavior for correct consumers — stable key, no
key, or a normal keyed remount — is unchanged.

Deliberate non-goals:

- **No rehydrate-on-key-change.** A naïve effect that reloads state when the
  key changes can save old state under the new key before hydration runs (the
  effect-ordering race is exactly what bit Lesson Architect). If a key-change
  API is ever wanted, it needs its own plan with an explicit
  hydrate-before-enable state machine. Do not build it here.
- **No behavior change for `initialCodeOverride`/`defaultMode` drift.** They
  share the mount-stability contract; document, don't engineer.

### 2. Document the mount-stability contract

- `README.md` "Persistence Strategy": add a short **"Key lifecycle"**
  subsection stating that `persistenceKey`, `initialCodeOverride`, and
  `defaultMode` are mount-stable identity inputs; to change activity identity,
  remount the component owning the hook (React `key`); a mounted hook whose
  key changes stops persisting and warns. Annotate the `useAutoKey` example
  with one sentence: its output changes whenever the prompt/starter props
  change, so the component in the example must be remounted (keyed) per
  exercise.
- `CLAUDE.md` line 79 hook notes: append the same contract in one sentence,
  plus the guard's degrade-to-ephemeral behavior.
- `useAutoKey`: add a doc comment noting the hash captures
  `window.location.pathname` at compute time and the memo does not react to
  SPA path changes — callers remount per page/exercise. (Code change to make
  the path reactive is out of scope; nothing needs it once hosts key their
  instances.)

### 3. Test coverage

Extend `hooks/useSandboxState.test.ts` (same harness/style as existing tests):

1. **Key change writes nothing under the new key.** Mount with key A, edit
   code, rerender the same instance with key B (pre-seed B's namespace with a
   saved draft). Assert: B's pre-existing draft is untouched, no `cs_B_*`
   entries were added/modified, and A's namespace still holds A's last saved
   edit from before the change.
2. **Key change degrades to ephemeral.** After the change, further `setCode`
   calls write to neither namespace.
3. **Stable-key consumers unaffected.** Existing tests keep passing
   unchanged; add one explicit rerender-with-same-key case asserting
   persistence still works after a rerender.
4. **Warning fires once** (spy on `console.warn`).
5. **A → B → A stays disabled.** Return to the original hydration key after
   the first mismatch, edit again, and assert that neither namespace changes.
6. **Normal host remounts do not warn.** Unmount A, mount a fresh B instance,
   and assert that B hydrates normally without a lifecycle warning.

## Coordination with Lesson Architect

The cross-repository sequencing gate is now cleared:

1. Lesson-Architect #156 proved the destructive A → B → A transition against
   the pre-fix pinned hooks.
2. PR #157 added the route/unit/activity identity fence, removed the automatic
   reset effect, and merged as
   `b240f6e0e3127fe329e174e39067ba1810ef8ccd`.
3. A Code Shoebox dist publication is therefore allowed by sequencing, but is
   not required by this plan. A Lesson Architect pin bump remains optional
   follow-up hardening; the host-side keyed remount is the primary contract.

## Verification commands

Run from the repo root:

```bash
npm run typecheck
npm run lint
npm run test
npm run build
npm pack --dry-run
```

Expected: all pass; test count increases by the four new cases, the package
contains its declared ESM/CJS/type/style exports, and both runtime entrypoints
load. Then a manual demo smoke: `npm run dev`, confirm the demo app persists
code across reload and that no `[code-shoebox]` warning appears during normal
use.

## STOP conditions

- The drift check shows `useSandboxState.ts` changed since `0274daa` in the
  hydration or persistence-effect region.
- Any *existing* test fails after adding the guard — the guard must be
  invisible to stable-key consumers; a failure means the gate condition is
  wrong, not the test.
- Implementing the guard tempts you to add rehydrate-on-key-change "while
  you're in there". Stop; that is explicitly out of scope (see Design §1).

## Acceptance criteria

- [x] Save effect never writes under a `persistenceKey` the hook did not
      hydrate from; degraded instances warn once and remain ephemeral after
      A → B → A.
- [x] README + CLAUDE.md + `useAutoKey` doc comment state the mount-stability
      contract; the README example notes the per-exercise remount requirement.
- [x] New tests cover key-change (no foreign writes, ephemeral degrade,
      one-time warning), A → B → A latching, stable-key rerender, and normal
      remount behavior.
- [x] Typecheck, lint, tests, build, package/export checks, and demo smoke all
      pass.
- [x] The external sequencing gate cleared with Lesson Architect merge commit
      `b240f6e0e3127fe329e174e39067ba1810ef8ccd`; no consumer pin bump is part of
      this work.
