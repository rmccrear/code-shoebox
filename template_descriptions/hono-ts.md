# Environment: Hono + TypeScript
**ID:** `hono-ts`

## Overview
Hono environment with TypeScript support.

## Features
- **Library:** Hono v4.x.
- **Transpilation:** Babel (TypeScript).
- **Typing:** Context `c` is typed.

## Output UI
- **Visual:** `ServerOutput`. A "Postman-like" interface.
- **Constraint:** Restricted to **GET** requests only.

## LLM Usage Hints
- `import { Hono } from 'hono'`.
- `export default app`.

## Example Code
```typescript
import { Hono } from 'hono';

const app = new Hono();

// Dynamic route with typed param handling
app.get('/user/:name', (c) => {
  const name = c.req.param('name');
  return c.json({
    message: `Hello, ${name}!`,
    timestamp: Date.now()
  });
});

export default app;
```
