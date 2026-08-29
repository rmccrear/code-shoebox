import { EnvironmentMode, MediaAsset, MockApiConfig } from './types';
import { serializeFileBundle } from './runtime/fileBundle';

export const HTML_JS_CSS_MEDIA_DEMO_ASSETS = [
  {
    kind: 'image',
    name: 'Grapefruit slice',
    src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-images/grapefruit-slice-332-332.jpg',
    alt: 'A grapefruit slice on a blue background',
  },
  {
    kind: 'audio',
    name: 'T-Rex roar',
    src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3',
  },
  {
    kind: 'video',
    name: 'Flower video',
    src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
  },
] as const satisfies readonly MediaAsset[];

export const FETCH_DEMO_API = {
  defaultDelayMs: 1000,
  routes: [
    {
      method: 'GET',
      path: '/api/air-quality',
      body: [
        { city: 'Portland', aqi: 38, category: 'Good' },
        { city: 'Sacramento', aqi: 52, category: 'Moderate' },
        { city: 'Boise', aqi: 44, category: 'Good' },
        { city: 'Reno', aqi: 61, category: 'Moderate' },
      ],
    },
    {
      method: 'GET',
      path: '/api/air-quality',
      query: { limit: '1' },
      body: [{ city: 'Portland', aqi: 38, category: 'Good' }],
    },
    {
      method: 'GET',
      path: '/api/air-quality',
      query: { limit: '4' },
      body: [
        { city: 'Portland', aqi: 38, category: 'Good' },
        { city: 'Sacramento', aqi: 52, category: 'Moderate' },
        { city: 'Boise', aqi: 44, category: 'Good' },
        { city: 'Reno', aqi: 61, category: 'Moderate' },
      ],
    },
    {
      method: 'POST',
      path: '/api/alerts',
      status: 201,
      body: { id: 1, message: 'Air-quality alert created' },
    },
    {
      method: 'GET',
      path: '/api/offline',
      networkError: true,
      errorMessage: 'The mock API is offline',
    },
  ],
} as const satisfies MockApiConfig;

export interface EditorDemoPreset {
  id: string;
  mode: EnvironmentMode;
  code: string;
  mediaAssets?: readonly MediaAsset[];
  mockApi?: MockApiConfig;
  aliases?: string[];
}

export const EDITOR_DEMO_PRESETS: EditorDemoPreset[] = [
  {
    id: 'html-css-demo',
    mode: 'html',
    code: `<!DOCTYPE html>
<html>
<head>
  <title>Flexbox Cards</title>
  <style>
    body { font-family: sans-serif; margin: 1.5rem; background: #f8fafc; }
    .row { display: flex; gap: 1rem; }
    .card {
      flex: 1;
      padding: 1rem;
      border-radius: 10px;
      background: white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      border-top: 4px solid #6366f1;
    }
    .card h2 { margin: 0 0 0.4rem; font-size: 1rem; }
    .card p { margin: 0; font-size: 0.85rem; color: #475569; }
  </style>
</head>
<body>
  <h1>My Flexbox Gallery</h1>
  <div class="row">
    <div class="card"><h2>HTML</h2><p>Structure the page.</p></div>
    <div class="card"><h2>CSS</h2><p>Style every element.</p></div>
    <div class="card"><h2>Flexbox</h2><p>Lay out the cards.</p></div>
  </div>
</body>
</html>`
  },
  {
    id: 'html-css-tabs-demo',
    mode: 'html-css',
    code: serializeFileBundle({
      'index.html': `<!DOCTYPE html>
<html>
<head>
  <title>Linked Styles</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <h1>Two tabs, one page</h1>
  <ul class="checklist">
    <li>Markup lives in index.html</li>
    <li>Styles live in style.css</li>
    <li>The link tag connects them</li>
  </ul>
</body>
</html>`,
      'style.css': `body {
  font-family: sans-serif;
  margin: 2rem;
  background: #f8fafc;
}

h1 { color: #0ea5e9; }

.checklist {
  list-style: none;
  padding: 0;
}

.checklist li {
  padding: 0.5rem 0.75rem;
  margin-bottom: 0.5rem;
  background: white;
  border-left: 4px solid #0ea5e9;
  border-radius: 4px;
}`
    })
  },
  {
    id: 'html-js-tabs-demo',
    mode: 'html-js',
    code: serializeFileBundle({
      'index.html': `<!DOCTYPE html>
<html>
<head><title>Interactive Greeting</title></head>
<body>
  <h1 id="greeting">Ready to say hello?</h1>
  <button id="greet" type="button">Greet me</button>
  <script src="script.js"></script>
</body>
</html>`,
      'script.js': `const greeting = document.getElementById('greeting');
const button = document.getElementById('greet');

button.addEventListener('click', () => {
  greeting.textContent = 'Hello from script.js!';
  console.log('Greeting updated');
});`
    })
  },
  {
    id: 'html-css-js-tabs-demo',
    mode: 'html-css-js',
    code: serializeFileBundle({
      'index.html': `<!DOCTYPE html>
<html>
<head>
  <title>Launch Checklist</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <main class="launch-card">
    <p class="eyebrow">Three-file mission</p>
    <h1>Launch checklist</h1>
    <p id="launch-status">Systems are standing by.</p>
    <button id="launch" type="button">Run launch check</button>
  </main>
  <script src="script.js"></script>
</body>
</html>`,
      'style.css': `body {
  margin: 0;
  padding: 2rem;
  background: #ecfeff;
  font-family: ui-sans-serif, system-ui, sans-serif;
  color: #164e63;
}

.launch-card {
  max-width: 26rem;
  padding: 1.5rem;
  border: 1px solid #67e8f9;
  border-radius: 1rem;
  background: white;
  box-shadow: 0 16px 40px rgba(8, 145, 178, 0.16);
}

.eyebrow { color: #0891b2; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; }
button { border: 0; border-radius: 999px; padding: 0.75rem 1rem; background: #0891b2; color: white; font-weight: 700; }`,
      'script.js': `const button = document.getElementById('launch');
const status = document.getElementById('launch-status');

button.addEventListener('click', () => {
  status.textContent = 'All systems go!';
  console.log('Launch check complete');
});`
    })
  },
  {
    id: 'html-js-css-media-tabs-demo',
    mode: 'html-js-css-media',
    mediaAssets: HTML_JS_CSS_MEDIA_DEMO_ASSETS,
    code: serializeFileBundle({
      'index.html': `<!DOCTYPE html>
<html>
<head>
  <title>Media Field Guide</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <main class="field-guide">
    <p class="eyebrow">Four-tab field guide</p>
    <h1>Grapefruit in bloom</h1>
    <img class="feature-image" src="${HTML_JS_CSS_MEDIA_DEMO_ASSETS[0].src}" alt="${HTML_JS_CSS_MEDIA_DEMO_ASSETS[0].alt}">
    <video id="media-video" controls src="${HTML_JS_CSS_MEDIA_DEMO_ASSETS[2].src}"></video>
    <button id="play-sound" type="button">Play the roar</button>
    <p id="media-status">Choose an asset in the Media tab to see its snippets.</p>
  </main>
  <script src="script.js"></script>
</body>
</html>`,
      'style.css': `body {
  margin: 0;
  padding: 2rem;
  background: #fff7ed;
  font-family: ui-sans-serif, system-ui, sans-serif;
  color: #7c2d12;
}

.field-guide {
  max-width: 34rem;
  padding: 1.5rem;
  border: 1px solid #fdba74;
  border-radius: 1.25rem;
  background: linear-gradient(rgba(255,255,255,.92), rgba(255,255,255,.92)), url("${HTML_JS_CSS_MEDIA_DEMO_ASSETS[0].src}") center / cover;
  box-shadow: 0 18px 44px rgba(154, 52, 18, 0.16);
}

.eyebrow { color: #ea580c; font-weight: 800; text-transform: uppercase; letter-spacing: .12em; }
.feature-image, video { display: block; width: 100%; max-height: 15rem; margin: 1rem 0; border-radius: .8rem; object-fit: cover; }
button { border: 0; border-radius: 999px; padding: .75rem 1rem; background: #ea580c; color: white; font-weight: 700; cursor: pointer; }`,
      'script.js': `const playButton = document.getElementById('play-sound');
const status = document.getElementById('media-status');
const roar = new Audio(${JSON.stringify(HTML_JS_CSS_MEDIA_DEMO_ASSETS[1].src)});

playButton.addEventListener('click', async () => {
  try {
    await roar.play();
    status.textContent = 'Playing the audio asset from JavaScript.';
    console.log('Media playback started');
  } catch (error) {
    status.textContent = 'Your browser blocked playback. Click again to retry.';
    console.error(error);
  }
});`
    })
  },
  {
    id: 'fetch-air-quality-demo',
    mode: 'fetch',
    mockApi: FETCH_DEMO_API,
    code: `let response = await fetch("/api/air-quality?limit=4");
let readings = await response.json();
console.log("The first city is " + readings[0].city);
console.log(readings);`
  },
  {
    id: 'html-js-fetch-air-quality-demo',
    mode: 'html-js-fetch',
    mockApi: FETCH_DEMO_API,
    code: serializeFileBundle({
      'index.html': `<!DOCTYPE html>
<html>
<head><title>Air Quality Dashboard</title></head>
<body>
  <main>
    <h1>Air quality dashboard</h1>
    <p id="status">Waiting for the API...</p>
    <ul id="readings"></ul>
  </main>
  <script src="script.js"></script>
</body>
</html>`,
      'script.js': `let response = await fetch("/api/air-quality?limit=4");
let readings = await response.json();
let list = document.getElementById("readings");

document.getElementById("status").textContent = "Loaded " + readings.length + " readings.";
readings.forEach(function (reading) {
  let item = document.createElement("li");
  item.textContent = reading.city + ": AQI " + reading.aqi + " (" + reading.category + ")";
  list.appendChild(item);
});

console.log(readings);`
    })
  },
  {
    id: 'ts-express-rest-demo',
    mode: 'express-ts',
    aliases: ['express-rest-demo'],
    code: `import type { Request, Response } from 'express';
const app = express();
const inventory = [
  { id: 1, item: "Space Suit", price: 500 },
  { id: 2, item: "Oxygen Tank", price: 150 }
];
app.get('/', (_req: Request, res: Response) => {
  res.json({ message: "Welcome to the Shop API!", endpoints: ["/api/inventory"] });
});
app.get('/api/inventory', (_req: Request, res: Response) => res.json(inventory));
app.listen(3000, () => console.log('Ready'));`
  },
  {
    id: 'hono-api-demo',
    mode: 'hono',
    code: `const app = new Hono();
app.get('/', (c) => c.text('Hono running on Web Standards!'));
app.get('/api/stats', (c) => c.json({ engine: "Hono", version: "4.x", environment: "CodeShoebox" }));
export default app;`
  },
  {
    id: 'hono-ts-api-demo',
    mode: 'hono-ts',
    code: `import { Hono } from 'hono';
type ApiResponse = { engine: string; mode: string; status: string };
const app = new Hono();
app.get('/', (c) => c.text('Hono TS running'));
app.get('/api/stats', (c) => c.json<ApiResponse>({ engine: "Hono", mode: "TypeScript", status: "ok" }));
export default app;`
  },
  {
    id: 'p5-ts-demo',
    mode: 'p5-ts',
    code: `(window as any).setup = () => {
  createCanvas(400, 250);
};
(window as any).draw = () => {
  background(12);
  fill(0, 200, 255);
  circle(mouseX, mouseY, 28);
};`
  },
  {
    id: 'ts-logic-demo',
    mode: 'node-ts',
    code: `interface Task { id: number; title: string; }
const tasks: Task[] = [{ id: 1, title: "Ship hash presets" }];
console.table(tasks);`
  },
  {
    id: 'p5play-demo',
    mode: 'p5play',
    code: `// p5.play sprites, Game Lab style: top-level code, no setup() needed
var ball = createSprite(50, 200, 30, 30);
ball.shapeColor = color(0, 200, 255);
ball.velocityX = 3;

function draw() {
  background(12);
  if (ball.x > 425) {
    ball.x = -25; // wrap around
  }
  if (keyDown("space")) {
    ball.rotation = ball.rotation + 5;
  }
  drawSprites();
}`
  }
];

const PRESET_BY_ID = new Map(EDITOR_DEMO_PRESETS.map((preset) => [preset.id, preset]));
const PRESET_BY_MODE = new Map(EDITOR_DEMO_PRESETS.map((preset) => [preset.mode, preset]));
const ALIAS_TO_ID = new Map(
  EDITOR_DEMO_PRESETS.flatMap((preset) => (preset.aliases || []).map((alias) => [alias, preset.id] as const))
);

export const resolvePresetFromHash = (rawHash: string): EditorDemoPreset | undefined => {
  const decoded = decodeURIComponent(rawHash.replace(/^#/, ''));
  if (!decoded) return undefined;
  const id = ALIAS_TO_ID.get(decoded) || decoded;
  return PRESET_BY_ID.get(id);
};

export const getPresetHashForMode = (mode: EnvironmentMode): string | undefined => {
  return PRESET_BY_MODE.get(mode)?.id;
};

export const getPresetMediaAssetsForMode = (mode: EnvironmentMode): readonly MediaAsset[] | undefined => {
  return PRESET_BY_MODE.get(mode)?.mediaAssets;
};

export const getPresetMockApiForMode = (mode: EnvironmentMode): MockApiConfig | undefined => {
  return PRESET_BY_MODE.get(mode)?.mockApi;
};
