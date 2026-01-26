import React from 'react';
import { Palette, Server, Box, Code2, Cpu, Save, Sparkles, Zap, Brain, RotateCcw } from 'lucide-react';
import { CodeShoebox } from './components/CodeShoebox';
import { Button } from './components/Button';
import { themes, Theme } from './theme';
import { useSandboxState } from './hooks/useSandboxState';

const P5_DEMO_CODE = `function setup() {
  createCanvas(400, 400);
  angleMode(DEGREES);
  colorMode(HSB);
  background(0);
}

function draw() {
  background(0, 10); 
  translate(width / 2, height / 2);
  noFill();
  let t = frameCount;
  for (let i = 0; i < 6; i++) {
    push();
    rotate(i * 60 + t * 0.5);
    stroke((t + i * 30) % 360, 90, 100);
    strokeWeight(2);
    let d = 100 + sin(t * 2) * 50;
    let r = 20 + cos(t * 3) * 10;
    triangle(d, 0, d - 20, 20, d - 20, -20);
    ellipse(d/2, 0, d, r * 2);
    pop();
  }
  noStroke();
  fill((t * 2) % 360, 80, 100);
  circle(0, 0, 10 + 10 * sin(t * 5));
}`;

const P5_TS_DEMO_CODE = `/**
 * Typed Creative Coding
 */
interface ParticleNode {
  pos: { x: number; y: number };
  vel: { x: number; y: number };
}

const nodes: ParticleNode[] = [];

(window as any).setup = () => {
  createCanvas(400, 400);
  for(let i=0; i<30; i++) {
    nodes.push({
      pos: { x: random(width), y: random(height) },
      vel: { x: random(-1, 1), y: random(-1, 1) }
    });
  }
};

(window as any).draw = () => {
  background(255);
  stroke(0, 50);
  
  nodes.forEach(n => {
    n.pos.x += n.vel.x;
    n.pos.y += n.vel.y;
    
    if(n.pos.x < 0 || n.pos.x > width) n.vel.x *= -1;
    if(n.pos.y < 0 || n.pos.y > height) n.vel.y *= -1;
    
    circle(n.pos.x, n.pos.y, 4);
    
    // Connect nodes
    nodes.forEach(other => {
      let d = dist(n.pos.x, n.pos.y, other.pos.x, other.pos.y);
      if(d < 60) line(n.pos.x, n.pos.y, other.pos.x, other.pos.y);
    });
  });
};`;

const EXPRESS_DEMO_CODE = `const app = express();
const port = 3000;

const inventory = [
  { id: 1, item: "Space Suit", price: 500 },
  { id: 2, item: "Oxygen Tank", price: 150 }
];

// Root route to guide the user
app.get('/', (req, res) => {
  res.json({
    message: "Welcome to the Shop API!",
    endpoints: [
      "/api/inventory"
    ]
  });
});

app.get('/api/inventory', (req, res) => res.json(inventory));

app.listen(port, () => console.log('Ready'));`;

const EXPRESS_PREDICTION_CODE = `const app = express();

app.get('/secure', (req, res) => {
  const apiKey = req.query.key;
  
  // 1. Check if key exists
  if (!apiKey) {
    return res.status(400).json({ error: "Missing API Key" });
  }
  
  // 2. Validate key
  if (apiKey !== "12345") {
    return res.status(403).json({ error: "Invalid Credentials" });
  }
  
  res.json({ data: "Top Secret Info" });
});

app.listen(3000, () => console.log('Security Server Ready'));`;

const HONO_DEMO_CODE = `/**
 * Hono API - Modern & Standard-compliant
 */
const app = new Hono();

app.get('/', (c) => {
  return c.text('Hono running on Web Standards!');
});

app.get('/api/stats', (c) => {
  return c.json({
    engine: "Hono",
    version: "4.x",
    environment: "CodeShoebox"
  });
});

app.get('/hello/:name', (c) => {
  const name = c.req.param('name');
  return c.json({ message: \`Hello, \${name}!\` });
});

// Use modern ESM syntax
export default app;`;

const NODE_JS_DEMO_CODE = `/**
 * Logic & Algorithms: The Reducer Pattern
 */
const trackMeets = [
  { event: "Invitational", miles: 3.1, pacePerMile: 6.45 },
  { event: "Championship", miles: 3.1, pacePerMile: 7.10 },
  { event: "State Meet", miles: 3.1, pacePerMile: 6.50 },
  { event: "Speed Workout", miles: 4.0, pacePerMile: 6.58 }
];
console.log("Analyzing Track Data...");
const eliteMiles = trackMeets.reduce((total, meet) => {
  if (meet.pacePerMile < 7.0) {
    console.log(\`✅ Included: \${meet.event}\`);
    return total + meet.miles;
  }
  return total;
}, 0);
console.log(\`Total Elite Miles: \${eliteMiles.toFixed(1)}\`);`;

const NODE_TS_DEMO_CODE = `/**
 * Typed Logic (TS)
 */
interface Task { id: number; title: string; }
class TodoList {
  private tasks: Task[] = [];
  addTask(title: string) {
    this.tasks.push({ id: this.tasks.length + 1, title });
    console.log(\`Added: \${title}\`);
  }
  show() { console.table(this.tasks); }
}
const list = new TodoList();
list.addTask("Fix isolated console");
list.addTask("Add demos");
list.show();`;

const PERSISTENCE_DEMO_CODE = `// Persistence Demo
const message = "Change me and reload the page!";
console.log("Persistence Status:", message);`;

export const Demo: React.FC = () => {
    // Giving each demo a unique key prevents state collision in localStorage
    // using '_v2' effectively resets the "legacy" data that was causing issues.
    const p5State = useSandboxState('demo_p5_v2', P5_DEMO_CODE, 'p5'); 
    const p5TsState = useSandboxState('demo_p5_ts_v2', P5_TS_DEMO_CODE, 'p5-ts');
    const expressState = useSandboxState('demo_express_legacy_v2', EXPRESS_DEMO_CODE, 'express');
    const expressPredictionState = useSandboxState('demo_express_prediction_v2', EXPRESS_PREDICTION_CODE, 'express');
    const honoState = useSandboxState('demo_hono_v2', HONO_DEMO_CODE, 'hono');
    const nodeJsState = useSandboxState('demo_node_js_v2', NODE_JS_DEMO_CODE, 'node-js');
    const nodeTsState = useSandboxState('demo_node_ts_v2', NODE_TS_DEMO_CODE, 'node-ts');
    const persistenceState = useSandboxState('demo_persistence_v2', PERSISTENCE_DEMO_CODE, 'dom');

    const handleResetAll = () => {
        if (window.confirm("Reset all demos to their original state? This will erase your changes.")) {
            p5State.resetCode();
            p5TsState.resetCode();
            expressState.resetCode();
            expressPredictionState.resetCode();
            honoState.resetCode();
            nodeJsState.resetCode();
            nodeTsState.resetCode();
            persistenceState.resetCode();
        }
    };

    return (
        <div className="h-full w-full overflow-y-auto bg-gray-50 dark:bg-[#121212] transition-colors duration-300 pb-20">
            <div className="max-w-5xl mx-auto py-12 px-6 space-y-20">
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-200 dark:border-white/10 pb-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">Cookbook Demos</h1>
                        <p className="text-lg opacity-70 dark:text-gray-300">Isolated sandboxes for various educational needs.</p>
                    </div>
                    <Button onClick={handleResetAll} variant="secondary" className="text-xs whitespace-nowrap" icon={<RotateCcw className="w-4 h-4"/>}>
                        Reset Persistence
                    </Button>
                </header>

                <section>
                    <div className="mb-6"><h2 className="text-2xl font-semibold flex items-center gap-2"><Save className="w-6 h-6 text-indigo-500" /> Persistence</h2></div>
                    <div className="h-[400px] border rounded-xl overflow-hidden shadow-xl dark:border-white/10">
                        <CodeShoebox code={persistenceState.code} onCodeChange={persistenceState.setCode} environmentMode={persistenceState.environmentMode} theme={themes[0]} themeMode="dark" sessionId={persistenceState.sessionId} />
                    </div>
                </section>

                <section>
                    <div className="mb-6"><h2 className="text-2xl font-semibold flex items-center gap-2"><Palette className="w-6 h-6 text-pink-500" /> Creative Coding</h2></div>
                    <div className="h-[500px] border rounded-xl overflow-hidden shadow-xl dark:border-white/10">
                        <CodeShoebox code={p5State.code} onCodeChange={p5State.setCode} environmentMode={p5State.environmentMode} theme={themes[2]} themeMode="dark" sessionId={p5State.sessionId} />
                    </div>
                </section>

                <section>
                    <div className="mb-6"><h2 className="text-2xl font-semibold flex items-center gap-2"><Sparkles className="w-6 h-6 text-yellow-400" /> Typed Graphics (p5.js + TS)</h2></div>
                    <div className="h-[500px] border rounded-xl overflow-hidden shadow-xl dark:border-white/10">
                        <CodeShoebox code={p5TsState.code} onCodeChange={p5TsState.setCode} environmentMode={p5TsState.environmentMode} theme={themes[2]} themeMode="dark" sessionId={p5TsState.sessionId} />
                    </div>
                </section>

                <section>
                    <div className="mb-6"><h2 className="text-2xl font-semibold flex items-center gap-2"><Zap className="w-6 h-6 text-yellow-500" /> Modern API (Hono)</h2></div>
                    <div className="h-[500px] border rounded-xl overflow-hidden shadow-xl dark:border-white/10">
                        <CodeShoebox code={honoState.code} onCodeChange={honoState.setCode} environmentMode={honoState.environmentMode} theme={themes[1]} themeMode="dark" sessionId={honoState.sessionId} />
                    </div>
                </section>

                <section>
                    <div className="mb-6"><h2 className="text-2xl font-semibold flex items-center gap-2"><Cpu className="w-6 h-6 text-yellow-500" /> Logic (Headless JS)</h2></div>
                    <div className="h-[400px] border rounded-xl overflow-hidden shadow-xl dark:border-white/10">
                        <CodeShoebox code={nodeJsState.code} onCodeChange={nodeJsState.setCode} environmentMode={nodeJsState.environmentMode} theme={themes[0]} themeMode="dark" sessionId={nodeJsState.sessionId} />
                    </div>
                </section>

                <section>
                    <div className="mb-6"><h2 className="text-2xl font-semibold flex items-center gap-2"><Code2 className="w-6 h-6 text-teal-500" /> Logic (Headless TS)</h2></div>
                    <div className="h-[400px] border rounded-xl overflow-hidden shadow-xl dark:border-white/10">
                        <CodeShoebox code={nodeTsState.code} onCodeChange={nodeTsState.setCode} environmentMode={nodeTsState.environmentMode} theme={themes[2]} themeMode="dark" sessionId={nodeTsState.sessionId} />
                    </div>
                </section>

                <section>
                    <div className="mb-6"><h2 className="text-2xl font-semibold flex items-center gap-2"><Brain className="w-6 h-6 text-purple-500" /> Prediction Challenge</h2></div>
                    <div className="h-[500px] border rounded-xl overflow-hidden shadow-xl dark:border-white/10">
                        <CodeShoebox 
                            code={expressPredictionState.code} 
                            onCodeChange={expressPredictionState.setCode} 
                            environmentMode="express" 
                            theme={themes[1]} 
                            themeMode="dark" 
                            sessionId={expressPredictionState.sessionId}
                            prediction_prompt={
                                <div>
                                    <p className="font-bold mb-2">Analyze the security logic:</p>
                                    <p>If you request <code className="bg-black/20 px-1 rounded">/secure?key=abc</code>, what HTTP status code and error message will be returned?</p>
                                </div>
                            }
                        />
                    </div>
                </section>

                <section>
                    <div className="mb-6"><h2 className="text-2xl font-semibold flex items-center gap-2"><Server className="w-6 h-6 text-orange-500" /> Legacy API (Express)</h2></div>
                    <div className="h-[500px] border rounded-xl overflow-hidden shadow-xl dark:border-white/10">
                        <CodeShoebox code={expressState.code} onCodeChange={expressState.setCode} environmentMode={expressState.environmentMode} theme={themes[1]} themeMode="dark" sessionId={expressState.sessionId} />
                    </div>
                </section>
            </div>
        </div>
    );
}