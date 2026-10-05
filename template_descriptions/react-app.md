# Environment: React App (Vite-style)
**ID:** `react-app`

## Overview
Bounded React 18 environment that treats learner code like a small Vite workspace: `App.jsx`, up to two lesson-defined component JSX files, and optional `App.css` and `index.html`.

## Features
- **Libraries:** React 18 and ReactDOM 18 are pre-loaded.
- **Transpilation:** Babel with the `react` and `env` presets and ES modules transformed to CommonJS.
- **Entry Point:** The default export is mounted to `#root` automatically.
- **Imports:** Imports from `react` and `react-dom/client` use the sandbox's bundled shims.
- **Components:** `./Counter` and `./Counter.jsx` resolve bounded top-level component files with named or default exports.
- **Styles:** The exact `import './App.css'` applies the editable `App.css` file.
- **Storage:** Files use the version-1 file envelope. Lesson authors can call `serializeReactAppBundle`; plain legacy code becomes `App.jsx` alone.
- **Cleanup:** The previous React root is unmounted before every manual run.

## Limitations
- A default component export is required.
- This is a bounded learning environment, not the full Vite toolchain: nested paths, more than two component files, other JavaScript extensions, CSS Modules, arbitrary npm packages, `import.meta`, dynamic imports, and hot-module replacement are unavailable.
- Named exports are allowed, but only the default export is rendered.

## LLM Usage Hints
- Write the example exactly as an `App.jsx` module.
- Include `export default App` or default-export the component declaration.
- Import `./App.css` when the stylesheet should apply.
- Supply meaningful, uppercase component filenames (for example, `Counter.jsx`) in the initial lesson bundle; learners cannot create, delete, or rename files.
- Do not add `createRoot(...).render(...)`; the sandbox supplies the entry point.

## Example Code
```jsx
import { useState } from 'react';
import './App.css';

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <button type="button" onClick={() => setCount((value) => value + 1)}>
      Count: {count}
    </button>
  );
}
```

React App workspaces may optionally include `App.css` and `index.html`.
Only explicitly supplied files get tabs; an empty supplied `App.css` still
shows its tab. Existing two-file bundles retain both tabs. Plain JSX source
shows only `App.jsx`. Editing preserves which optional files are present.

The optional `index.html` supports external HTTP(S) stylesheet links in
`<head>`. Links are installed in document order before imported `App.css`
and removed on the next Run. Load failures are reported in the console.
HTML body markup and scripts are not executed; React mounts automatically.
This does not add npm package imports or a Vite build pipeline.
