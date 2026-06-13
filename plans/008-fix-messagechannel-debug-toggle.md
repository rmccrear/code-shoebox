# Plan 008: Stop debugMode toggles from severing the iframe MessageChannel bridge

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 341dafd..HEAD -- components/OutputFrame.tsx components/ServerOutput.tsx`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S–M
- **Risk**: MED
- **Depends on**: none
- **Category**: bug
- **Planned at**: commit `341dafd`, 2026-06-12

## Why this matters

`OutputFrame` and `ServerOutput` each create a `MessageChannel` in a
`useEffect` whose dependency chain includes the `debugMode` prop, and transfer
`port2` to the sandbox iframe **once**, in the iframe's `onLoad` handler. A
`MessagePort` can only be transferred once. When `debugMode` changes at
runtime (the demo app has a live toggle button — `App.tsx:176`), the effect
re-runs: the old `port1` is closed and a brand-new channel is created, but the
iframe still holds the old (now-dead) `port2`. From that moment the bridge is
silently severed: console output from the sandbox never reaches the host, and
in server modes the "Send" button posts requests into a channel nobody is
listening to, so every request hangs until the timeout. Ironically, turning ON
the debugging feature breaks the thing being debugged.

## Current state

Relevant files:

- `components/OutputFrame.tsx` — visual/headless modes host. Channel effect at
  lines 63–85, iframe `onLoad` at 119–127, debug-log side effect inside a
  `useMemo` at 58–61.
- `components/ServerOutput.tsx` — Express/Hono modes host. `handleSandboxMessage`
  at lines 79–130, channel effect at 133–145, fallback window listener at
  148–157, `onLoad` at 193–199, `sendSimulatedRequest` at 67–77.
- `runtime/templates/common.ts` — the iframe kernel. Its `INIT_PORT` handler
  (lines 88–99) **accepts a new port at any time** (`window.messagePort =
  event.ports[0]`) and even re-sends `SERVER_READY` if the server is already
  up. You do not need to change the kernel.

The bug, concretely. `OutputFrame.tsx:63–85`:

```tsx
useEffect(() => {
  channelRef.current = new MessageChannel();

  channelRef.current.port1.onmessage = (event) => {
      const { type, payload } = event.data;
      if (type === 'CONSOLE_LOG' || type === 'RUNTIME_ERROR' || type === 'CONSOLE_WARN') {
           setLogs(prev => appendLog(prev, { /* ... */ }));
      }
      else if (type === 'READY_SIGNAL' && debugMode) {
           addSystemLog('Sandbox Iframe Ready Signal Received via MessageChannel.');
      }
  };

  return () => {
      if (channelRef.current) {
          channelRef.current.port1.close();
      }
  };
}, [debugMode, addSystemLog]);   // <-- debugMode change recreates the channel
```

`port2` is transferred only in `handleIframeLoad` (`OutputFrame.tsx:119–127`):

```tsx
const handleIframeLoad = () => {
  if (debugMode) addSystemLog('Iframe "onLoad" event fired.');
  if (iframeRef.current?.contentWindow && channelRef.current) {
    iframeRef.current.contentWindow.postMessage({ type: 'INIT_PORT' }, '*', [channelRef.current.port2]);
    iframeRef.current.contentWindow.postMessage({ type: 'THEME', mode: themeMode }, '*');
    if (isHtmlMode) executeCodeInSandbox(iframeRef.current.contentWindow, code);
    if (debugMode) addSystemLog('Channel Ports initialized.');
  }
};
```

`ServerOutput.tsx` has the same shape with one more hop: the channel effect
(lines 133–145) depends on `handleSandboxMessage`, which is a `useCallback`
with deps `[debugMode, addSystemLog, clearConsole, sendSimulatedRequest]`
(line 130), and `sendSimulatedRequest` depends on `[debugMode, addSystemLog]`
(line 77). `addSystemLog`/`clearConsole` are stable (`useCallback` with `[]`),
so the only live trigger is `debugMode` — but that trigger is real and
reachable from the demo UI.

Secondary nit (fix in the same pass): `OutputFrame.tsx:58–61` calls
`addSystemLog` (a `setLogs` state update) **inside a `useMemo`**, i.e. during
render. Side effects don't belong in render; remove the call.

```tsx
const sandboxHtml = useMemo(() => {
  if (debugMode) addSystemLog(`Generating Sandbox HTML for mode: ${environmentMode}`);
  return getSandboxHtml(environmentMode, isPredictionMode);
}, [environmentMode, isPredictionMode, debugMode, addSystemLog]);
```

Repo conventions that apply: function components with hooks, no classes;
refs via `useRef`; existing comment style is sparse one-liners explaining
*why* (match it). There is intentionally **no** ESLint `exhaustive-deps`
suppression anywhere — do not add `eslint-disable` comments; restructure so
the deps are honestly empty instead.

## Commands you will need

| Purpose   | Command             | Expected on success        |
|-----------|---------------------|----------------------------|
| Install   | `npm ci`            | exit 0                     |
| Typecheck | `npm run typecheck` | exit 0, no errors          |
| Lint      | `npm run lint`      | exit 0                     |
| Tests     | `npm test`          | all pass (38 at planning time) |
| Dev smoke | `npm run dev`       | Vite serves on :5173       |

## Scope

**In scope** (the only files you should modify):
- `components/OutputFrame.tsx`
- `components/ServerOutput.tsx`

**Out of scope** (do NOT touch, even though they look related):
- `runtime/templates/common.ts` — the kernel already handles re-INIT correctly.
- `components/CodingEnvironment.tsx` — its remount-by-`sessionId` behavior is
  the intended reset mechanism; leave it alone.
- Extracting shared hooks between OutputFrame/ServerOutput — known duplication,
  deliberately deferred (see plans/README.md "considered" list). Fix the bug
  in both files in place, even though it means parallel edits.
- Any change to message types or payload shapes — the kernel depends on them.

## Git workflow

- Branch: `advisor/008-channel-bridge`
- Commit style: short imperative subject, e.g. `Fix MessageChannel loss on debugMode toggle`
  (match `git log --oneline` in this repo).
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Restructure OutputFrame so the channel is created per iframe load, not per render-dependency change

In `components/OutputFrame.tsx`:

1. Extract the inline `port1.onmessage` body into a handler kept current via a
   ref, so the channel never needs recreating when `debugMode` changes:

   ```tsx
   // Keep the latest message handler in a ref so the MessageChannel (whose
   // port2 is transferred to the iframe exactly once per load) never needs
   // to be recreated when props like debugMode change.
   const handleKernelMessage = useCallback((data: any) => {
     if (!data || typeof data !== 'object') return;
     const { type, payload } = data;
     if (type === 'CONSOLE_LOG' || type === 'RUNTIME_ERROR' || type === 'CONSOLE_WARN') {
       setLogs(prev => appendLog(prev, {
         type: type === 'RUNTIME_ERROR' ? 'error' : (type === 'CONSOLE_WARN' ? 'warn' : 'log'),
         content: payload,
         timestamp: Date.now()
       }));
     } else if (type === 'READY_SIGNAL' && debugMode) {
       addSystemLog('Sandbox Iframe Ready Signal Received via MessageChannel.');
     }
   }, [debugMode, addSystemLog]);

   const kernelMessageRef = useRef(handleKernelMessage);
   useEffect(() => { kernelMessageRef.current = handleKernelMessage; }, [handleKernelMessage]);
   ```

2. Delete the existing channel-creating `useEffect` (lines 63–85). Replace it
   with an unmount-only cleanup:

   ```tsx
   useEffect(() => () => {
     channelRef.current?.port1.close();
     channelRef.current = null;
   }, []);
   ```

3. Create a **fresh channel inside `handleIframeLoad`** (each `onLoad` is a new
   iframe document, and ports are single-transfer):

   ```tsx
   const handleIframeLoad = () => {
     if (debugMode) addSystemLog('Iframe "onLoad" event fired.');
     if (!iframeRef.current?.contentWindow) return;
     channelRef.current?.port1.close();
     const channel = new MessageChannel();
     channelRef.current = channel;
     channel.port1.onmessage = (event) => kernelMessageRef.current(event.data);
     iframeRef.current.contentWindow.postMessage({ type: 'INIT_PORT' }, '*', [channel.port2]);
     iframeRef.current.contentWindow.postMessage({ type: 'THEME', mode: themeMode }, '*');
     if (isHtmlMode) executeCodeInSandbox(iframeRef.current.contentWindow, code);
     if (debugMode) addSystemLog('Channel Ports initialized.');
   };
   ```

**Verify**: `npm run typecheck` → exit 0; `npm run lint` → exit 0.

### Step 2: Remove the render-phase side effect in OutputFrame's sandboxHtml memo

Replace lines 58–61 with a pure memo (drop the `addSystemLog` call and the now-
unneeded deps):

```tsx
const sandboxHtml = useMemo(
  () => getSandboxHtml(environmentMode, isPredictionMode),
  [environmentMode, isPredictionMode]
);
```

If you want to preserve the debug breadcrumb, log it from the existing
`onLoad` path instead (it already logs there); do not log from render.

**Verify**: `npm run lint` → exit 0 (no `exhaustive-deps` warning).

### Step 3: Apply the same restructuring to ServerOutput

In `components/ServerOutput.tsx`:

1. Keep `handleSandboxMessage` (lines 79–130) exactly as-is, and add the ref
   pattern after it:

   ```tsx
   const sandboxMessageRef = useRef(handleSandboxMessage);
   useEffect(() => { sandboxMessageRef.current = handleSandboxMessage; }, [handleSandboxMessage]);
   ```

2. Delete the channel-creating effect (lines 133–145); add the unmount-only
   cleanup effect as in Step 1.2.

3. Change the fallback window listener effect (lines 148–157) to register
   once, reading through the ref — deps become `[]`:

   ```tsx
   useEffect(() => {
     const globalListener = (event: MessageEvent) => {
       if (event.source !== iframeRef.current?.contentWindow) return;
       if (event.data && typeof event.data === 'object' && event.data.type) {
         sandboxMessageRef.current(event.data);
       }
     };
     window.addEventListener('message', globalListener);
     return () => window.removeEventListener('message', globalListener);
   }, []);
   ```

4. Create the fresh channel inside `handleIframeLoad` (lines 193–199), same
   pattern as Step 1.3 (close old `port1`, new `MessageChannel`, wire
   `onmessage` through `sandboxMessageRef`, then the existing `INIT_PORT` +
   `THEME` posts).

**Verify**: `npm run typecheck` → exit 0; `npm run lint` → exit 0; `npm test` → all pass.

### Step 4: Manual browser smoke test

Run `npm run dev`, open http://localhost:5173, then:

1. Pick the React or DOM demo, press Run → console shows output.
2. Click the debug toggle in the demo header (the button wired at
   `App.tsx:176`; it turns orange when active). Press Run again → console
   **still** shows output (pre-fix this is where logs vanish).
3. Switch to the Express demo, press Send → response renders. Toggle debug,
   press Send again → response still renders within ~1s (pre-fix this hangs
   to the 5s timeout).
4. Toggle debug off and repeat one Run and one Send.

**Verify**: all four checks behave as described. Record the result in your
report (this repo has no browser-level automated tests; see plans/README.md).

## Test plan

There is no jsdom-safe way to assert real port transfer today; automated
component coverage of this wiring is plan 012's job (it must land **after**
this plan and will lock in the fixed behavior). For this plan:

- Existing suite must stay green: `npm test` → all pass.
- The manual smoke test in Step 4 is the regression gate; do not skip it.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `npm run typecheck` exits 0
- [ ] `npm run lint` exits 0
- [ ] `npm test` exits 0
- [ ] `grep -n "new MessageChannel" components/OutputFrame.tsx components/ServerOutput.tsx`
      shows exactly one occurrence per file, inside each `handleIframeLoad`
- [ ] `grep -n "addSystemLog" components/OutputFrame.tsx` shows no call inside the `sandboxHtml` `useMemo`
- [ ] No files outside the in-scope list are modified (`git status`)
- [ ] Step 4 manual smoke test performed and reported
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- The excerpts in "Current state" don't match the live code (drift).
- After the change, the Express demo's Send button no longer works even
  **without** toggling debug — the per-load channel creation may have a
  timing interaction you should report, not patch around.
- You find the kernel does NOT accept a second `INIT_PORT` (contradicting
  `runtime/templates/common.ts:91–98`) — the fix design assumes it does.
- Fixing this seems to require editing `runtime/templates/common.ts` or
  `CodingEnvironment.tsx`.

## Maintenance notes

- Plan 012 (component tests) and the deferred "extract shared iframe/console
  hooks" finding both touch this wiring; whoever does the extraction should
  move the channel-per-load pattern into the shared hook verbatim.
- Reviewer should scrutinize: that `port1.close()` is called on the *old*
  channel before replacing it, and that no effect re-creates the channel on
  prop changes (search for `new MessageChannel` outside `handleIframeLoad`).
- Deferred: ServerOutput's `handleIframeLoad` previously posted `INIT_PORT`
  only `if (... && channelRef.current)` — with per-load creation that guard
  becomes unconditional; this intentionally also fixes re-load-without-
  channel edge cases. No further action needed.
