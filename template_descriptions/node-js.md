# Environment: Node JS (Console / Algorithms)
**ID:** `node-js`

## Overview
Headless JavaScript environment optimized for algorithmic logic.

## Features
- **Globals:** `window` and `document` are shadowed/nulled to prevent DOM usage.
- **Focus:** Pure JS logic (Arrays, Objects, Math).

## Output UI
- **Visual:** Hidden/Placeholder.
- **Console:** The primary output channel.

## Limitations
- **DOM:** Not available.
- **Node APIs:** Mock only; no real File System or Network listeners.

## LLM Usage Hints
- Use for teaching algorithms, data structures, or pure logic.
- Rely heavily on `console.log()` and `console.table()`.

## Example Code
```javascript
const numbers = [1, 2, 3, 4, 5];

// Square the numbers
const squares = numbers.map(n => n * n);

console.log("Original List:", numbers);
console.log("Squared List:", squares);

// Filter for even numbers
const evens = numbers.filter(n => n % 2 === 0);
console.log("Even Numbers:", evens);
```
