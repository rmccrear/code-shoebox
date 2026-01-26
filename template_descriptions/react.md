# Environment: React
**ID:** `react`

## Overview
React 18 environment with JSX support, transpiled in-browser.

## Features
- **Libraries:** React 18, ReactDOM 18 pre-loaded (UMD).
- **Transpilation:** Babel (Presets: `react`, `env`).
- **Entry Point:** `ReactDOM.createRoot` is patched. User typically renders to `document.getElementById('root')`.
- **Imports:** `import React from 'react'` is shimmed to global `window.React`.

## Output UI
- **Visual:** React Component tree rendered in iframe.
- **Console:** Captures React warnings/logs.

## Limitations
- **Hooks:** Only standard React hooks available.
- **External Libs:** Cannot import third-party React libraries (e.g., Router) without CDN injection.

## LLM Usage Hints
- Suggest Functional Components and Hooks (`useState`, `useEffect`).
- Ensure code mounts to `root`.

## Example Code
```javascript
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div style={{ padding: 20 }}>
      <h2>Count: {count}</h2>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}

const root = createRoot(document.getElementById('root'));
root.render(<Counter />);
```
