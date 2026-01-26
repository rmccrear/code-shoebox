# Environment: Express (Mock)
**ID:** `express`

## Overview
A simulated backend environment mimicking the Express.js API.

## Features
- **Mock:** Custom `MockApp` class simulating `express()`.
- **API:** Supports `app.get`, `req.params`, `req.query`, `res.json`.
- **Execution:** Code runs in browser; requests are simulated via message passing from the ServerOutput component.

## Output UI
- **Visual:** `ServerOutput` component. A "Postman-like" interface containing an address bar and a JSON response viewer.
- **Interaction:** User types a route (e.g., `/users/1`) and clicks "Send" to trigger the request.
- **Constraint:** The UI currently supports **GET** requests only.

## Limitations
- **Methods:** Only `GET` requests can be initiated from the UI.
- **Middleware:** `app.use` is not fully supported.
- **Node modules:** Cannot `require` real node modules.
- **Async:** Simulates request/response cycle but not full HTTP stack.

## LLM Usage Hints
- Define routes: `app.get('/path', (req, res) => { ... })`.
- End with `app.listen(port)`.

## Example Code
```javascript
const app = express();

// Simple endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Hello World' });
});

// Dynamic endpoint with params
app.get('/double/:num', (req, res) => {
  const num = parseInt(req.params.num);
  res.json({ 
    original: num, 
    result: num * 2 
  });
});

app.listen(3000);
```
