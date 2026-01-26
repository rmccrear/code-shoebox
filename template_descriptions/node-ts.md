# Environment: Node TS (Console / Algorithms)
**ID:** `node-ts`

## Overview
Headless TypeScript environment for logic and algorithms.

## Features
- **Transpilation:** Babel (TypeScript).
- **Globals:** `window`/`document` disabled.

## Output UI
- **Visual:** Hidden.
- **Console:** Primary output.

## LLM Usage Hints
- Use for teaching TS interfaces, classes, and type utilities without UI distraction.

## Example Code
```typescript
interface Task {
  id: number;
  title: string;
  completed: boolean;
}

const tasks: Task[] = [
  { id: 1, title: "Learn Types", completed: true },
  { id: 2, title: "Write Code", completed: false }
];

// Display tasks nicely
console.table(tasks);

const remaining = tasks.filter(t => !t.completed).length;
console.log(`Tasks remaining: ${remaining}`);
```
