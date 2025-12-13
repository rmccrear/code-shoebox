
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
- **Themable**: Full support for light/dark modes and custom color themes.
- **State Management**: Built-in hook `useSandboxState` for easy persistence and mode switching.

## Installation

To install version **v1.0.6**:

```bash
npm install github:rmccrear/code-shoebox#v1.0.6
# or
yarn add github:rmccrear/code-shoebox#v1.0.6
```

## Styling Setup

CodeShoebox ships with a compiled CSS file that includes all necessary layout styles. **You must import this file in your application.**

In your root file (e.g., `main.tsx`, `App.tsx`, or `_app.tsx`):

```tsx
import 'code-shoebox/styles.css';
```

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
      {/* Optional: Add controls to change modes */}
      <select value={environmentMode} onChange={e => setEnvironmentMode(e.target.value)}>
        <option value="dom">JavaScript</option>
        <option value="react">React</option>
        <option value="p5">p5.js</option>
        <option value="express">Node/Express</option>
      </select>

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

### 2. Manual Usage

You can also manage the state yourself if you have custom requirements (e.g., saving to a database instead of localStorage).

```tsx
import React, { useState } from 'react';
import { CodeShoebox, themes } from 'code-shoebox';
import 'code-shoebox/styles.css';

const MyCustomEditor = () => {
  const [code, setCode] = useState('console.log("Hello World");');

  return (
    <div style={{ height: '500px' }}>
      <CodeShoebox 
        code={code}
        onCodeChange={setCode}
        environmentMode="dom"
        theme={themes[0]}
        themeMode="dark"
      />
    </div>
  );
};
```

### 3. Environment Specific Examples

CodeShoebox supports multiple execution environments. When manually managing state, ensure you pass the correct `environmentMode` and compatible code.

#### React Mode
Renders a React component tree. The environment includes `react`, `react-dom`, and `babel` for in-browser transpilation.

```tsx
<CodeShoebox 
  code={`
    import React from 'react';
    import { createRoot } from 'react-dom/client';
    
    function App() { 
      return (
        <div style={{ textAlign: 'center', marginTop: 50 }}>
          <h1>Hello React</h1>
          <p>Live rendering in the browser!</p>
        </div>
      );
    }
    
    const root = createRoot(document.getElementById('root'));
    root.render(<App />);
  `}
  onCodeChange={handleCodeChange}
  environmentMode="react"
  theme={activeTheme}
  themeMode="dark"
/>
```

#### p5.js Mode
Automatically detects the global `setup` and `draw` functions and moves the created canvas into the output window.

```tsx
<CodeShoebox 
  code={`
    function setup() {
      createCanvas(400, 400);
      background(220);
    }
    
    function draw() {
      if (mouseIsPressed) {
        fill(0);
      } else {
        fill(255);
      }
      ellipse(mouseX, mouseY, 50, 50);
    }
  `}
  onCodeChange={handleCodeChange}
  environmentMode="p5"
  theme={activeTheme}
  themeMode="light"
/>
```

#### Express (Node.js) Mode
Simulates a Node.js Express server environment. The output pane becomes a console and API testing tool (Postman-lite).

```tsx
<CodeShoebox 
  code={`
    const app = express();
    const port = 3000;
    
    app.get('/', (req, res) => {
      res.json({ status: 'active', message: 'Mock server running' });
    });
    
    app.get('/hello/:name', (req, res) => {
      res.json({ greeting: 'Hello ' + req.params.name });
    });
    
    app.listen(port, () => {
      console.log('Server ready on port ' + port);
    });
  `}
  onCodeChange={handleCodeChange}
  environmentMode="express"
  theme={activeTheme}
  themeMode="dark"
/>
```

## Persistence Strategy

The library provides multiple ways to manage saved state.

### 1. Persistent Mode (Explicit Key)
Pass a manual string ID (e.g., `useSandboxState('lesson-1')`).
*   Code, theme, and mode preferences are saved to `localStorage` namespaced by this ID.
*   Great for courses where you want users to resume where they left off.

### 2. Scratchpad Mode (No Key)
Pass nothing (e.g., `useSandboxState()`).
*   State is kept in memory only.
*   Reloading the page resets the editor to the starter code.

### 3. Automatic Key Generation (Helper Hook)
Use the `useAutoKey` helper to generate a key based on:
1. The page URL.
2. The exercise prompt.
3. The starting code (optional).

This ensures the code is saved specifically for that unique configuration on that page.

```tsx
import { CodeShoebox, useSandboxState, useAutoKey } from 'code-shoebox';

const ExerciseComponent = () => {
  const promptText = "Write a function that calculates the factorial of n.";
  const starterCode = "function factorial(n) { \n // TODO \n }";
  
  // Generates a hash key based on pathname + prompt + starterCode
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

**Note:** If you change the `promptText` or `starterCode`, the hash will change, and the user's saved code for that exercise will be reset (treated as a new exercise). Ensure your prompts are stable before releasing content.

## Cookbook

Here are some minimal examples demonstrating the versatility of CodeShoebox.

### 1. The "Pop Quiz" (Prediction Mode)
Force students to read and understand code before running it. The editor is read-only and the output is blurred until they enter a prediction.

```tsx
<CodeShoebox 
  code="console.log(2 + 2);"
  onCodeChange={() => {}} 
  environmentMode="dom"
  theme={themes[0]}
  themeMode="dark"
  prediction_prompt="What will be logged to the console?"
/>
```

### 2. Custom Branding (Theming)
CodeShoebox uses HSL values for theming. You can inject your own brand colors easily.

```tsx
const matrixTheme = {
  name: "Matrix",
  light: { 
     primary: "120 100% 25%", 
     primaryForeground: "0 0% 100%", 
     ring: "120 100% 25%", 
     sidebarPrimary: "120 100% 25%",
     sidebarPrimaryForeground: "0 0% 100%", 
     sidebarRing: "120 100% 25%" 
  },
  dark: {
    primary: "120 100% 50%", // Bright Green
    primaryForeground: "0 0% 0%",
    ring: "120 100% 50%",
    sidebarPrimary: "120 100% 50%",
    sidebarPrimaryForeground: "0 0% 0%", 
    sidebarRing: "120 100% 50%",
    background: "0 0% 0%", // Pure Black
    foreground: "120 100% 50%"
  }
};

<CodeShoebox 
  code="// Welcome to the real world."
  onCodeChange={setCode}
  environmentMode="dom"
  theme={matrixTheme}
  themeMode="dark"
/>
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `code` | `string` | Yes | The source code to display in the editor. |
| `onCodeChange` | `(code: string) => void` | Yes | Callback function invoked whenever the user types in the editor. |
| `environmentMode` | `'dom' \| 'p5' \| 'react' \| 'typescript' \| 'react-ts' \| 'express'` | Yes | Determines the runtime environment and pre-loaded libraries available in the sandbox. |
| `theme` | `Theme` | Yes | An object defining the color palette. See `theme.ts` for structure. |
| `themeMode` | `'light' \| 'dark'` | Yes | Toggles the UI and editor between light and dark visual styles. |
| `sessionId` | `number` | No | A unique identifier. Incrementing this forces a hard-reset of the editor (clearing undo history). Handled automatically by `useSandboxState`. |
| `prediction_prompt` | `string` | No | If provided, locks the editor in "Read Only" mode and blurs the output until the user enters a prediction. |

## Development

1. Install dependencies: `npm install`
2. Build the package: `npm run build`
