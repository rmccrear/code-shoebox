# Environment: React + TypeScript
**ID:** `react-ts`

## Overview
React 18 environment with TypeScript and JSX support.

## Features
- **Libraries:** React 18, ReactDOM 18.
- **Transpilation:** Babel (Presets: `react`, `typescript`, `env`).
- **Typing:** Supports `React.FC`, `interface Props`, `useState<T>`.

## Output UI
- **Visual:** React Component tree.

## Limitations
- Same as React environment.

## LLM Usage Hints
- Use for modern React patterns with strict typing.

## Example Code
```typescript
import React from 'react';
import { createRoot } from 'react-dom/client';

interface GreetingProps {
  name: string;
}

const Greeting: React.FC<GreetingProps> = ({ name }) => {
  return <h1>Hello, {name}!</h1>;
};

const App = () => <Greeting name="Student" />;

const root = createRoot(document.getElementById('root'));
root.render(<App />);
```
