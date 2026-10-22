# CodeShoebox

CodeShoebox is a self-contained, secure code playground component for React. This CodeMirror QA release features a CodeMirror 6 editor, a sandboxed execution environment (iframe), and support for multiple runtime modes (DOM, p5.js, React).

## Features

- **Secure Execution**: Uses a sandboxed iframe with strict permissions (`allow-scripts`).
- **CodeMirror 6**: Built-in language support, snippets and local-name completion, with Tab acceptance.
- **Optional Emmet**: Set `enableEmmet` to expand Emmet abbreviations in editable HTML models.
- **Multiple Environments**:
  - `html`: Static HTML pages with live preview (no JavaScript execution).
  - `html-css`: Two-tab HTML & CSS editing (`index.html` + `style.css`) with live preview.
  - `html-js`: Two-tab HTML & JavaScript editing (`index.html` + `script.js`) with manual execution and console output.
  - `html-css-js`: Three-tab HTML, CSS & JavaScript editing with explicit local-file links, manual execution, and console output.
  - `html-js-css-media`: Three editable web files plus a read-only Media tab with up to three image, audio, or video assets and usage snippets.
  - `dom`: Standard JavaScript manipulation.
  - `typescript`: TypeScript compilation and execution.
  - `p5`: p5.js creative coding environment with auto-canvas detection.
  - `react`: Live React component rendering with in-browser Babel transpilation.
  - `react-app`: Vite-style `App.jsx`, up to two imported component JSX files, and optional `App.css` and `index.html`, with ES module exports and automatic default-export rendering. Supplying `mockApi` optionally enables local mock fetch routes.
  - `react-ts`: React with TypeScript support.
  - `express`: Mocked Node.js/Express environment for testing API routes.
  - `express-ts`: Mocked Express environment with TypeScript support.
  - `hono`: Modern, web-standard server environment using Hono (JS).
  - `hono-ts`: Hono environment with TypeScript support.
  - `node-js`: Pure JavaScript environment optimized for logic and algorithms (Console only).
  - `node-ts`: Pure TypeScript environment optimized for logic and algorithms (Console only).
- **Themable**: Full support for light/dark modes and custom color themes.
- **State Management**: Built-in hook `useSandboxState` for easy persistence and mode switching.
- **Pedagogical Tools**: Built-in support for code prediction exercises (PRIMM).
- **Diagnostic Mode**: Internal logging to debug iframe communication and environment setup.

## Installation

The experimental **v1.0.38-c** release defaults to CodeMirror 6 without changing
`CodeShoebox` props. Install the compiled QA release:

```bash
npm install github:rmccrear/code-shoebox#v1.0.38-c
```

Keep importing `code-shoebox/styles.css`. Emmet lessons retain `enableEmmet` for
editable HTML. JavaScript, JSX, TypeScript and TSX use built-in language support;
semantic type errors are available with the optional checker below. Inferred type
hovers remain unavailable. Exercise execution, including TypeScript transpilation,
is unchanged.

The QA distribution is also available on `dist-c`. Stable Monaco remains at
`v1.0.37` and `dist`. The QA tag points to compiled package files; the source is
on `codex/codemirror6-prototype`. This QA release includes the v1.0.37 external
stylesheet fixes for HTML + CSS + JavaScript and its Media variant.

## Optional TypeScript diagnostics (Vite)

Version `v1.0.38-c` includes a separately bundled, opt-in checker. Import its
worker through your application's bundler:

```tsx
import TypeScriptWorker from 'code-shoebox/ts-checker.worker.js?worker';

// Keep this factory outside the component. No worker is constructed by the import.
const createTypeScriptWorker = () => new TypeScriptWorker();

<CodeShoebox {...props} createTypeScriptWorker={createTypeScriptWorker} />
```

Vite emits a hashed worker under the application's assets directory, including
when deployed under a configured base path. No public-folder copy, external
compiler CDN, backend endpoint or `workerUrl` setting is required. Include
`vite/client` types in the application's TypeScript configuration for `?worker`.
Other bundlers can supply an equivalent factory returning a browser `Worker`.

CodeMirror calls the factory only in editable TypeScript lessons (`typescript`,
`react-ts`, `node-ts`, `express-ts`, `hono-ts`, `p5-ts`) on TS/TSX files. Ordinary
JS/JSX/HTML/CSS lessons and read-only/prediction previews do not download the
checker. Omit the factory to keep the existing lightweight behavior. Monaco's
existing diagnostics are unchanged.

The editor remains usable during initialization. Diagnostics include syntax and
semantic errors, update after an editing pause and clear when corrected. Workers
are scoped to a playground and terminated on unmount, session/mode changes,
read-only transitions or opting out. Type-aware completion and hovers are not
included. TypeScript 5.9.3 and matching ES2020/DOM libraries are bundled together;
the compiler is a build dependency, not a runtime npm dependency. Console modes
exclude DOM globals. React/p5/Express/Hono declarations are the existing teaching
shims, not arbitrary npm type acquisition or full framework typings.

Serve the emitted worker with JavaScript MIME type and compression. Hashed worker
assets can use long-lived immutable caching; allow same-origin workers in the
application's CSP. Hosting headers remain the consuming application's responsibility.

Build and run `npm run test:typescript-worker` to check the actual distribution
in consuming Vite development and production applications, including a non-root
base URL, diagnostics, corrections, lazy requests and cleanup.

## Maintenance & Releases

For CodeMirror QA releases, follow [PUBLISH.md](PUBLISH.md) to publish prepared
artifacts to `dist-c`; the stable release command below targets `dist`.

To create a stable release (tagging and updating distribution branch):

1. Update the version in `package.json`.
2. Commit your changes.
3. Run the release command:
   ```bash
   npm run release
   ```
   This script will automatically tag the release with `v[version]` using your latest commit message as the tag description, push the tag, and update the `dist` branch.

## Layout Requirements

The distributed `code-shoebox/styles.css` applies its reset and utilities only
to CodeShoebox's root and descendants. Keep the ordinary JavaScript CSS import
shown below; no host Tailwind installation or cascade-layer configuration is
required. Starting with v1.0.35, the package no longer supplies global resets
or utility styles for unrelated host elements. Applications that relied on
those styles should provide their own page styles.

**Important:** The `CodeShoebox` component is designed to fill its parent container (`height: 100%`). 
You must ensure the parent element has a defined height (e.g., a fixed pixel height like `500px` or a flex grow container like `h-screen`). If the parent has no height, the editor will collapse to 0px.

```tsx
// ✅ Correct
<div style={{ height: '80vh' }}>
  <CodeShoebox ... />
</div>

// ❌ Incorrect (Editor will be invisible)
<div>
  <CodeShoebox ... />
</div>
```

## Usage

### 1. Basic Usage (Managed State)

The easiest way to use CodeShoebox is with the provided `useSandboxState` hook. This hook handles code storage, language switching, and theme state for you.

```tsx
import React from 'react';
import { CodeShoebox, useSandboxState, themes } from 'code-shoebox';
import 'code-shoebox/styles.css'; // Don't forget the styles!

const MyEditor = () => {
  // Pass a unique ID to enable persistence (saves to localStorage).
  // Omit the ID for an ephemeral "scratchpad" (resets on reload).
  const {
    code,
    setCode,
    environmentMode,
    setEnvironmentMode,
    themeMode,
    setThemeMode,
    activeThemeName,
    sessionId
  } = useSandboxState('my-unique-lesson-id');

  // Map the theme name back to a Theme object
  const activeTheme = themes.find(t => t.name === activeThemeName) || themes[0];

  return (
    <div style={{ height: '100vh', width: '100vw' }}>
      <CodeShoebox 
        code={code}
        onCodeChange={setCode}
        environmentMode={environmentMode}
        theme={activeTheme}
        themeMode={themeMode}
        sessionId={sessionId}
      />
    </div>
  );
};
```

### Optional Emmet completions

Pass `enableEmmet` to opt an editor into Emmet abbreviation completions. The
feature applies only to editable HTML models, including the `index.html` tab in
multi-file web modes. It is disabled by default and does not change sandbox
execution.

In the CodeMirror backend, automatic suggestions and Tab expansion accept
standard HTML tags and abbreviations built from them (`div`, `ul>li.item*3`,
`.card`, `#main`, and `a:link`). Ordinary words, unknown/custom tag names, and
abbreviations following prose on the same line stay as text. HTML attributes,
comments, and embedded JavaScript/CSS are excluded. Tab works on saved or pasted
abbreviations as well as freshly typed ones; it also moves between snippet
fields. Enter inserts a newline, and Escape dismisses the suggestion list.

```tsx
<CodeShoebox
  code={code}
  onCodeChange={setCode}
  environmentMode="html-css-js"
  theme={themes[0]}
  themeMode="dark"
  enableEmmet
/>
```

### Hono Usage

When using the `hono` or `hono-ts` environments, you must **export your app instance as default**. 
Do not use `app.fire()` or `app.listen()`, as these methods are not supported in this sandbox environment.

**Correct Usage:**
```javascript
import { Hono } from 'hono';
const app = new Hono();

app.get('/', (c) => c.text('Hello Hono!'));

// Must export default
export default app;
```

## Diagnostic Mode (Debugging)

If you are experiencing issues with the code not running or logs not appearing in a specific hosting environment, you can enable **Diagnostic Mode**.

When `debugMode` is set to `true`, the internal console will output high-visibility `[System]` logs that trace:
- When the sandbox HTML is generated.
- When the iframe `onLoad` event triggers.
- When the communication ports are initialized.
- When the `EXECUTE` signal is dispatched to the runner.

```tsx
<CodeShoebox 
  code={code}
  onCodeChange={setCode}
  environmentMode="dom"
  theme={themes[0]}
  themeMode="dark"
  debugMode={true} // Enables verbose system logs
/>
```

## DOM Fixtures

In `dom` mode, a lesson can provide trusted host-authored HTML and CSS for learner JavaScript to manipulate. The editor starts on editable `script.js`; supplied `index.html` and `style.css` tabs are visible but read-only. The sandbox restores both fixtures before every Run, so each execution starts from the same markup and styles.

```tsx
const [code, setCode] = React.useState(`
  const status = document.getElementById('status-line');
  status.textContent = 'Systems: all green';
`);

<CodeShoebox
  code={code}
  onCodeChange={setCode}
  environmentMode="dom"
  fixtureHtml={`<p id="status-line">Systems: waiting</p>`}
  fixtureCss={`#status-line { color: seagreen; font-weight: 700; }`}
  theme={activeTheme}
  themeMode="dark"
/>
```

Fixtures are trusted host input delivered as message data to the sandboxed iframe. They do not add module imports, arbitrary libraries, or same-origin privileges, and they are ignored outside `dom` mode.

## Fetch API Tutorial Mode

Use `fetch` mode to teach browser `fetch()` against deterministic, host-authored mock routes. Learners edit `script.js` and read the locked **API Server** tab. Use `html-js-fetch` for the same mock API with editable `index.html` and `script.js` tabs, so fetched data can be rendered into a learner-authored page. Top-level `await` works in both modes, responses are genuine browser `Response` objects, and the default one-second delay makes asynchronous execution visible.

```tsx
import type { MockApiConfig } from 'code-shoebox';

const mockApi: MockApiConfig = {
  defaultDelayMs: 1000,
  routes: [
    {
      method: 'GET',
      path: '/api/air-quality',
      query: { limit: '4' },
      body: [
        { city: 'Portland', aqi: 38 },
        { city: 'Sacramento', aqi: 52 },
      ],
    },
    {
      method: 'POST',
      path: '/api/alerts',
      requestHeaders: { 'x-api-key': 'xyz-secret-key-lmnop' },
      requestBody: { city: 'Portland', threshold: 50 },
      status: 201,
      body: { id: 1, message: 'Alert created' },
    },
    {
      method: 'GET',
      path: '/api/offline',
      networkError: true,
      errorMessage: 'The mock API is offline',
    },
  ],
};

<CodeShoebox
  code={'let response = await fetch("/api/air-quality?limit=4");\nlet readings = await response.json();\nconsole.log(readings);'}
  onCodeChange={setCode}
  environmentMode="fetch"
  mockApi={mockApi}
  theme={activeTheme}
  themeMode="dark"
/>
```

Routes match by method and pathname, plus any optional request matchers. `query` requires an exact key/value set. `requestHeaders` requires those header values case-insensitively while allowing extra learner headers. `requestBody` deep-matches parsed JSON, ignoring object key order but preserving array order. The most specific matching route wins; equally specific routes keep declaration order, which makes it straightforward to place a generic fallback beside authenticated or body-specific responses. Missing or malformed JSON does not match `requestBody`.

```javascript
let response = await fetch('/api/alerts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'xyz-secret-key-lmnop',
  },
  body: JSON.stringify({ city: 'Portland', threshold: 50 }),
});
console.log(await response.json());
```

Undeclared `/api/...` routes resolve as JSON `404` responses; declared network errors reject. Absolute URL strings are rejected and the iframe uses `connect-src 'none'`, so tutorial calls never contact a real API. Responses remain stateless and canned: request matchers select a response but do not run host callbacks or mutate server state. Values such as tutorial API keys are visible fixture data, not secrets—never place real credentials in `mockApi`.

For `react-app`, supplying `mockApi` enables the same mock backend and adds the read-only **API Server** tab after the learner files. Omitting it preserves the ordinary React runtime; `{ routes: [] }` enables mocking with no declared routes. The route config stays outside the React file bundle and saved learner code.

```tsx
<CodeShoebox
  environmentMode="react-app"
  code={serializeReactAppBundle({
    'App.jsx': reactFetchExample,
  })}
  onCodeChange={setCode}
  mockApi={mockApi}
  theme={activeTheme}
  themeMode="dark"
/>
```

The mock is installed before React modules evaluate, so module code, effects, and event handlers can call `fetch()`. Each Run unmounts the previous root and aborts its pending mock requests. In effects, pass an `AbortController` signal, abort it during cleanup, and ignore `AbortError` when updating error UI. Execution completion means modules finished evaluating and the render was submitted; effects and event handlers may still have requests in flight. Route edits apply on the next Run. Adding or removing `mockApi` recreates the iframe.

The demo's `#react-app-fetch-demo` preset includes loading, success, network-error, and HTTP-error states with effect cleanup. The ordinary `#react-app-counter-demo` preset remains available without mocking.

In `html-js-fetch`, the code prop uses the same two-file envelope as `html-js`, and `index.html` must contain the literal `<script src="script.js"></script>` link. Each Run rebuilds the page, then executes `script.js` asynchronously with the configured mock routes.

## HTML + JavaScript Mode

Use `html-js` when learners should edit both the page structure and its behavior. The editor exposes editable `index.html` and `script.js` tabs. JavaScript runs only after pressing Run and only when the HTML contains `<script src="script.js"></script>`; the existing console captures logs and runtime errors.

```tsx
const state = useSandboxState('interactive-page', undefined, 'html-js');

<CodeShoebox
  code={state.code}
  onCodeChange={state.setCode}
  environmentMode={state.environmentMode}
  theme={activeTheme}
  themeMode="dark"
  sessionId={state.sessionId}
/>
```

## HTML + CSS + JavaScript Mode

Use `html-css-js` when learners should own a page's structure, presentation, and behavior as three fixed files: `index.html`, `style.css`, and `script.js`. Pressing Run rebuilds the page, applies the CSS when HTML contains `<link rel="stylesheet" href="style.css">`, and executes JavaScript when HTML contains `<script src="script.js"></script>`. The two links resolve independently, and the console captures logs and runtime errors. External stylesheet links and inline styles in head or body also apply in source order. Each Run replaces previous head styles and learner DOM. External CSS loads asynchronously; bundled JavaScript does not wait for it.

```tsx
const state = useSandboxState('complete-web-page', undefined, 'html-css-js');

<CodeShoebox
  code={state.code}
  onCodeChange={state.setCode}
  environmentMode={state.environmentMode}
  theme={activeTheme}
  themeMode="dark"
  sessionId={state.sessionId}
/>
```

## HTML + CSS + JavaScript + Media Mode

Use `html-js-css-media` when a lesson should provide media beside the same three editable web files. The top-level tabs are `index.html`, `style.css`, `script.js`, and read-only `Media`. The Media tab accepts up to three host-authored assets, previews each one, and shows snippets learners can paste into HTML, CSS (images), or JavaScript (audio/video playback).

```tsx
import type { MediaAsset } from 'code-shoebox';

const state = useSandboxState('media-page', undefined, 'html-js-css-media');
const mediaAssets: readonly MediaAsset[] = [
  {
    kind: 'image',
    name: 'Class poster',
    src: 'https://example.edu/assets/poster.jpg',
    alt: 'A poster for the class project',
  },
  { kind: 'audio', name: 'Theme music', src: 'https://example.edu/assets/theme.mp3' },
  { kind: 'video', name: 'Introduction', src: 'https://example.edu/assets/intro.mp4' },
];

<CodeShoebox
  code={state.code}
  onCodeChange={state.setCode}
  environmentMode={state.environmentMode}
  mediaAssets={mediaAssets}
  theme={activeTheme}
  themeMode="dark"
  sessionId={state.sessionId}
/>
```

Media descriptors remain host state: they are not uploaded, added to the code envelope, persisted to localStorage, or sent in iframe execution messages. Learners paste a shown snippet into an editable file and press Run. Only the first three assets are shown; an empty list produces a read-only empty state. MP3/WAV and video playback depend on browser codec support. Absolute HTTPS or data URLs are the most portable; relative URLs resolve against the host page, external URLs make browser requests to their origin, and Canvas/Web Audio access may still be restricted by CORS.

## Prediction Templates (Pedagogy)

CodeShoebox natively supports the **Predict** phase of the PRIMM model. By passing the `prediction_prompt` prop, you transform the editor into a prediction challenge.

This prop accepts **strings** or **JSX (React Nodes)**, allowing you to pass rich content like bullet lists, bold text, or code snippets within the question.

**Behavior:**
1.  **Static Source Viewer**: The host-provided code is shown in a lightweight, selectable, read-only viewer; Monaco is not mounted for prediction source.
2.  **Hidden Output**: The output frame is blurred/hidden.
3.  **Prediction Input**: A text area appears above the editor.
4.  **Unlock Trigger**: The "Run Code" button is disabled until the student enters a prediction.

```tsx
<CodeShoebox 
  code={`console.log("Mystery");`}
  onCodeChange={() => {}} 
  environmentMode="dom"
  theme={activeTheme}
  themeMode="dark"
  prediction_prompt={
    <div>
       <p style={{ fontWeight: 'bold' }}>Analyze the code below:</p>
       <ul style={{ paddingLeft: 20, listStyle: 'disc' }}>
         <li>What is the function name?</li>
         <li>What are the arguments?</li>
       </ul>
    </div>
  }
/>
```

## Persistence Strategy

The library provides multiple ways to manage saved state.

### 1. Persistent Mode (Explicit Key)
Pass a manual string ID (e.g., `useSandboxState('lesson-1')`).
*   Code, theme, and mode preferences are saved to `localStorage` namespaced by this ID.

### 2. Scratchpad Mode (No Key)
Pass nothing (e.g., `useSandboxState()`).
*   State is kept in memory only.

### 3. Automatic Key Generation (Helper Hook)
Use the `useAutoKey` helper to generate a key based on the page URL and prompt text.

```tsx
import { CodeShoebox, useSandboxState, useAutoKey } from 'code-shoebox';

const ExerciseComponent = () => {
  const promptText = "Write a function that calculates the factorial of n.";
  const starterCode = "function factorial(n) { \n // TODO \n }";
  const persistenceKey = useAutoKey(promptText, starterCode);
  const { code, setCode, ...state } = useSandboxState(persistenceKey);

  return (
    <CodeShoebox 
        code={code} 
        onCodeChange={setCode}
        prediction_prompt={promptText}
        {...state} 
    />
  );
};
```

## Props

For a lesson-defined multi-component `react-app` workspace, build the `code` string with the exported helper. Filenames are fixed for the learner and component files are limited to two:

```tsx
import { serializeReactAppBundle } from 'code-shoebox';

const code = serializeReactAppBundle({
  'App.jsx': `import Counter from './Counter';\nexport default function App() { return <Counter />; }`,
  'Counter.jsx': `export default function Counter() { return <button>Count</button>; }`,
  'App.css': `button { font: inherit; }`,
});
```

For a CSS-library lesson, include the optional HTML file:

```tsx
const code = serializeReactAppBundle({
  'App.jsx': `export default function App() { return <button className="library-button">Hello</button>; }`,
  'index.html': `<!doctype html><html><head>
    <link rel="stylesheet" href="https://your-cdn.example/library.css">
  </head><body></body></html>`,
});
```

Replace the example URL with the library's stylesheet URL. This workspace
shows `App.jsx` and `index.html` tabs. Add `'App.css': ''` to show an
empty CSS tab, or omit that entry to hide it. Import `./App.css` from JSX
when local CSS should apply.

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `code` | `string` | Yes | The source code to display in the editor. |
| `onCodeChange` | `(code: string) => void` | Yes | Callback function invoked whenever the user types in the editor. |
| `environmentMode` | `'html' \| 'html-css' \| 'html-js' \| 'html-js-fetch' \| 'html-css-js' \| 'html-js-css-media' \| 'dom' \| 'fetch' \| 'typescript' \| 'p5' \| 'p5-ts' \| 'p5play' \| 'react' \| 'react-app' \| 'react-ts' \| 'express' \| 'express-ts' \| 'hono' \| 'hono-ts' \| 'node-js' \| 'node-ts'` | Yes | Determines the runtime environment. |
| `fixtureHtml` | `string` | No | Trusted host-authored markup restored before every Run in `dom` mode; shown as a read-only `index.html` tab. |
| `fixtureCss` | `string` | No | Trusted host-authored styles restored before every Run in `dom` mode; shown as a read-only `style.css` tab. |
| `mediaAssets` | `readonly MediaAsset[]` | No | Host-authored image/audio/video descriptors shown read-only in `html-js-css-media`; the first 3 are displayed. |
| `enableEmmet` | `boolean` | No | Enables Emmet abbreviation completions in editable HTML models; defaults to `false`. |
| `mockApi` | `MockApiConfig` | No | Host-authored mock routes for `fetch` and `html-js-fetch`; supplying this also enables mocking in `react-app`. Routes remain outside learner code and persistence. |
| `theme` | `Theme` | Yes | An object defining the color palette. See `theme.ts` for structure. |
| `themeMode` | `'light' \| 'dark'` | Yes | Toggles the UI and editor between light and dark visual styles. |
| `sessionId` | `number` | No | A unique identifier. Incrementing this forces a hard-reset of the editor. |
| `prediction_prompt` | `string \| React.ReactNode` | No | If provided, shows immutable source in a static viewer for prediction exercises. |
| `debugMode` | `boolean` | No | Enables verbose `[System]` logs in the console to help debug setup issues. |

## Contributing

We welcome contributions! To set up the project locally and run the internal demo suite:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/rmccrear/code-shoebox.git
    cd code-shoebox
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Start the development server:**
    ```bash
    npm run dev
    ```
    This will start a Vite server (usually at `http://localhost:5173`).
    
    *   **Editor View:** The default view allows you to test the component directly.
    *   **Demo Suite:** Click the "Demos" button in the top header to access the `Demo.tsx` gallery, which showcases all available environments (p5.js, Express, Hono, etc.) with pre-loaded examples.

4.  **Building for distribution:**
    ```bash
    npm run build
    ```

To check that the packaged stylesheet leaves host styles unchanged, run
`npm run build`, install the test browser with `npx playwright install chromium`,
then run `npm run test:styles`. The regression suite serves the built package
and Monaco assets locally and checks both stylesheet load orders, host cascade
layers, plain hosts, and editable component interactions.

React App workspaces may optionally include `App.css` and `index.html`.
Only explicitly supplied files get tabs; an empty supplied `App.css` still
shows its tab. Existing two-file bundles retain both tabs. Plain JSX source
shows only `App.jsx`. Editing preserves which optional files are present.

The optional `index.html` supports external HTTP(S) stylesheet links in
`<head>`. Links are installed in document order before imported `App.css`
and removed on the next Run. Load failures are reported in the console.
HTML body markup and scripts are not executed; React mounts automatically.
This does not add npm package imports or a Vite build pipeline.
