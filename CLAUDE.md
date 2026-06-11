# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

CodeShoebox is a publishable React component library (`code-shoebox`) that embeds a self-contained, secure code playground: a Monaco editor paired with a sandboxed `<iframe>` execution engine. It supports many runtime "environment modes" (DOM, TypeScript, p5.js, React, Express mock, Hono, headless Node). **All user code runs in the browser inside a sandboxed iframe — there is no backend.**

The repo serves a dual purpose:
- **The library** — what gets published. Entry point is `export.ts`, which exports only `CodeShoebox`, `useSandboxState`, `useAutoKey`, and the `types`/`theme` modules.
- **The local demo app** — `index.tsx` → `App.tsx` → `Demo.tsx`. This is a Vite dev harness for testing the component and is **not** part of the published package. Don't assume `App.tsx`/`Demo.tsx`/`demoPresets.ts` ship to consumers.

## Commands

```bash
npm run dev          # Vite dev server on :5173 (runs the demo app)
npm run build        # Build library: tsup bundles export.ts (cjs+esm+dts) + tailwind CSS → dist/
npm run build:demo   # Build the demo site → .demo-site/
npm run lint         # eslint .
npm test             # Vitest (run once); npm run test:watch for watch mode
npm run release      # Tag + push + publish dist branch (see Releasing below)
```

## Testing

Vitest (jsdom env, `@testing-library/react`) is configured via the `test` block in `vite.config.ts`; `test/setup.ts` wires jest-dom matchers and per-test cleanup. Run a single file with `npx vitest run runtime/runner.test.ts` (or `-t "name"` for a single test).

The suite covers **pure logic only** — the layer that's safe to assert without a browser:
- `runtime/runner.test.ts` — `getSandboxHtml` generates the correct per-mode iframe document (CDNs, mock setup, placeholder, dom fallback).
- `demoPresets.test.ts` — hash↔preset resolution and aliases.
- `hooks/useSandboxState.test.ts` — localStorage persistence, mode switching, `sessionId` bumps, ephemeral mode.

**Not covered (needs a real browser):** live iframe execution, the `postMessage`/`MessageChannel` bridge, Monaco editor, and actual code-running in each environment. Assert the *generated* sandbox via `getSandboxHtml` instead of executing it. End-to-end coverage of execution would require Playwright — not yet set up. Manual verification of execution = `npm run dev` and exercise the mode in the browser.

## Architecture: how code execution works

The execution pipeline spans three layers. Understanding the message flow is essential before touching anything in `runtime/` or the output components.

### 1. The recipe registry (`runtime/runner.ts`)

`ENV_RECIPES` is a `Record<EnvironmentMode, EnvironmentRecipe>` — the single source of truth for every mode. **Adding a new mode means adding one entry here**, not creating new files. Each recipe declares:
- `cdns` — script tags injected into the iframe `<head>` (Babel, React UMD, p5, Hono via esm.sh).
- `babelPresets` — informational; the actual presets are hardcoded inside each recipe's `logic` string.
- `mocks` — a setup script (e.g. `EXPRESS_MOCK_SETUP`, `HONO_MOCK_SETUP`) injected before `logic`.
- `logic` — a **string of JavaScript** that defines `window.__RUN_MODE__ = (code, root) => {...}`. This is the per-mode executor. It's a string because it's serialized into the iframe's `srcDoc`.
- `showPlaceholder`, `headless` — UI flags.

`getSandboxHtml(mode)` looks up the recipe and feeds it to `BASE_HTML_WRAPPER`.

### 2. The iframe kernel (`runtime/templates/common.ts`)

`BASE_HTML_WRAPPER` assembles the full `srcDoc`: `BASE_STYLES` + CDNs + `KERNEL_SCRIPTS` + mocks + recipe logic. The kernel (`KERNEL_SCRIPTS`) is the same for every mode and provides:
- A `console.*` override that forwards logs to the parent as `CONSOLE_LOG` / `RUNTIME_ERROR` / `CONSOLE_WARN` messages.
- A `window.require` shim (resolves `react`, `react-dom`, and anything registered in `window.__MODULE_REGISTRY__`).
- A `message` listener handling `INIT_PORT` (establishes the MessageChannel), `THEME`, and `EXECUTE` (calls `window.__RUN_MODE__`).

### 3. The host components (`components/`)

Two components own an iframe and talk to the kernel. They are selected in `CodingEnvironment.tsx` based on `environmentMode.startsWith('express'|'hono')`:
- **`OutputFrame.tsx`** — visual modes (DOM, p5, React, TS) and headless Node. Renders the iframe (hidden when headless) plus a `Console`.
- **`ServerOutput.tsx`** — server modes (Express/Hono). Hidden iframe + an HTTP-request UI. Implements a "Smart Send" handshake: it re-runs the code, waits for a `SERVER_READY` signal, then dispatches the queued `SIMULATE_REQUEST` (with a 5s startup timeout that surfaces a helpful error).

**Communication is via `postMessage` + `MessageChannel`.** On iframe load, the host sends `INIT_PORT` with a transferred `MessagePort`; the kernel replies `READY_SIGNAL` and thereafter uses the dedicated port. Server mocks also keep a fallback `window` listener.

### Mode-specific gotchas

- **p5** runs in global mode and uses a `MutationObserver` to relocate the auto-created `<canvas>` into `#root`.
- **React** patches `ReactDOM.createRoot` to capture and unmount the root between runs (prevents leaks / "container not found").
- **Express** is a hand-written mock object (`templates/express.ts`), *not* the real library — no middleware, no `app.use`.
- **Hono** is the *real* library loaded from `esm.sh`. User code **must** `export default app`. `.fire()`/`.listen()` are patched to start the bridge. TS/`export default` is handled by transpiling to CommonJS via Babel and reading `module.exports.default`.

## State, persistence, and presets

- **`hooks/useSandboxState.ts`** is the primary consumer-facing hook. It owns `code`, `environmentMode`, `themeMode`, `activeThemeName`, and a numeric `sessionId`. Pass a `persistenceKey` to enable per-mode localStorage persistence (key shape `cs_<persistenceKey>_code_<mode>`); omit it for an ephemeral scratchpad. Switching modes loads that mode's saved code or its starter (`constants.ts`) and **bumps `sessionId`**.
- **`sessionId` is the remount signal.** `CodeShoebox` keys `CodingEnvironment` on it; incrementing it forces a full editor/iframe remount. Reset and mode-switch both rely on this.
- **`hooks/useEditorHashPresets.ts`** (demo only) syncs `window.location.hash` ↔ presets defined in `demoPresets.ts`.

## Layout constraint

`CodeShoebox` fills its parent (`height: 100%`). The parent **must** have a defined height or the editor collapses to 0px. This is the most common integration bug — see README.

## Releasing

Publishing is GitHub-branch-based (not npm registry). Consumers install via `github:rmccrear/code-shoebox#vX.Y.Z` or `#dist`.

1. Bump `version` in `package.json`.
2. Commit — **the latest commit message becomes the git tag annotation.**
3. `npm run release` → tags `v<version>`, pushes the tag, then runs `publish:dist` (build + `scripts/prepare-dist.js` rewrites `package.json` paths + `gh-pages` pushes `dist/` to the `dist` branch).

`scripts/prepare-dist.js` strips the `dist/` prefix from `main`/`module`/`types`, removes the `files` allowlist, and drops `scripts`/`devDependencies` for the published artifact. The demo deploys separately via `npm run publish:demo` to the `demo` branch.

## Reference docs

- `ENVIRONMENTS_README.md` — authoritative, detailed inventory of every environment mode, its engine, pre-loaded libs, and limitations. Read it before changing runtime behavior.
- `template_descriptions/*.md` — per-mode learner-facing capability docs.
- `docs.ts` — in-app API reference data (p5, etc.) shown in the `HelpSidebar`.
