# CodeShoebox

CodeShoebox is a self-contained, secure code playground component for React. It features a Monaco editor, a sandboxed execution environment (iframe), and support for multiple runtime modes (DOM, p5.js, React).

## Features

- **Secure Execution**: Uses a sandboxed iframe with strict permissions (`allow-scripts`).
- **Monaco Editor**: Full-featured code editing experience via `@monaco-editor/react`.
- **Multiple Environments**:
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

To install version **v1.0.15**:

```bash
npm install github:rmccrear/code-shoebox#v1.0.15
# or
yarn add github:rmccrear/code-shoebox#v1.0.15
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
| `environmentMode` | `'dom' \| 'p5' \| 'react' \| 'typescript' \| 'react-ts' \| 'express' \| 'express-ts' \| 'node-js' \| 'node-ts' \| 'hono' \| 'hono-ts'` | Yes | Determines the runtime environment. |
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
