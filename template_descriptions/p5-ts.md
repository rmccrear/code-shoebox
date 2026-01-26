# Environment: p5.js + TypeScript
**ID:** `p5-ts`

## Overview
p5.js environment with TypeScript syntax support.

## Features
- **Library:** p5.js v1.9.0.
- **Transpilation:** Babel (TypeScript preset).
- **Typing:** Editor has p5.js type definitions.

## Output UI
- **Visual:** p5.js Canvas.

## Limitations
- Global augmentation for `window.setup` and `window.draw` is handled via shims or `(window as any)`.

## LLM Usage Hints
- Use interfaces for particle systems or entities.
- Cast `window` to `any` to define setup/draw if strict typing complains.

## Example Code
```typescript
// Define global functions on window for p5 to find them
(window as any).setup = () => {
  createCanvas(400, 400);
  background(50);
};

(window as any).draw = () => {
  noStroke();
  fill(255, 100, 100, 50); // Semi-transparent red
  
  // Random splatter effect
  const x = random(width);
  const y = random(height);
  circle(x, y, 10 + random(20));
};
```
