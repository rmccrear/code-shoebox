# Environment: TypeScript (DOM)
**ID:** `typescript`

## Overview
Browser-based TypeScript execution environment using on-the-fly Babel transpilation.

## Features
- **Engine:** Babel Standalone (Presets: `env`, `typescript`).
- **Syntax:** Full TypeScript support (Interfaces, Types, Generics).
- **Globals:** Access to `window`, `document`, `root`.

## Output UI
- **Visual:** Renders HTML content in `#root`.
- **Console:** Captures output.

## Limitations
- **Type Checking:** Compile-time only (in editor); runtime is stripped JS.
- **Modules:** No external module imports.

## LLM Usage Hints
- Use for teaching strong typing in frontend logic.
- Code is transpiled, then executed.

## Example Code
```typescript
interface User {
  name: string;
  id: number;
}

const user: User = { name: "Alice", id: 101 };

// Create and style a display card
const div = document.createElement('div');
div.innerHTML = `
  <h3>User Profile</h3>
  <p>Name: ${user.name}</p>
  <p>ID: ${user.id}</p>
`;

root.appendChild(div);
```
