# Environment: HTML, CSS & JavaScript (3 files)
**ID:** `html-css-js`

## Overview
A complete interactive page split across three editable tabs: structure in **index.html**, presentation in **style.css**, and behavior in **script.js**. Connect both companion files explicitly in HTML, then press Run.

## Features
- **Three editable tabs:** `index.html`, `style.css`, and `script.js`, each with its own undo history.
- **Explicit CSS connection:** bundled styles apply only when HTML includes `<link rel="stylesheet" href="style.css">`.
- **Explicit JS connection:** bundled JavaScript runs only when HTML includes `<script src="script.js"></script>`.
- **Independent links:** a missing CSS link does not block linked JavaScript, and a missing script link does not block linked CSS. Each missing non-empty file gets its own blue hint.
- **Fresh page per Run:** learner DOM and the prior bundled stylesheet are replaced before current JS executes.
- **Browser APIs and console:** `root`, `document`, and `window` are available; logs, warnings, errors, and rejected promises appear below the output.

## Output UI
- **Visual:** body children from `index.html` render under the sandbox's `#root` and linked CSS is installed in the sandbox document.
- **Console:** visible below the page.
- **Execution:** manual only. Editing any tab has no output side effect until Run.

## Limitations
- HTML-authored scripts never execute. Inline, remote, module, data-URL, and differently named scripts are removed; bundled `script.js` is the only JS path.
- Parsed stylesheet links are removed after detecting the exact `style.css` marker, so remote stylesheets do not load in this mode. Inline `<style>` elements may still apply.
- Only body content is restored. Head metadata, title, body attributes, and parser timing are not reproduced.
- Native JavaScript only: no TypeScript, Babel, JSX, modules, imports, packages, CDNs, or additional files.
- Tabs cannot be added, removed, renamed, or moved into folders.
- Runs replace learner nodes and bundled CSS, but timers or listeners attached directly to `window` or `document` are not automatically disposed.

## Code format (for tools and LLMs)
The public code value remains one version-1 JSON envelope:

```json
{"__csFiles__":1,"files":{"index.html":"<link rel=\"stylesheet\" href=\"style.css\"><button id=\"go\">Go</button><script src=\"script.js\"></script>","style.css":"button { color: indigo; }","script.js":"document.getElementById('go').addEventListener('click', () => console.log('Go'));"}}
```

A plain non-envelope string becomes `index.html` with empty CSS and JS.

## LLM Usage Hints
- Use for exercises combining semantic markup, selectors/layout, and event-driven DOM behavior.
- Always include both exact markers when both companion files have content.
- Keep executable code in `script.js`; do not suggest inline scripts, imports, packages, or alternate filenames.
- Remind learners that output updates only after Run.

## Example Code

index.html:

```html
<link rel="stylesheet" href="style.css">
<h1 id="message">Waiting</h1>
<button id="go" type="button">Go</button>
<script src="script.js"></script>
```

style.css:

```css
body { font-family: sans-serif; background: lavender; }
button { padding: 0.75rem 1rem; color: white; background: indigo; }
```

script.js:

```javascript
const message = document.getElementById('message');
document.getElementById('go').addEventListener('click', () => {
  message.textContent = 'All three files are connected!';
  console.log('Interaction complete');
});
```
