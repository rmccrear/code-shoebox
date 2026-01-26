# Environment: Hono
**ID:** `hono`

## Overview
Real Hono web framework running in the browser via ESM.

## Features
- **Library:** Hono v4.x loaded from `esm.sh`.
- **Standard:** Uses Web Standard `Request` / `Response` objects.
- **Execution:** User must `export default app`. The runner hooks into `app.fetch`.

## Output UI
- **Visual:** `ServerOutput` component. A "Postman-like" interface for testing API endpoints.
- **Constraint:** The UI currently supports **GET** requests only.

## Limitations
- **Methods:** UI interactions are limited to `GET`.
- **Runtime:** Browser-based, not Cloudflare Workers or Node.
- **Adapters:** Node-specific adapters unavailable.

## LLM Usage Hints
- Use standard Hono syntax: `app.get('/', (c) => c.text('Hi'))`.
- MUST end file with `export default app`.

## Example Code
```javascript
import { Hono } from 'hono';

const app = new Hono();

// Return plain text
app.get('/', (c) => c.text('Welcome to Hono!'));

// Return JSON
app.get('/json', (c) => {
  return c.json({ 
    ok: true, 
    message: 'Fast & Standards-based' 
  });
});

export default app;
```
