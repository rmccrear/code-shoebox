import { EnvironmentMode } from './types';

export interface EditorDemoPreset {
  id: string;
  mode: EnvironmentMode;
  code: string;
  aliases?: string[];
}

export const EDITOR_DEMO_PRESETS: EditorDemoPreset[] = [
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
