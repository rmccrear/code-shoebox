# Plan 002: Add event.source checks to all window message listeners

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 00c9834..HEAD -- components/ServerOutput.tsx runtime/templates/common.ts runtime/templates/express.ts runtime/templates/hono.ts runtime/runner.test.ts`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: plans/001-verification-baseline.md (for the typecheck/lint gates)
- **Category**: security
- **Planned at**: commit `00c9834`, 2026-06-10

## Why this matters

CodeShoebox is a published library that runs untrusted learner code in a
sandboxed iframe and talks to it via `postMessage`. Today, every
`window.addEventListener('message', ...)` in the system — on the host page AND
inside the sandbox — accepts messages from *any* window. Concretely:

1. Any other frame on the embedding page (an ad iframe, a second CodeShoebox
   instance's sandbox) can send the host's `ServerOutput` fallback listener a
   spoofed `REQUEST_COMPLETE`, `SERVER_READY`, or `RUNTIME_ERROR`, faking
   server output shown to the user.
2. Two CodeShoebox instances on one page WILL cross-talk: each `ServerOutput`'s
   window-level fallback listener receives the other instance's fallback
   messages.
3. Inside the sandbox, the kernel accepts `EXECUTE` and `INIT_PORT` from any
   window that holds a reference to it, allowing a hostile sibling frame to
   inject code into someone else's sandbox or hijack the message port.

The blast radius is bounded — all host-side rendering of message payloads goes
through React text nodes (no `innerHTML`), so this is spoofing/cross-talk, not
XSS — but the fix is small and removes the whole class.

## Current state — and a critical trap

**THE TRAP — read before editing**: the sandbox iframes are created with
`srcDoc` and `sandbox="allow-scripts allow-modals allow-forms"` (no
`allow-same-origin` — see `runtime/runner.ts:7`). Such an iframe has an
*opaque origin*: its `event.origin` is the literal string `"null"`, and the
only `targetOrigin` the host can use when posting TO it is `'*'`.
Therefore:

- Do NOT replace any `postMessage(..., '*')` with a real origin — it will
  silently break all host→iframe communication.
- Do NOT add `event.origin === window.location.origin` checks — they will
  always fail for messages from the sandbox.
- The correct identity check is **`event.source`** (the sending `Window`),
  which works regardless of origin opacity.

Relevant code today:

- `components/ServerOutput.tsx:142-150` — host-side fallback listener, no
  source check:

  ```tsx
  // Fallback Window listener
  useEffect(() => {
      const globalListener = (event: MessageEvent) => {
          if (event.data && typeof event.data === 'object' && event.data.type) {
              handleSandboxMessage(event.data);
          }
      };
      window.addEventListener('message', globalListener);
      return () => window.removeEventListener('message', globalListener);
  }, [handleSandboxMessage]);
  ```

  The matching iframe is `iframeRef` (rendered at `ServerOutput.tsx:315-323`).
  Note `components/OutputFrame.tsx` has NO window-level fallback listener (it
  only uses `channelRef.current.port1.onmessage`) — nothing to change there.

- `runtime/templates/common.ts:88-107` — the iframe kernel's listener (this is
  a JS string serialized into the iframe `srcDoc`):

  ```js
  window.addEventListener('message', (event) => {
      const { type, code, mode, payload } = event.data;
      if (type === 'INIT_PORT' && event.ports[0]) { ... }
      if (type === 'THEME') document.body.className = ...;
      if (type === 'EXECUTE' && window.__RUN_MODE__) { ... }
  });
  ```

- `runtime/templates/express.ts:122-146` — the mock's `requestHandler` is
  attached BOTH to the window (line 137: fallback) AND to the MessagePort
  (lines 140-146, via `setInterval` poll):

  ```js
  // Listen on the main window for initial requests (fallback)
  window.addEventListener('message', requestHandler);

  // Also attach to the message port once it arrives ...
  const checkPortInterval = setInterval(() => {
      if (window.messagePort) {
          window.messagePort.addEventListener('message', requestHandler);
          ...
  ```

- `runtime/templates/hono.ts:90-99` — identical dual attachment of its own
  `requestHandler`.

**Second trap**: for messages arriving via a `MessagePort`,
`event.source` is `null`. The express/hono `requestHandler` is shared between
the window listener and the port listener, so the source check must wrap ONLY
the window attachment, never the handler body or the port attachment.

Inside the sandbox, the only legitimate window-message sender is the embedding
parent: `event.source === window.parent`.
On the host, the only legitimate sender is the owned iframe:
`event.source === iframeRef.current?.contentWindow`.

## Commands you will need

| Purpose   | Command              | Expected on success |
|-----------|----------------------|---------------------|
| Typecheck | `npm run typecheck`  | exit 0              |
| Tests     | `npm test`           | all pass (22 existing + new) |
| Lint      | `npm run lint`       | exit 0              |
| One file  | `npx vitest run runtime/runner.test.ts` | all pass |

## Scope

**In scope** (the only files you should modify):
- `components/ServerOutput.tsx`
- `runtime/templates/common.ts`
- `runtime/templates/express.ts`
- `runtime/templates/hono.ts`
- `runtime/runner.test.ts` (add assertions)

**Out of scope** (do NOT touch, even though they look related):
- Any `postMessage(..., '*')` call site — see THE TRAP above. All of them stay
  exactly as they are (`runner.ts:331`, `OutputFrame.tsx:92,99,100`,
  `ServerOutput.tsx:182,189,190`, and the `window.parent.postMessage` fallbacks
  inside the template strings).
- `components/OutputFrame.tsx` — it has no window message listener.
- The MessageChannel `port1.onmessage` handlers in both host components — port
  messages are point-to-point and need no source check.
- `SANDBOX_ATTRIBUTES` in `runtime/runner.ts`.

## Git workflow

- Branch: `advisor/002-postmessage-source-checks`
- Commit style: short imperative subject (match `git log`, e.g. "Fix p5 global
  setup/draw binding in runtime"). One commit is fine.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Guard the host fallback listener in ServerOutput

In `components/ServerOutput.tsx`, inside `globalListener`, accept only
messages from this instance's own iframe:

```tsx
const globalListener = (event: MessageEvent) => {
    if (event.source !== iframeRef.current?.contentWindow) return;
    if (event.data && typeof event.data === 'object' && event.data.type) {
        handleSandboxMessage(event.data);
    }
};
```

**Verify**: `npm run typecheck` → exit 0. `npm test` → all pass.

### Step 2: Guard the kernel listener

In `runtime/templates/common.ts`, at the top of the
`window.addEventListener('message', (event) => {` handler inside
`KERNEL_SCRIPTS` (line 88), add as the first line of the callback:

```js
if (event.source !== window.parent) return;
```

(Remember this is code inside a template-literal string — plain JS, no TS
syntax, and keep the existing indentation style of the string.)

**Verify**: `npx vitest run runtime/runner.test.ts` → all pass.

### Step 3: Guard the express and hono window fallbacks (window side only)

In `runtime/templates/express.ts` line 137, change:

```js
window.addEventListener('message', requestHandler);
```

to:

```js
window.addEventListener('message', (event) => {
    if (event.source !== window.parent) return;
    requestHandler(event);
});
```

Make the identical change in `runtime/templates/hono.ts` line 90.
Do NOT touch the `window.messagePort.addEventListener('message', requestHandler)`
attachments — port events have `event.source === null` and must keep working.

**Verify**: `npm test` → all pass.

### Step 4: Pin the guards with tests

In `runtime/runner.test.ts` (model after the existing assertions, which check
substrings of `getSandboxHtml(mode)` output), add a test asserting that for
every mode in the existing `ALL_MODES` array, the generated HTML contains the
kernel guard `event.source !== window.parent`; and that for `'express'` and
`'hono'` the document contains it at least twice (kernel + mock fallback).

**Verify**: `npm test` → all pass including the new test.
`npm run lint` → exit 0.

## Test plan

- New test(s) in `runtime/runner.test.ts` as described in step 4 — they pin the
  guard into the generated sandbox documents so a future refactor can't drop it
  silently.
- The real behavior (messages still flowing after the guard) cannot be
  exercised by this jsdom suite — that's a documented repo limitation
  (CLAUDE.md "Not covered"). Flag in your report that a human should run
  `npm run dev`, open http://localhost:5173, and confirm: (a) DOM mode "Run"
  still prints console output, (b) Express mode "Send" still returns a
  response, (c) Hono mode "Send" still returns a response.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `npm run typecheck` exits 0
- [ ] `npm run lint` exits 0
- [ ] `npm test` exits 0; new guard-assertion test exists and passes
- [ ] `grep -n "addEventListener('message', requestHandler)" runtime/templates/*.ts` → no matches (only the wrapped window listeners and the untouched port attachments remain; port attachments use `window.messagePort.addEventListener`)
- [ ] `git diff` contains NO change to any `postMessage(` call's targetOrigin argument
- [ ] No files outside the in-scope list are modified (`git status`)
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- The code at the cited locations doesn't match the excerpts above.
- You find yourself wanting to edit a `postMessage` targetOrigin or add an
  `event.origin` string comparison — that is the trap described in Current
  state; re-read it, and if the plan still seems wrong, stop and report.
- An existing test fails after step 2 or 3 because it asserted the exact old
  listener text — report which assertion rather than weakening the guard.
- You discover a window message listener in the repo not listed in this plan.

## Maintenance notes

- Any future environment mode whose mock adds its own
  `window.addEventListener('message', ...)` fallback MUST copy the
  `event.source !== window.parent` wrapper; the step-4 test only covers the
  kernel and the two existing mocks.
- Reviewer: the one risk is the dual-attachment subtlety — confirm no source
  check was applied to a MessagePort handler path.
- Deferred (out of scope here): payload validation of `SIMULATE_REQUEST`
  method/url inside the mocks. With source checks in place, only the trusted
  host can send these, so it was judged not worth the code.
