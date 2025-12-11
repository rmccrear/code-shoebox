# CodeShoebox

CodeShoebox is a self-contained, secure code playground component for React. It features a Monaco editor, a sandboxed execution environment (iframe), and support for multiple runtime modes (DOM, p5.js, React).

## Features

- **Secure Execution**: Uses a sandboxed iframe with strict permissions (`allow-scripts`).
- **Monaco Editor**: Full-featured code editing experience via `@monaco-editor/react`.
- **Multiple Environments**:
  - `dom`: Standard JavaScript manipulation.
  - `p5`: p5.js creative coding environment with auto-canvas detection.
  - `react`: Live React component rendering with in-browser Babel transpilation.
- **Themable**: Full support for light/dark modes and custom color themes.

## Installation

```bash
npm install code-shoebox
# or
yarn add code-shoebox
```

**Note:** This library relies on [Tailwind CSS](https://tailwindcss.com/) for styling. Ensure your project has Tailwind configured or that you import the necessary utility classes.

## Usage

```tsx
import React, { useState } from 'react';
import { CodeShoebox, themes } from 'code-shoebox';

const MyEditor = () => {
  const [code, setCode] = useState('console.log("Hello World");');

  return (
    <div style={{ height: '100vh', width: '100vw' }}>
      <CodeShoebox 
        code={code}
        onCodeChange={setCode}
        environmentMode="dom"
        theme={themes[0]}
        themeMode="dark"
        sessionId={0}
      />
    </div>
  );
};
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `code` | `string` | Yes | The source code to display in the editor. |
| `onCodeChange` | `(code: string) => void` | Yes | Callback function invoked whenever the user types in the editor. |
| `environmentMode` | `'dom' \| 'p5' \| 'react'` | Yes | Determines the runtime environment and pre-loaded libraries available in the sandbox. |
| `theme` | `Theme` | Yes | An object defining the color palette. See `theme.ts` for structure. |
| `themeMode` | `'light' \| 'dark'` | Yes | Toggles the UI and editor between light and dark visual styles. |
| `sessionId` | `number` | No | A unique identifier (e.g., timestamp or counter). Changing this prop will hard-reset the internal editor state and undo history. |

## Development

1. Install dependencies: `npm install`
2. Build the package: `npm run build`
