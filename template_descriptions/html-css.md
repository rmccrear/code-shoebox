# Environment: HTML & CSS (style.css)
**ID:** `html-css`

## Overview
A two-file web page: the editor shows an **index.html** tab and a **style.css** tab. The page renders live, and the stylesheet applies when the HTML links it with `<link rel="stylesheet" href="style.css">` — exactly how real websites connect markup to styles. This is the next step after the single-file `html` mode: same page-building, plus file separation and the `<link>` tag.

## Features
- **Two tabs:** `index.html` and `style.css` (fixed names; exactly one CSS file). Each tab keeps its own undo history.
- **Real link semantics:** styles apply only when the `<link>` tag is present. If `style.css` has content but isn't linked, a blue hint banner shows the exact line to add.
- **Live Preview:** the page updates about half a second after you stop typing, in either tab. The Run button forces an immediate re-render.
- **Everything from the `html` mode:** full documents, `<style>` blocks and inline styles still work, absolute-URL stylesheets/fonts/images load.

## Output UI
- **Visual:** the rendered page fills the output panel on a plain white canvas, unaffected by the app's dark/light theme.
- **Console:** none — this mode has no console panel.

## Limitations
- **No JavaScript:** `<script>` tags never execute (blocked by the browser sandbox); an amber banner points to the DOM mode.
- **Only `style.css` resolves:** a relative href like `main.css` loads nothing. Use the one provided filename.
- **No extra files:** tabs can't be added, removed, or renamed.
- **Links navigate away:** clicking a link loads that page in the output frame; press Run (or keep typing) to get your page back.

## Code format (for tools and LLMs)
The mode's code string is a JSON envelope holding both files:

```json
{"__csFiles__":1,"files":{"index.html":"<!DOCTYPE html>…","style.css":"body { … }"}}
```

A plain (non-envelope) string is treated as a bare `index.html` with an empty `style.css`.

## LLM Usage Hints
- Use for teaching the `<link>` tag, external stylesheets, selectors, and the idea that one CSS file styles a whole page.
- Always include `<link rel="stylesheet" href="style.css">` in the `<head>` of examples.
- Never suggest a second CSS file, a different filename, or `<script>`/JavaScript.
- When generating preset code for this mode, emit the JSON envelope above (or build it with `serializeFileBundle` from `runtime/fileBundle.ts`).

## Example Code
index.html:
```html
<!DOCTYPE html>
<html>
<head>
  <title>My Page</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <h1 class="title">Styled from another file</h1>
</body>
</html>
```

style.css:
```css
.title {
  color: #0ea5e9;
  font-family: sans-serif;
  border-bottom: 3px solid #0ea5e9;
}
```
