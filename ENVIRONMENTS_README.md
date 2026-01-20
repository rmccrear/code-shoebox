
# CodeShoebox Runtime Environments

This document provides a detailed inventory of the execution environments available in CodeShoebox (`v1.0.15`). 

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

### `dom` (DOM / JS)
*   **Engine:** Native Browser JavaScript (executed via `new Function`).
*   **Pre-loaded Libraries:** None.
*   **Capabilities:**
    *   Full access to the `document` and `window`.
    *   A global `root` variable is provided as the entry point `div`.
    *   CSS manipulation via JavaScript.
*   **Limitations:**
    *   No TypeScript support.
    *   No Babel transpilation (syntax is limited to what the user's browser supports natively).
    *   `import` / `export` syntax is not supported.

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
*   **Capabilities:** Pure JavaScript (ES6+).

### `node-ts` (TypeScript Console)
*   **Engine:** Babel (Presets: `typescript`, `env`).
*   **Visuals:** Headless (Console only).
*   **Capabilities:** Pure TypeScript. Excellent for teaching interfaces, types, and classes without UI overhead.
