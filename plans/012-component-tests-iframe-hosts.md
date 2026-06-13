# Plan 012: Component tests for the iframe host components (ServerOutput, OutputFrame, CodingEnvironment routing)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 341dafd..HEAD -- components/ServerOutput.tsx components/OutputFrame.tsx components/CodingEnvironment.tsx`
> Plans 008 and 009 intentionally modify ServerOutput/OutputFrame — that drift
> is expected and REQUIRED (this plan asserts their post-fix behavior). Read
> the live components before writing assertions; the excerpts below describe
> the post-008/009 state.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: MED (the risk is wasted effort if jsdom can't simulate the message flow — see Step 1 probe)
- **Depends on**: plans/008-fix-messagechannel-debug-toggle.md, plans/009-harden-server-request-lifecycle.md (both must be DONE first)
- **Category**: tests
- **Planned at**: commit `341dafd`, 2026-06-12

## Why this matters

The components that own the sandbox iframes are the most stateful, most
async code in the library — request queueing, startup/request timeouts,
message dispatch, mode routing — and have **zero** automated coverage. The
existing suite (38 tests) covers pure logic only. Two real bugs were just
fixed in this layer (plans 008, 009) with only manual smoke tests as the
regression gate. This plan adds jsdom-level component tests so the next
change to this wiring fails in CI instead of in a classroom.

This is deliberately NOT browser/E2E testing (Playwright remains deferred —
see plans/README.md): everything here runs in jsdom with the runtime module
mocked.

## Current state

- Test stack: Vitest 4 + jsdom + `@testing-library/react`; config in
  `vite.config.ts` (`test` block: jsdom, globals, `./test/setup.ts` which
  wires jest-dom matchers and per-test cleanup). Run one file with
  `npx vitest run <path>`.
- Structural exemplar: `hooks/useSandboxState.test.ts` (describe/it style,
  `renderHook`/`act` usage). No component (`render`-based) tests exist yet —
  yours will be the first; follow the same naming/assertion style.
- `components/ServerOutput.tsx` — props: `runTrigger: number`, `code: string`,
  `themeMode`, `environmentMode`, `isBlurred?`, `debugMode?`,
  `onTriggerRun?: () => void`. Behavior contract (post-009):
  - "Send" button click → sets loading, queues `{method:'GET', url:route}` as
    `pendingRequest`, calls `onTriggerRun`.
  - `SERVER_READY` message → dispatches the queued request via the
    MessageChannel and clears `pendingRequest`.
  - `REQUEST_COMPLETE` message → renders status + JSON body, loading off.
  - `RUNTIME_ERROR` message → renders the error panel.
  - Startup timeout: 5000ms while `isLoading && pendingRequest` →
    "Server startup timed out..." error.
  - Request timeout (added by plan 009): 10000ms while
    `isLoading && !pendingRequest` → "Request timed out..." error.
  - Messages arrive two ways: the MessageChannel port, and a fallback
    `window` `message` listener that requires
    `event.source === iframeRef.current?.contentWindow`.
- `components/OutputFrame.tsx` — props include `runTrigger`, `code`,
  `environmentMode`, `isPredictionMode?`, `debugMode?`. Behavior contract:
  - headless modes (`node-js`, `node-ts`): iframe hidden, console fills view.
  - html modes (`html`, `html-css`): no console panel; live-preview effect
    re-executes code 500ms (debounced) after `code` changes.
  - `runTrigger` increment → clears logs and calls `executeCodeInSandbox`.
- `components/CodingEnvironment.tsx` — selects `ServerOutput` when
  `environmentMode.startsWith('express')` or `startsWith('hono')`, else
  `OutputFrame`. Renders `CodeEditor` (which imports `@monaco-editor/react` —
  must be mocked in jsdom; it fetches Monaco from a CDN at runtime).
- `runtime/runner.ts` exports used by these components: `getSandboxHtml(mode,
  isPredictionMode?)`, `executeCodeInSandbox(win, code)`,
  `SANDBOX_ATTRIBUTES` (string). All are easy to mock with `vi.mock`.

Key uncertainty this plan must resolve FIRST (Step 1): whether jsdom supports
(a) firing `load` on an iframe with `srcDoc`, (b) `contentWindow.postMessage`
with a transferred `MessagePort` (used in `handleIframeLoad`), and
(c) constructing `MessageEvent` with a `source` (needed to satisfy the
fallback listener's `event.source` check). If (b) throws, components will
crash on iframe load in tests; if (c) is impossible, the fallback-listener
path can't be driven.

## Commands you will need

| Purpose   | Command                                              | Expected on success |
|-----------|------------------------------------------------------|---------------------|
| Install   | `npm ci`                                             | exit 0              |
| One file  | `npx vitest run components/ServerOutput.test.tsx`    | all pass            |
| Full run  | `npm test`                                           | all pass            |
| Typecheck | `npm run typecheck`                                  | exit 0              |
| Lint      | `npm run lint`                                       | exit 0              |

## Scope

**In scope** (the only files you should create/modify):
- `components/ServerOutput.test.tsx` (create)
- `components/OutputFrame.test.tsx` (create)
- `components/CodingEnvironment.test.tsx` (create)
- `test/setup.ts` (ONLY if a polyfill/stub must be registered globally)

**Out of scope** (do NOT touch):
- Any non-test source file. If a component seems untestable without a source
  change, that is a STOP condition, not an invitation to refactor.
- Playwright / browser test infra.
- `components/CodeEditor.tsx` tests (Monaco-dominated; little logic of our own).

## Git workflow

- Branch: `advisor/012-component-tests`
- Commit style: short imperative subject, e.g. `Add component tests for iframe host components`.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: jsdom capability probe

Create `components/ServerOutput.test.tsx` with ONLY a probe first:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';

vi.mock('../runtime/runner', () => ({
  getSandboxHtml: vi.fn(() => '<html><body></body></html>'),
  executeCodeInSandbox: vi.fn(),
  SANDBOX_ATTRIBUTES: 'allow-scripts',
}));

import { ServerOutput } from './ServerOutput';

describe('jsdom probe', () => {
  it('renders ServerOutput without crashing and tolerates iframe load', () => {
    const { container } = render(
      <ServerOutput runTrigger={0} code="" themeMode="dark" environmentMode="express" onTriggerRun={() => {}} />
    );
    const iframe = container.querySelector('iframe')!;
    expect(iframe).toBeTruthy();
    // Fire load manually — jsdom may or may not fire it for srcDoc.
    iframe.dispatchEvent(new Event('load'));
  });

  it('can construct a MessageEvent carrying a source', () => {
    const evt = new MessageEvent('message', { data: { type: 'X' } });
    expect(evt.data.type).toBe('X');
    // Try the source-bearing variant; if this throws, note it.
  });
});
```

Run it. Three possible outcomes:

- **Both pass** → proceed to Step 2 using direct event dispatch.
- **`handleIframeLoad` throws on port transfer** (jsdom postMessage not
  supporting transfer): wrap your *test-side* load dispatch expectations
  accordingly — if the component itself crashes (unhandled), STOP and report;
  the components would need a guard, which is a source change outside scope.
- **`MessageEvent` cannot carry a usable `source`**: drive messages through
  the MessageChannel port path instead — see Step 2's fallback note.

**Verify**: `npx vitest run components/ServerOutput.test.tsx` → probe results
known and recorded in your report.

### Step 2: ServerOutput behavior tests

Replace/extend the probe file with the real suite. Message injection
strategy, in preference order:

1. **Window-fallback path**: dispatch
   `new MessageEvent('message', { data, source: iframe.contentWindow })` on
   `window`. The component's fallback listener checks
   `event.source === iframeRef.current?.contentWindow`; in jsdom the
   `contentWindow` object is available synchronously, so identity holds.
2. **If `source` can't be set in jsdom**: capture the `MessageChannel`
   the component creates by stubbing the global:
   `const ports: MessagePort[] = []; vi.stubGlobal('MessageChannel', class { port1 = ...; port2 = ...; })`
   with a hand-rolled pair where posting on your captured `port2` invokes the
   component's `port1.onmessage`. This avoids `source` entirely.

Test cases (use `vi.useFakeTimers()` where timers are involved; wrap state-
changing dispatches in `act`):

1. **Send queues and triggers a run**: click Send → `onTriggerRun` called
   once; button text becomes `Starting...`.
2. **SERVER_READY dispatches the queued request**: after Send + inject
   `{type:'SERVER_READY'}` → the (mocked or captured) channel/port received a
   `SIMULATE_REQUEST` with `{method:'GET', url:'/'}`; UI shows
   `Processing...`.
3. **REQUEST_COMPLETE renders the response**: inject
   `{type:'REQUEST_COMPLETE', payload:{status:200, data:{ok:true}}}` →
   `200` and `"ok": true` visible; loading indicator gone.
4. **RUNTIME_ERROR renders the error panel**: inject
   `{type:'RUNTIME_ERROR', payload:'boom'}` → `Runtime Error` and `boom`
   visible.
5. **Startup timeout** (regression for the 5s path): Send, do NOT inject
   `SERVER_READY`, `vi.advanceTimersByTime(5000)` → "Server startup timed
   out" visible.
6. **Request timeout** (regression for plan 009): Send, inject
   `SERVER_READY`, do NOT inject `REQUEST_COMPLETE`,
   `vi.advanceTimersByTime(10000)` → "Request timed out" visible.
7. **Console log cap**: inject 510 `CONSOLE_LOG` messages → at most 500
   rendered/retained (assert via the Console list length or the oldest
   message being dropped).

**Verify**: `npx vitest run components/ServerOutput.test.tsx` → all pass.

### Step 3: OutputFrame behavior tests

Create `components/OutputFrame.test.tsx` (same `vi.mock` of
`../runtime/runner`):

1. **runTrigger executes code**: render with `runTrigger={0}`, rerender with
   `runTrigger={1}` → `executeCodeInSandbox` called with the current `code`.
2. **Headless mode hides the iframe, keeps console**: render with
   `environmentMode="node-js"` → iframe has the `hidden` class; Console
   visible.
3. **HTML mode hides the console**: render with `environmentMode="html"` →
   no Console rendered; iframe visible.
4. **HTML live preview debounce**: fake timers; render `html` mode, change
   `code` prop, `advanceTimersByTime(499)` → no new
   `executeCodeInSandbox` call; `advanceTimersByTime(1)` → exactly one call.
5. **debugMode toggle does not sever message handling** (regression for plan
   008): render in `dom` mode, fire iframe `load`, inject a `CONSOLE_LOG`
   (via whichever injection path Step 1 established), toggle `debugMode` prop
   via rerender, inject another `CONSOLE_LOG` → BOTH messages appear in the
   console. (If message injection only works via the stubbed MessageChannel,
   this test is the payoff: pre-008 code recreates the channel and drops the
   second message.)

**Verify**: `npx vitest run components/OutputFrame.test.tsx` → all pass.

### Step 4: CodingEnvironment routing tests

Create `components/CodingEnvironment.test.tsx`. Mock BOTH
`../runtime/runner` (as above) and `@monaco-editor/react`:

```tsx
vi.mock('@monaco-editor/react', () => ({
  __esModule: true,
  default: (props: any) => <textarea data-testid="mock-editor" defaultValue={props.value} />,
}));
```

(Check `components/CodeEditor.tsx:3` for the exact import shape — it imports
the default `Editor` plus the `OnMount` type; the type import needs no mock.)

Cases:

1. `environmentMode="express"` → ServerOutput markup present (e.g. the `GET`
   method chip and the route input placeholder `/api/inventory`).
2. `environmentMode="hono"` → same.
3. `environmentMode="dom"` → OutputFrame markup present (visible iframe,
   no `GET` chip).

Pass minimal required props — read `CodingEnvironmentProps` at the top of the
component for the exact list; supply stable no-op callbacks.

**Verify**: `npx vitest run components/CodingEnvironment.test.tsx` → all pass.

### Step 5: Full gates

**Verify**: `npm test` → all pass (existing + ~15 new);
`npm run typecheck` → exit 0; `npm run lint` → exit 0.

## Test plan

This plan IS the test plan; the case lists in Steps 2–4 are the deliverable.
Structural pattern: `hooks/useSandboxState.test.ts` for style;
`test/setup.ts` already provides jest-dom matchers and cleanup.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] Three new test files exist and run: `components/ServerOutput.test.tsx`,
      `components/OutputFrame.test.tsx`, `components/CodingEnvironment.test.tsx`
- [ ] `npm test` exits 0; total test count strictly greater than before
      (record before/after counts in your report)
- [ ] The plan-008 regression case (Step 3.5) and plan-009 regression case
      (Step 2.6) are present, or their omission is justified under a STOP
      condition in your report
- [ ] `npm run typecheck` and `npm run lint` exit 0
- [ ] No non-test source files modified (`git status`)
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- Plans 008/009 are not DONE (check `plans/README.md`) — these tests assert
  post-fix behavior and will fail against the old code.
- The Step 1 probe shows components **crash** in jsdom on iframe load (not
  just a degraded path) — fixing that requires a source change, which is out
  of scope; report the exact error.
- Neither message-injection strategy (window event with `source`, stubbed
  `MessageChannel`) can deliver a message to the component after reasonable
  attempts — report which jsdom limitation blocked each.
- You are tempted to add `data-testid` attributes or export internals from
  the components — that's a source change; query by role/text instead, and
  if truly impossible, STOP and propose the minimal seam in your report.

## Maintenance notes

- These tests intentionally mock `runtime/runner` — they cover host-side
  state machines, NOT sandbox execution. Real execution coverage still needs
  Playwright (deferred; see plans/README.md). Don't let green tests here be
  read as "the sandbox works".
- If the deferred "extract shared iframe/console hooks" refactor happens,
  these tests are the safety net — run them before and after; they should
  pass unchanged.
- If `@monaco-editor/react` is upgraded (plan 010 keeps it in ^4), the mock
  shape in Step 4 may need updating only if the default-export contract
  changes.
