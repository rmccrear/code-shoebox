# Plan 009: Harden the server-mode request lifecycle (Express error reporting + in-flight request timeout)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 341dafd..HEAD -- runtime/templates/express.ts components/ServerOutput.tsx runtime/runner.test.ts`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition. Note: plan 008 also edits
> `components/ServerOutput.tsx` — if its status is DONE, expect drift there
> limited to the MessageChannel wiring (channel created in `handleIframeLoad`,
> handler ref pattern); that specific drift is fine.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: LOW
- **Depends on**: plans/008-fix-messagechannel-debug-toggle.md (same file touched; execute 008 first to avoid conflicts)
- **Category**: bug
- **Planned at**: commit `341dafd`, 2026-06-12

## Why this matters

Three gaps make Express/Hono server modes fail silently instead of telling the
learner what went wrong:

1. The Express mock's request handler has **no try/catch** (its Hono
   counterpart does), so a throw during request handling — e.g. `new URL()` on
   a malformed path — becomes an unhandled rejection inside the iframe and the
   host never hears back.
2. The Express mock catches **synchronous** handler throws but not **async**
   rejections: `app.get('/x', async (req, res) => { throw ... })` rejects a
   promise nobody observes, and the response promise never resolves.
3. The host (`ServerOutput`) has a 5-second **startup** timeout but no
   **in-flight request** timeout: once `SERVER_READY` arrives and the request
   is dispatched, a handler that never calls `res.send()`/`res.json()` leaves
   the UI on "Processing..." forever.

This is a teaching tool; "forever spinner" is the worst possible error
message. After this plan, every failure path surfaces a runtime error or a
timeout message in the UI.

## Current state

Relevant files:

- `runtime/templates/express.ts` — `EXPRESS_MOCK_SETUP`, a JS-source string
  injected into the sandbox iframe after the kernel. Contains `MockResponse`
  (lines 5–31), `MockApp` with `_handleRequest` (lines 57–111), and the
  parent-message `requestHandler` (lines 119–131).
- `runtime/templates/hono.ts` — the Hono mock; its `requestHandler` shows the
  error-handling pattern to copy (lines 61–86): try/catch around the request,
  failure → `sendPayload('RUNTIME_ERROR', err.message)`.
- `runtime/templates/common.ts` — the kernel. Defines `sendPayload(type,
  payload)` (lines 63–67) **before** mocks are injected
  (`BASE_HTML_WRAPPER`, lines 129–133 orders: kernel, mocks, recipe logic), so
  mock code may call `sendPayload` — the Hono mock already does.
- `components/ServerOutput.tsx` — the host. Startup-timeout effect at lines
  218–241; `handleSandboxMessage` cases (`REQUEST_COMPLETE`, `RUNTIME_ERROR`)
  at lines 99–111.
- `runtime/runner.test.ts` — existing pattern for asserting generated sandbox
  HTML (string assertions on `getSandboxHtml(mode)` output).

Excerpt 1 — the unprotected Express request handler, `runtime/templates/express.ts:119–131`
(note this is inside a template literal; inner backticks/`${}` are escaped as
`\`` / `\${` in the source):

```js
const requestHandler = async (event) => {
    if (event.data && event.data.type === 'SIMULATE_REQUEST') {
        const { method, url } = event.data.payload;
        const response = await appInstance._handleRequest(method, url);
        const completeMsg = { type: 'REQUEST_COMPLETE', payload: response };

        if (window.messagePort) {
            window.messagePort.postMessage(completeMsg);
        } else {
            window.parent.postMessage(completeMsg, '*');
        }
    }
};
```

Excerpt 2 — sync-only handler protection, `runtime/templates/express.ts:98–106`:

```js
return new Promise(resolve => {
    const res = new MockResponse(resolve);
    try {
        handler(req, res);
    } catch (e) {
        console.error(e);
        resolve({ status: 500, data: { error: e.message } });
    }
});
```

Excerpt 3 — the Hono pattern to copy, `runtime/templates/hono.ts:83–86`:

```js
} catch (err) {
    console.error("[Hono Mock] Simulation error:", err);
    sendPayload('RUNTIME_ERROR', err.message);
}
```

Excerpt 4 — host startup timeout (the shape to mirror for the request
timeout), `components/ServerOutput.tsx:218–241`:

```tsx
useEffect(() => {
    if (!isLoading || !pendingRequest || serverReady || runtimeError) {
      if (startupTimeoutRef.current) {
        window.clearTimeout(startupTimeoutRef.current);
        startupTimeoutRef.current = null;
      }
      return;
    }

    startupTimeoutRef.current = window.setTimeout(() => {
      setIsLoading(false);
      setPendingRequest(null);
      setServerReady(false);
      setRuntimeError("Server startup timed out. ...");
      addSystemLog('Server startup timed out while waiting for SERVER_READY.');
    }, 5000);

    return () => { /* clears the timeout */ };
}, [isLoading, pendingRequest, serverReady, runtimeError, addSystemLog]);
```

State semantics you need: while waiting for startup, `isLoading === true` and
`pendingRequest !== null`. After `SERVER_READY` fires the queued request,
`pendingRequest` becomes `null` while `isLoading` stays `true` until
`REQUEST_COMPLETE` or `RUNTIME_ERROR` arrives. So "request in flight" is
exactly `isLoading && !pendingRequest`.

## Commands you will need

| Purpose   | Command                              | Expected on success        |
|-----------|--------------------------------------|----------------------------|
| Install   | `npm ci`                             | exit 0                     |
| Typecheck | `npm run typecheck`                  | exit 0, no errors          |
| Lint      | `npm run lint`                       | exit 0                     |
| Tests     | `npm test`                           | all pass                   |
| One file  | `npx vitest run runtime/runner.test.ts` | all pass               |
| Dev smoke | `npm run dev`                        | Vite serves on :5173       |

## Scope

**In scope** (the only files you should modify):
- `runtime/templates/express.ts`
- `components/ServerOutput.tsx`
- `runtime/runner.test.ts` (add assertions)
- `runtime/templates/express.test.ts` (create — see Test plan)

**Out of scope** (do NOT touch, even though they look related):
- `runtime/templates/hono.ts` — already has correct error handling.
- `runtime/templates/common.ts` — kernel; no changes needed.
- `runtime/runner.ts` — the recipes consume `EXPRESS_MOCK_SETUP` unchanged.
- Adding POST/body support to the request UI — that's a separate direction
  finding, not this plan.

## Git workflow

- Branch: `advisor/009-server-request-lifecycle`
- Commit style: short imperative subject, e.g. `Harden Express mock and add request timeout`.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Wrap the Express requestHandler in try/catch (match Hono)

In `runtime/templates/express.ts`, wrap the body of the `SIMULATE_REQUEST`
branch (Excerpt 1) so it matches the Hono pattern. Target shape (remember:
inside the template literal, escape backticks/interpolation exactly as the
surrounding file does):

```js
const requestHandler = async (event) => {
    if (event.data && event.data.type === 'SIMULATE_REQUEST') {
        const { method, url } = event.data.payload;
        try {
            const response = await appInstance._handleRequest(method, url);
            const completeMsg = { type: 'REQUEST_COMPLETE', payload: response };
            if (window.messagePort) {
                window.messagePort.postMessage(completeMsg);
            } else {
                window.parent.postMessage(completeMsg, '*');
            }
        } catch (err) {
            console.error("[Express Mock] Simulation error:", err);
            sendPayload('RUNTIME_ERROR', err.message);
        }
    }
};
```

(`sendPayload` is defined by the kernel before mocks load — the Hono mock
already relies on this.)

**Verify**: `npm run typecheck` → exit 0.

### Step 2: Catch async handler rejections in _handleRequest

In `runtime/templates/express.ts`, change Excerpt 2 so a rejected promise from
an `async` route handler resolves as a 500 instead of hanging:

```js
return new Promise(resolve => {
    const res = new MockResponse(resolve);
    try {
        const out = handler(req, res);
        if (out && typeof out.catch === 'function') {
            out.catch(e => {
                console.error(e);
                resolve({ status: 500, data: { error: e.message } });
            });
        }
    } catch (e) {
        console.error(e);
        resolve({ status: 500, data: { error: e.message } });
    }
});
```

**Verify**: `npm run typecheck` → exit 0.

### Step 3: Add an in-flight request timeout to ServerOutput

In `components/ServerOutput.tsx`:

1. Add a ref next to `startupTimeoutRef`:
   `const requestTimeoutRef = useRef<number | null>(null);`
2. Add a sibling effect after the startup-timeout effect, mirroring its shape
   but for the in-flight phase (`isLoading && !pendingRequest`):

   ```tsx
   // In-flight request timeout: SERVER_READY arrived and the request was
   // dispatched, but the handler never produced a response.
   useEffect(() => {
     if (!isLoading || pendingRequest || runtimeError) {
       if (requestTimeoutRef.current) {
         window.clearTimeout(requestTimeoutRef.current);
         requestTimeoutRef.current = null;
       }
       return;
     }

     requestTimeoutRef.current = window.setTimeout(() => {
       setIsLoading(false);
       setRuntimeError("Request timed out. Check that your route handler sends a response: res.send()/res.json() for Express, or return a Response for Hono.");
       addSystemLog('Request timed out while waiting for REQUEST_COMPLETE.');
     }, 10000);

     return () => {
       if (requestTimeoutRef.current) {
         window.clearTimeout(requestTimeoutRef.current);
         requestTimeoutRef.current = null;
       }
     };
   }, [isLoading, pendingRequest, runtimeError, addSystemLog]);
   ```

   Note: `response` arriving sets `isLoading` to `false`
   (`handleSandboxMessage`, `REQUEST_COMPLETE` case), which disarms this
   timeout via the `!isLoading` guard — `response` itself does not need to be
   a dependency.

**Verify**: `npm run typecheck` → exit 0; `npm run lint` → exit 0.

### Step 4: Extend the generated-sandbox assertions

In `runtime/runner.test.ts`, following the existing string-assertion style in
that file, add to (or create) the express-mode test:

- `getSandboxHtml('express')` contains `[Express Mock] Simulation error`.
- `getSandboxHtml('express-ts')` contains `[Express Mock] Simulation error`
  (both recipes share `EXPRESS_MOCK_SETUP`).

**Verify**: `npx vitest run runtime/runner.test.ts` → all pass.

### Step 5: Unit-test the mock's behavior directly

Create `runtime/templates/express.test.ts`. `EXPRESS_MOCK_SETUP` is a plain
JS source string; it can be evaluated in jsdom to test `_handleRequest`
end-to-end without an iframe:

```ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EXPRESS_MOCK_SETUP } from './express';

declare global { interface Window { appInstance: any; express: any; sendPayload?: any; } }

const bootMock = () => {
  // The mock polls for window.messagePort forever; fake timers keep the
  // interval inert during tests.
  vi.useFakeTimers();
  (window as any).sendPayload = vi.fn();        // kernel-provided in real iframe
  // eslint-disable-next-line no-new-func
  new Function(EXPRESS_MOCK_SETUP)();
};

describe('EXPRESS_MOCK_SETUP', () => {
  beforeEach(() => { bootMock(); });

  it('resolves a registered GET route', async () => {
    window.appInstance.get('/hello', (_req: any, res: any) => res.json({ ok: true }));
    const out = await window.appInstance._handleRequest('GET', '/hello');
    expect(out.status).toBe(200);
    expect(out.data).toEqual({ ok: true });
  });

  it('returns 404 for unknown routes', async () => {
    const out = await window.appInstance._handleRequest('GET', '/nope');
    expect(out.status).toBe(404);
  });

  it('resolves 500 when a sync handler throws', async () => {
    window.appInstance.get('/boom', () => { throw new Error('sync-boom'); });
    const out = await window.appInstance._handleRequest('GET', '/boom');
    expect(out.status).toBe(500);
    expect(out.data.error).toBe('sync-boom');
  });

  it('resolves 500 when an async handler rejects (regression: used to hang)', async () => {
    window.appInstance.get('/aboom', async () => { throw new Error('async-boom'); });
    const out = await window.appInstance._handleRequest('GET', '/aboom');
    expect(out.status).toBe(500);
    expect(out.data.error).toBe('async-boom');
  });
});
```

Adjust mechanically if needed (e.g. jsdom complaining about `window.parent`
postMessage in `listen()` — these tests never call `listen()`, so that path
is not exercised). The async-rejection test MUST fail if Step 2 is reverted —
check this by mentally tracing: without Step 2, the promise never resolves
and vitest times the test out.

**Verify**: `npx vitest run runtime/templates/express.test.ts` → 4 pass.
Then `npm test` → all pass (38 pre-existing + your new ones).

### Step 6: Manual browser smoke test

`npm run dev`, switch to the Express demo:

1. Replace the handler body with `throw new Error('kaput')` → Send → a
   Runtime Error panel appears (not a hang).
2. Make the handler `async` and throw → Send → 500 response with the error.
3. Make a handler that never calls `res.send` (e.g. empty body) → Send →
   after ~10s the "Request timed out" error appears.
4. Restore the demo code → Send → normal response still works.

**Verify**: all four behave as described; record results in your report.

## Test plan

- New file `runtime/templates/express.test.ts` — 4 cases listed in Step 5
  (happy path, 404, sync throw → 500, async rejection → 500 regression).
- Extended assertions in `runtime/runner.test.ts` (Step 4).
- Structural pattern to follow: `runtime/runner.test.ts` for string
  assertions; `hooks/useSandboxState.test.ts` for describe/it conventions.
- Verification: `npm test` → all pass, including ≥6 new tests.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `npm run typecheck` exits 0
- [ ] `npm run lint` exits 0
- [ ] `npm test` exits 0 with new tests included
- [ ] `grep -c "Simulation error" runtime/templates/express.ts` ≥ 1
- [ ] `grep -n "requestTimeoutRef" components/ServerOutput.tsx` shows the ref and both arm/clear sites
- [ ] No files outside the in-scope list are modified (`git status`)
- [ ] Step 6 manual smoke test performed and reported
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- The excerpts don't match the live code beyond plan 008's documented changes.
- `new Function(EXPRESS_MOCK_SETUP)()` cannot evaluate in jsdom after two fix
  attempts (e.g. a syntax issue from template-literal escaping) — report what
  failed rather than restructuring the mock to suit the test.
- The in-flight timeout misfires during a normal fast request in the Step 6
  smoke test — the state-semantics assumption (`isLoading && !pendingRequest`
  ⇒ in flight) would be wrong; report it.

## Maintenance notes

- If a request-body/method-selector feature lands later (see direction
  findings in plans/README.md), the timeout message and `_handleRequest`
  signature both grow — keep the 500-on-rejection behavior.
- Reviewer should scrutinize: template-literal escaping inside
  `EXPRESS_MOCK_SETUP` (a stray unescaped backtick breaks every server mode),
  and that the new effect's guard list keeps it disarmed during startup phase
  (startup has its own 5s timeout).
- Deferred: surfacing Hono in-flight hangs differently (Hono returns
  `Response` objects; a user handler that never returns hits the same 10s
  host timeout — covered by this plan's host-side change).
