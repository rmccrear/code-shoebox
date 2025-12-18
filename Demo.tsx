
import React from 'react';
import { Palette, Server, Box, Code2, Cpu, Save } from 'lucide-react';
import { CodeShoebox } from './components/CodeShoebox';
import { themes, Theme } from './theme';
import { useSandboxState } from './hooks/useSandboxState';

const matrixTheme: Theme = {
  name: "Matrix",
  light: { 
     primary: "120 100% 25%", 
     primaryForeground: "0 0% 100%", 
     ring: "120 100% 25%", 
     sidebarPrimary: "120 100% 25%",
     sidebarPrimaryForeground: "0 0% 100%", 
     sidebarRing: "120 100% 25%",
     background: "0 0% 95%", 
     foreground: "120 100% 15%"
  },
  dark: {
    primary: "120 100% 50%", 
    primaryForeground: "0 0% 0%",
    ring: "120 100% 50%",
    sidebarPrimary: "120 100% 50%",
    sidebarPrimaryForeground: "0 0% 0%", 
    sidebarRing: "120 100% 50%",
    background: "0 0% 0%", 
    foreground: "120 100% 50%",
    card: "0 0% 5%",
    muted: "120 50% 10%"
  }
};

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

const EXPRESS_DEMO_CODE = `const app = express();
const port = 3000;
const inventory = [
  { id: 1, item: "Space Suit", price: 500 },
  { id: 2, item: "Oxygen Tank", price: 150 }
];
app.get('/api/inventory', (req, res) => res.json(inventory));
app.listen(port, () => console.log('Ready'));`;

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
    const p5State = useSandboxState(); 
    const expressState = useSandboxState();
    const nodeJsState = useSandboxState();
    const nodeTsState = useSandboxState();
    const matrixState = useSandboxState();
    const persistenceState = useSandboxState('demo_persistence');

    const quizCode = "const secret = 42;\nconsole.log('The secret is: ' + secret);";
    
    return (
        <div className="h-full w-full overflow-y-auto bg-gray-50 dark:bg-[#121212] transition-colors duration-300 pb-20">
            <div className="max-w-5xl mx-auto py-12 px-6 space-y-20">
                <header>
                    <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">Cookbook Demos</h1>
                    <p className="text-lg opacity-70 dark:text-gray-300">Isolated sandboxes for various educational needs.</p>
                </header>

                <section>
                    <div className="mb-6"><h2 className="text-2xl font-semibold flex items-center gap-2"><Save className="w-6 h-6 text-indigo-500" /> Persistence</h2></div>
                    <div className="h-[400px] border rounded-xl overflow-hidden shadow-xl dark:border-white/10">
                        <CodeShoebox code={persistenceState.code.includes('Persistence Demo') ? persistenceState.code : PERSISTENCE_DEMO_CODE} onCodeChange={persistenceState.setCode} environmentMode="dom" theme={themes[0]} themeMode="dark" />
                    </div>
                </section>

                <section>
                    <div className="mb-6"><h2 className="text-2xl font-semibold flex items-center gap-2"><Palette className="w-6 h-6 text-pink-500" /> Creative Coding</h2></div>
                    <div className="h-[500px] border rounded-xl overflow-hidden shadow-xl dark:border-white/10">
                        <CodeShoebox code={p5State.code.includes('createCanvas') ? p5State.code : P5_DEMO_CODE} onCodeChange={p5State.setCode} environmentMode="p5" theme={themes[2]} themeMode="dark" />
                    </div>
                </section>

                <section>
                    <div className="mb-6"><h2 className="text-2xl font-semibold flex items-center gap-2"><Cpu className="w-6 h-6 text-yellow-500" /> Logic (Headless JS)</h2></div>
                    <div className="h-[400px] border rounded-xl overflow-hidden shadow-xl dark:border-white/10">
                        <CodeShoebox code={nodeJsState.code.includes('trackMeets') ? nodeJsState.code : NODE_JS_DEMO_CODE} onCodeChange={nodeJsState.setCode} environmentMode="node-js" theme={themes[0]} themeMode="dark" />
                    </div>
                </section>

                <section>
                    <div className="mb-6"><h2 className="text-2xl font-semibold flex items-center gap-2"><Code2 className="w-6 h-6 text-teal-500" /> Logic (Headless TS)</h2></div>
                    <div className="h-[400px] border rounded-xl overflow-hidden shadow-xl dark:border-white/10">
                        <CodeShoebox code={nodeTsState.code.includes('TodoList') ? nodeTsState.code : NODE_TS_DEMO_CODE} onCodeChange={nodeTsState.setCode} environmentMode="node-ts" theme={themes[2]} themeMode="dark" />
                    </div>
                </section>

                <section>
                    <div className="mb-6"><h2 className="text-2xl font-semibold flex items-center gap-2"><Server className="w-6 h-6 text-orange-500" /> API Simulator</h2></div>
                    <div className="h-[500px] border rounded-xl overflow-hidden shadow-xl dark:border-white/10">
                        <CodeShoebox code={expressState.code.includes('express') ? expressState.code : EXPRESS_DEMO_CODE} onCodeChange={expressState.setCode} environmentMode="express" theme={themes[1]} themeMode="dark" />
                    </div>
                </section>
            </div>
        </div>
    );
}
