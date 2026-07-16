# Environment: DOM / Vanilla JS
**ID:** `dom`

## Overview
Standard browser-based JavaScript execution environment with direct access to the DOM.

## Features
- **Engine:** Native Browser JS (executed via `new Function`).
- **Globals:** Full access to `window` and `document`.
- **Entry Point:** A global variable `root` (HTMLElement) is provided as the main container.
- **CSS:** Styles can be injected via JS.
- **Host Fixtures:** Lessons may supply trusted `fixtureHtml` and `fixtureCss`. They are restored before every run so learner code starts from a pristine real DOM.

## Output UI
- **Visual:** Renders HTML content directly into the sandboxed iframe's `#root` element.
- **Console:** Captures `console.log`, `error`, `warn`.
- **Files:** `script.js` is editable. Supplied `index.html` and `style.css` fixtures appear as read-only tabs, with no more than these three files.

## Limitations
- **Modules:** No `import`/`export` support.
- **Transpilation:** No Babel; syntax limited to browser support (modern browsers usually support ES6+).
- **Node APIs:** No `fs`, `process`, or native Node modules.
- **Fixture scope:** Host fixtures are DOM-only and do not add imports, arbitrary libraries, or editable project files.

## LLM Usage Hints
- Use for teaching DOM manipulation (e.g., `document.createElement`).
- Use for basic Event Listener tutorials.
- Do not suggest `import` statements.

## Example Code
```javascript
// Create a button that changes color when clicked
const btn = document.createElement('button');
btn.innerText = 'Click Me!';
btn.style.padding = '10px 20px';
btn.style.fontSize = '16px';

btn.onclick = () => {
  btn.style.backgroundColor = 'gold';
  console.log('Button clicked!');
};

root.appendChild(btn);
```
