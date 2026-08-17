# Environment: HTML, CSS, JavaScript & Media (4 tabs)
**ID:** `html-js-css-media`

## Overview
A complete three-file web page plus a read-only shelf of lesson media. Learners edit **index.html**, **style.css**, and **script.js**, open **Media** to preview up to three host-supplied assets, paste a shown snippet, and press Run.

## Features
- **Four top-level tabs:** three editable code files followed by read-only `Media`.
- **Up to three media sub-tabs:** image, audio, or video in any combination.
- **Native previews:** images include host-authored alt text; audio and video use browser controls and never autoplay.
- **Usage snippets:** images provide HTML and CSS; audio/video provide HTML and JavaScript playback examples.
- **Same page runtime:** CSS and JavaScript still require the exact `style.css` and `script.js` markers, resolve independently, and run manually with console output.

## Host API

```ts
type MediaAsset =
  | { kind: 'image'; name: string; src: string; alt: string }
  | { kind: 'audio'; name: string; src: string }
  | { kind: 'video'; name: string; src: string };
```

Pass descriptors through `CodeShoebox`'s optional `mediaAssets` prop. The first three are displayed. Assets are host state: they are not editable, uploaded, persisted, serialized with code, or sent to the iframe.

## Snippet matrix
- Image HTML: `<img src="…" alt="…">`
- Image CSS: `.media-image { background-image: url("…"); }`
- Audio HTML: `<audio controls src="…"></audio>`
- Audio JavaScript: construct `new Audio(…)`, then call `play()`
- Video HTML: `<video id="media-video" controls src="…"></video>`
- Video JavaScript: select `#media-video` and call `play()`

Host values are escaped for HTML attributes, CSS strings, or JavaScript string literals. Snippets are displayed as plain text and do nothing until a learner pastes them into a code tab.

## Output UI
- **Visual:** the learner's linked three-file page in the sandbox.
- **Console:** visible below the page.
- **Execution:** manual only; Media preview controls are independent of Run.

## Limitations
- No uploads, recording, editing, deletion, renaming, folders, media persistence, proxying, transcoding, custom players, posters, captions, playlists, or autoplay.
- Media URLs must be reachable by the browser. MP3/WAV, image, and video codec support varies.
- Absolute HTTPS or data URLs are the most portable. Relative paths resolve against the host page.
- External media may display/play while cross-origin Canvas or Web Audio reads remain restricted by CORS.
- Media is not automatically inserted into the output; paste a snippet into the appropriate code file.
- The three-file runtime retains the `html-css-js` limitations: native JavaScript only, parsed resource-node suppression, body-only restoration, and global listener/timer cleanup caveats.

## LLM Usage Hints
- Use this mode when the lesson supplies specific assets learners should incorporate rather than edit.
- Tell learners which Media asset and snippet language to choose.
- Keep `mediaAssets` in host component code, never inside the learner's serialized `code` value.
- Keep executable learner code in `script.js` and both exact local link markers in `index.html`.
