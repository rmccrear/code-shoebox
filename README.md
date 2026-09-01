# CodeShoebox

CodeShoebox is a self-contained, secure code playground component for React. It features a Monaco editor, a sandboxed execution environment (iframe), and support for multiple runtime modes (DOM, p5.js, React).

## Features

- **Secure Execution**: Uses a sandboxed iframe with strict permissions (`allow-scripts`).
- **Monaco Editor**: Full-featured code editing experience via `@monaco-editor/react`.
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

To install version **v1.0.24**:

```bash
npm install github:rmccrear/code-shoebox#v1.0.24
# or
yarn add github:rmccrear/code-shoebox#v1.0.24
```

## Maintenance & Releases

To create a new release (tagging and updating distribution branch):

1. Update the version in `package.json`.
2. Commit your changes.
3. Run the release command:
   ```bash
   npm run release
   ```
   This script will automatically tag the release with `v[version]` using your latest commit message as the tag description, push the tag, and update the `dist` branch.

## Layout Requirements

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
      requestHeaders: { 'x-api-key': 'lesson-key' },
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
    'X-API-Key': 'lesson-key',
  },
  body: JSON.stringify({ city: 'Portland', threshold: 50 }),
});
console.log(await response.json());
```

Undeclared `/api/...` routes resolve as JSON `404` responses; declared network errors reject. Absolute URL strings are rejected and the iframe uses `connect-src 'none'`, so tutorial calls never contact a real API. Responses remain stateless and canned: request matchers select a response but do not run host callbacks or mutate server state. Values such as tutorial API keys are visible fixture data, not secrets—never place real credentials in `mockApi`.

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

Use `html-css-js` when learners should own a page's structure, presentation, and behavior as three fixed files: `index.html`, `style.css`, and `script.js`. Pressing Run rebuilds the page, applies the CSS when HTML contains `<link rel="stylesheet" href="style.css">`, and executes JavaScript when HTML contains `<script src="script.js"></script>`. The two links resolve independently, and the console captures logs and runtime errors.

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
1.  **Locked Editor**: The code becomes Read-Only.
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

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `code` | `string` | Yes | The source code to display in the editor. |
| `onCodeChange` | `(code: string) => void` | Yes | Callback function invoked whenever the user types in the editor. |
| `environmentMode` | `'html' \| 'html-css' \| 'html-js' \| 'html-js-fetch' \| 'html-css-js' \| 'html-js-css-media' \| 'dom' \| 'fetch' \| 'typescript' \| 'p5' \| 'p5-ts' \| 'p5play' \| 'react' \| 'react-ts' \| 'express' \| 'express-ts' \| 'hono' \| 'hono-ts' \| 'node-js' \| 'node-ts'` | Yes | Determines the runtime environment. |
| `fixtureHtml` | `string` | No | Trusted host-authored markup restored before every Run in `dom` mode; shown as a read-only `index.html` tab. |
| `fixtureCss` | `string` | No | Trusted host-authored styles restored before every Run in `dom` mode; shown as a read-only `style.css` tab. |
| `mediaAssets` | `readonly MediaAsset[]` | No | Host-authored image/audio/video descriptors shown read-only in `html-js-css-media`; the first 3 are displayed. |
| `enableEmmet` | `boolean` | No | Enables Emmet abbreviation completions in editable HTML models; defaults to `false`. |
| `mockApi` | `MockApiConfig` | No | Host-authored mock routes shown and executed in `fetch` and `html-js-fetch`. Routes remain outside learner code and persistence. |
| `theme` | `Theme` | Yes | An object defining the color palette. See `theme.ts` for structure. |
| `themeMode` | `'light' \| 'dark'` | Yes | Toggles the UI and editor between light and dark visual styles. |
| `sessionId` | `number` | No | A unique identifier. Incrementing this forces a hard-reset of the editor. |
| `prediction_prompt` | `string \| React.ReactNode` | No | If provided, locks the editor in "Read Only" mode for prediction exercises. |
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
