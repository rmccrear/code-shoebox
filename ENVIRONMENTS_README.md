
# CodeShoebox Runtime Environments

This document provides a detailed inventory of the execution environments available in CodeShoebox.

CodeShoebox runs code entirely within the browser using a sandboxed `<iframe>`. There is no backend Node.js server executing user code.

## Global Limitations (All Environments)

*   **No File System:** The `fs` module and file system access are not available.
*   **No Native Node.js Modules:** Modules like `path`, `crypto` (except `window.crypto`), `http`, or `os` are not available.
*   **External Imports:** You cannot `npm install` packages. 
    *   In **React/Express** modes, imports are shimmed to internal variables.
    *   In **Hono** mode, imports are handled via ESM URL imports.
    *   In other modes, `import/export` statements may cause runtime errors unless transpiled and resolved by the specific environment logic.
*   **Persistence:** LocalStorage is sandboxed to the iframe's origin.
*   **Network:** `fetch()` is available but subject to standard Browser CORS policies.

---

## 1. Web & DOM

These environments are designed for standard DOM manipulation and vanilla JavaScript/TypeScript logic.

### `html` (HTML, single file)
*   **Engine:** Nested `<iframe sandbox="">` — the editor buffer is rendered **verbatim** as the inner frame's `srcdoc`, exactly like opening a saved `.html` file. No transpiler.
*   **Pre-loaded Libraries:** None (no CDNs).
*   **Capabilities:**
    *   Full documents (`<!DOCTYPE html>` … `</html>`) and bare fragments both render; `<title>`, `<meta>`, and `<body class/style>` attributes are honored.
    *   **Live preview:** the page re-renders ~500 ms after typing stops; the Run button remains as a manual re-render.
    *   External resources work: `<link rel="stylesheet">`, web fonts, and `<img>` URLs.
    *   Renders immediately on load (no first Run needed).
*   **Limitations:**
    *   **JavaScript never executes.** The inner frame's empty `sandbox` attribute blocks scripts at the browser level; a banner above the page points learners at the `dom` mode. (Do not "fix" this — it is the security/pedagogy model.)
    *   No console panel in this mode.
    *   The page is theme-independent: always a default white canvas, regardless of the shoebox dark/light theme.
    *   Clicking an `<a href>` navigates the inner frame away (e.g. to MDN); pressing Run or typing brings the page back. Accepted behavior, not a bug.

### `html-css` (HTML & CSS, two tabs: index.html + style.css)
*   **Engine:** Same nested `<iframe sandbox="">` as the `html` mode, plus file-bundle resolution: the editor shows two tabs, and the page's `<link rel="stylesheet" href="style.css">` is resolved against the `style.css` tab (inlined as a `<style>` block before rendering).
*   **Code format:** The single `code` string is a JSON envelope — `{"__csFiles__":1,"files":{"index.html":"…","style.css":"…"}}` (see `runtime/fileBundle.ts`). Any plain non-envelope string is treated as a bare `index.html` with an empty `style.css`.
*   **Capabilities:**
    *   **Strict link semantics:** the CSS tab applies only when the HTML actually links it. If `style.css` has content but isn't linked, a blue hint banner shows the exact `<link>` line to add.
    *   Exactly two files, fixed names. Per-tab Monaco models preserve per-file undo history.
    *   Everything else as in the `html` mode: live preview + Run, scripts blocked with the amber banner, no console, white theme-independent page, external absolute URLs work.
*   **Limitations:**
    *   Only the literal `href="style.css"` resolves to the tab; other *relative* hrefs (`main.css`) silently load nothing.
    *   No additional files, renames, or a JS tab.
    *   The rendered document is parsed and re-serialized to splice the styles in (the single-file `html` mode remains byte-verbatim).

### `html-js` (HTML & JavaScript, two tabs: index.html + script.js)
*   **Engine:** Native browser JavaScript in the existing sandbox DOM. The editor shows two editable tabs and packs them into the same version-1 file envelope used by `html-css`.
*   **Code format:** `{"__csFiles__":1,"files":{"index.html":"…","script.js":"…"}}`. A plain string becomes `index.html` with an empty `script.js`.
*   **Capabilities:**
    *   **Strict script semantics:** `script.js` runs only when the HTML contains a literal `<script src="script.js"></script>`. If code exists without that link, a blue hint shows the exact tag to add.
    *   Both files are editable and retain separate Monaco models and undo histories.
    *   Pressing Run restores the current HTML body under the sandbox's `#root`, then executes `script.js` once with access to `root`, `document`, and `window`.
    *   The console captures logs, warnings, synchronous errors, and unhandled promise rejections.
*   **Limitations:**
    *   This is manual-run; editing either tab never executes JavaScript automatically.
    *   All script elements are removed from parsed learner HTML. Inline, remote, data-URL, and differently named scripts do not execute; only the bundled `script.js` does.
    *   The learner body is restored below `#root`; `<head>` metadata, `<title>`, body attributes, parser timing, `async`, and `defer` behavior are not reproduced.
    *   Native browser JavaScript only: no TypeScript, Babel, modules, `import`/`export`, packages, or additional files.

### `dom` (DOM / JS)
*   **Engine:** Native Browser JavaScript (executed via `new Function`).
*   **Pre-loaded Libraries:** None.
*   **Capabilities:**
    *   Full access to the `document` and `window`.
    *   A global `root` variable is provided as the entry point `div`.
    *   CSS manipulation via JavaScript.
    *   Optional trusted host fixtures: `fixtureHtml` and `fixtureCss` are restored inside the real sandbox DOM before every Run, then learner JavaScript executes.
    *   When fixtures are supplied, the editor shows at most three fixed files: editable `script.js`, read-only `index.html`, and read-only `style.css`. Without fixtures, the mode remains a single JavaScript editor.
*   **Limitations:**
    *   No TypeScript support.
    *   No Babel transpilation (syntax is limited to what the user's browser supports natively).
    *   `import` / `export` syntax is not supported.
    *   Fixture props are ignored outside `dom` mode. They are trusted host input inside the existing sandbox, not editable project files or a dependency-loading mechanism.

### `typescript` (TypeScript)
*   **Engine:** Babel Standalone (in-browser transpilation).
*   **Pre-loaded Libraries:** Babel (`@babel/standalone`).
*   **Capabilities:**
    *   Compiles TypeScript to JavaScript on the fly.
    *   Supports modern ESNext syntax.
    *   Full DOM access via `root`.
*   **Limitations:**
    *   Type checking is done in the Editor (Monaco), not during runtime execution.
    *   Cannot import external TS modules.

---

## 2. Creative Coding

Environments optimized for visual arts using the p5.js library.

### `p5` (p5.js)
*   **Engine:** Native Browser JS + p5.js Global Mode.
*   **Pre-loaded Libraries:** `p5.js` (v1.9.0).
*   **Capabilities:**
    *   **Global Mode:** Functions like `setup()`, `draw()`, `createCanvas()` are available globally.
    *   **Auto-Canvas Relocation:** The runtime automatically detects the canvas created by p5 and moves it into the `#root` container to prevent layout issues.
*   **Limitations:**
    *   Instance mode (namespaced p5) is not the default.

### `p5-ts` (p5.js + TypeScript)
*   **Engine:** Babel + p5.js.
*   **Pre-loaded Libraries:** `p5.js` (v1.9.0), Babel.
*   **Capabilities:**
    *   All capabilities of `p5` mode.
    *   **Intellisense:** The editor includes a TypeScript definition file for p5.js, providing autocomplete for functions like `circle()`, `dist()`, etc.
    *   Supports interfaces and type annotations for particle systems or complex logic.

---

## 3. Frontend Frameworks

Environments for building UI components.

### `react` (React JS)
*   **Engine:** Babel (Presets: `react`, `env`).
*   **Pre-loaded Libraries:** `React` (v18), `ReactDOM` (v18).
*   **Capabilities:**
    *   JSX syntax support.
    *   **Import Shims:** `import React from 'react'` and `import ReactDOM from 'react-dom/client'` are intercepted and shimmed to the global UMD builds.
    *   **Root Management:** Automatically handles `ReactDOM.createRoot` mounting and unmounting to prevent memory leaks or "Target container is not a DOM element" errors.
*   **Limitations:**
    *   Cannot import other hooks libraries (e.g., `react-router`, `framer-motion`) unless you manually inject their UMD scripts via a custom modification to the runner.
    *   CSS-in-JS libraries (like styled-components) are not pre-loaded.

### `react-ts` (React + TypeScript)
*   **Engine:** Babel (Presets: `react`, `typescript`, `env`).
*   **Capabilities:**
    *   All capabilities of `react` mode.
    *   TypeScript syntax support for Props (`interface Props { ... }`) and Hooks (`useState<number>(0)`).

---

## 4. Server Simulation (Mock & Real)

These environments allow students to write backend-style code in the browser. They rely on a `ServerOutput` component to simulate HTTP requests.

### `hono` (Modern Web Standards)
*   **Engine:** Real Hono Library (loaded via ESM).
*   **Pre-loaded Libraries:** `hono` (v4.x via `esm.sh`).
*   **Architecture:**
    *   This is **not a mock**. It runs the actual Hono library in the browser.
    *   It utilizes Hono's web-standard `app.fetch` method to process requests.
*   **Capabilities:**
    *   Supports `app.get`, `app.post`, route parameters (`/user/:id`), and JSON responses.
    *   **Requirement:** Users **must** use `export default app` at the end of their code.
*   **Limitations:**
    *   `app.fire()` and `app.listen()` are patched/intercepted to start the communication bridge but are considered legacy usage.
    *   Node.js specific adapters (like `serve-static`) will not work.

### `hono-ts` (Hono + TypeScript)
*   **Capabilities:** Same as `hono`, but with TypeScript transpilation and editor type definitions.

### `express` (Node / Express Mock)
*   **Engine:** **Mock Object**.
*   **Architecture:** 
    *   Uses a custom JavaScript class that *mimics* the Express API.
    *   It is **not** running the actual Express library (which requires Node.js bindings).
*   **Capabilities:**
    *   `app.get()`, `app.post()`, `app.listen()`.
    *   `req.params`, `req.query`, `res.json()`, `res.status()`, `res.send()`.
    *   Designed strictly for teaching basic API routing concepts.
*   **Limitations:**
    *   **No Middleware:** `app.use()` is not fully implemented.
    *   **No Third-Party Middleware:** `cors`, `body-parser`, `morgan` cannot be imported.
    *   **No Request/Response Streams:** It simulates simple request/response cycles only.

### `express-ts` (Express + TypeScript)
*   **Capabilities:** Same as `express` mock, but with TS syntax and mock type definitions in the editor.

---

## 5. Logic & Algorithms (Headless)

Environments optimized for teaching pure logic without DOM distractions.

### `node-js` (JavaScript Console)
*   **Engine:** Native Browser JS (Scoped).
*   **Visuals:** The DOM is hidden/disabled. Output is directed strictly to the Console component.
*   **Architecture:**
    *   The runner shadows `window`, `document`, and `root` with `null` inside the execution scope.
    *   This forces students to rely on data structures and `console.log`.
    *   The Monaco language service is configured to match: `lib: ["es2020"]`
        instead of the default set, plus an ambient `console` shim. Without
        this the editor loads `lib.dom.d.ts` and advertises the very globals
        the runner nulls out — and `let name = "Ada"` merges with the
        deprecated `window.name`, striking through the learner's own variable.
        `express` and `hono` get the same treatment; `dom`, `p5`, `p5play`,
        and `react` keep the DOM lib, where flagging `name` is correct.
    *   Monaco's language defaults are global to the runtime, so a page with
        both a `node-js` and a `dom` sandbox can hold only one lib set at a
        time. The config is re-applied on editor focus, so the editor the
        learner is typing in is always the correctly configured one.
*   **Capabilities:** Pure JavaScript (ES6+).

### `node-ts` (TypeScript Console)
*   **Engine:** Babel (Presets: `typescript`, `env`).
*   **Visuals:** Headless (Console only).
*   **Capabilities:** Pure TypeScript. Excellent for teaching interfaces, types, and classes without UI overhead.
