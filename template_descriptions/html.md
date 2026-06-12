# Environment: HTML (single file)
**ID:** `html`

## Overview
A real web page environment: write HTML and CSS in one document and watch it render live, exactly as a browser would display a saved `.html` file. No JavaScript — this is the place to learn tags, selectors, the box model, and layout.

## Features
- **Engine:** The editor content is rendered verbatim inside a fully sandboxed nested iframe (`sandbox=""`).
- **Live Preview:** The page updates about half a second after you stop typing. The Run button forces an immediate re-render.
- **Full Documents:** `<!DOCTYPE html>`, `<head>`, `<title>`, `<meta>`, and attributes on `<body>` all work. Bare fragments (just tags, no skeleton) render too.
- **Styles:** `<style>` blocks, inline `style=""` attributes, and external `<link rel="stylesheet">` (e.g. Google Fonts) all apply.
- **Images:** `<img>` with web URLs works.

## Output UI
- **Visual:** The rendered page fills the output panel on a plain white canvas, unaffected by the app's dark/light theme.
- **Console:** None — this mode has no console panel.

## Limitations
- **No JavaScript:** `<script>` tags never execute (blocked by the browser sandbox). A banner above the page says so and points to the DOM mode.
- **Links navigate away:** Clicking a link loads that page inside the output frame; press Run (or keep typing) to get your page back.
- **No forms submission, no popups:** the sandbox blocks them.

## LLM Usage Hints
- Use for teaching HTML structure, semantic tags, CSS selectors, specificity, the box model, flexbox, and grid.
- Always show complete documents (`<!DOCTYPE html>` through `</html>`) to reinforce page structure.
- Do not suggest `<script>` tags or JavaScript of any kind — direct learners to the `dom` mode for that.
- Inline event handlers (`onclick="..."`) will not run either.

## Example Code
```html
<!DOCTYPE html>
<html>
<head>
  <title>Box Model Demo</title>
  <style>
    .box {
      width: 160px;
      padding: 16px;
      border: 4px solid #6366f1;
      margin: 24px;
      background: #eef2ff;
      font-family: sans-serif;
    }
  </style>
</head>
<body>
  <div class="box">Content + padding + border + margin</div>
</body>
</html>
```
