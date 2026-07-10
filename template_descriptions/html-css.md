# Environment: HTML / CSS
**ID:** `html-css`

## Overview
Two-tab HTML and CSS preview for beginner-friendly markup lessons.

## Fake Files
- `index.html`: Semantic markup.
- `styles.css`: Styles applied to the preview.

## Features
- **Engine:** Browser HTML parser.
- **Editor Languages:** HTML and CSS.
- **Output:** Combines the two fake files and renders them inside the sandbox preview iframe.
- **Console:** Hidden by default because this mode does not execute student JavaScript.

## JavaScript Policy
- User JavaScript is not executed in this mode.
- `<script>` tags are removed before rendering.
- Inline JavaScript hooks such as `onclick` and `javascript:` URLs are stripped.

## LLM Usage Hints
- Use for direct HTML/CSS lessons where students should write markup and styles instead of `root.innerHTML`.
- Prefer semantic elements such as `<main>`, `<section>`, `<figure>`, and `<figcaption>`.
- Put structure in `index.html` and presentation in `styles.css`.

## Example `index.html`
```html
<main class="gallery-card">
  <figure>
    <img src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80" alt="A laptop on a desk">
    <figcaption>Workspace photo</figcaption>
  </figure>
</main>
```

## Example `styles.css`
```css
.gallery-card {
  max-width: 560px;
  margin: 0 auto;
}

img {
  width: 100%;
  height: 180px;
  object-fit: cover;
}
```
