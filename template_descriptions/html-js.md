# Environment: HTML & JavaScript (script.js)
**ID:** `html-js`

## Overview
A two-file interactive page: edit the structure in **index.html**, edit the behavior in **script.js**, connect them with a script tag, and press Run. This mode is for learning how JavaScript finds elements, listens for events, updates content, and reports information to the console.

## Features
- **Two editable tabs:** `index.html` and `script.js`, each with its own undo history.
- **Explicit connection:** JavaScript runs only when `index.html` includes `<script src="script.js"></script>`. A blue hint provides the tag when it is missing.
- **Fresh page per Run:** the current HTML is restored before the current JavaScript executes.
- **Real browser APIs:** `document`, `window`, and the sandbox `root` element are available.
- **Console:** captures logs, warnings, errors, and rejected promises.

## Output UI
- **Visual:** body content from `index.html` renders inside the sandbox output.
- **Console:** visible below the page output.
- **Execution:** manual only. Editing does not run JavaScript; press Run when ready.

## Limitations
- **Only script.js executes:** inline scripts, remote scripts, data URLs, and other filenames are removed and never run.
- **Body content only:** learner body children render under `#root`; head metadata, title, body attributes, and parser timing are not reproduced.
- **Native JavaScript:** no TypeScript, Babel, JSX, modules, `import`/`export`, packages, or additional files.
- **Fixed files:** tabs cannot be added, removed, or renamed.

## Code format (for tools and LLMs)
The mode's code string is a JSON envelope holding both files:

```json
{"__csFiles__":1,"files":{"index.html":"<button id=\"go\">Go</button><script src=\"script.js\"></script>","script.js":"document.getElementById('go').addEventListener('click', () => console.log('Go'));"}}
```

A plain non-envelope string is treated as `index.html` with an empty `script.js`.

## LLM Usage Hints
- Use for event listeners, selectors, DOM updates, forms, and basic browser interactions.
- Always include the exact `<script src="script.js"></script>` marker near the end of the body.
- Put executable code only in `script.js`; do not suggest inline scripts, alternate filenames, imports, or packages.
- Remind learners to press Run after editing.

## Example Code

index.html:

```html
<h1 id="message">Waiting</h1>
<button id="go" type="button">Go</button>
<script src="script.js"></script>
```

script.js:

```javascript
const message = document.getElementById('message');
const button = document.getElementById('go');

button.addEventListener('click', () => {
  message.textContent = 'JavaScript changed the page!';
  console.log('Interaction complete');
});
```
