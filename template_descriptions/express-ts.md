# Environment: Express + TypeScript (Mock)
**ID:** `express-ts`

## Overview
Simulated Express environment with TypeScript support.

## Features
- **Transpilation:** Babel (TypeScript).
- **Mock:** Same `MockApp` as standard Express mode.
- **Typing:** Editor has `Request`, `Response` type shims.

## Output UI
- **Visual:** `ServerOutput`. A "Postman-like" interface for testing API endpoints.
- **Constraint:** Restricted to **GET** requests only.

## Limitations
- Only `GET` requests supported in the simulator UI.

## LLM Usage Hints
- Use type annotations for handlers: `(req: Request, res: Response)`.

## Example Code
```typescript
import express, { Request, Response } from 'express';

const app = express();

app.get('/api/status', (req: Request, res: Response) => {
  res.json({ 
    system: 'Online', 
    timestamp: new Date().toISOString() 
  });
});

app.listen(3000, () => {
  console.log('TS Server Ready');
});
```
