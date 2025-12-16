
import React from 'react';
import { Palette, Server, Box } from 'lucide-react';
import { CodeShoebox } from './components/CodeShoebox';
import { themes, Theme } from './theme';
import { useSandboxState } from './hooks/useSandboxState';

// A custom theme defined locally for the "Matrix" demo
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
  // Semi-transparent background for trail effect
  background(0, 10); 
  
  translate(width / 2, height / 2);
  noFill();
  
  let t = frameCount;
  
  // Draw rotating geometric symmetry
  for (let i = 0; i < 6; i++) {
    push();
    rotate(i * 60 + t * 0.5);
    
    // Dynamic color based on time and angle
    stroke((t + i * 30) % 360, 90, 100);
    strokeWeight(2);
    
    // Oscillating shapes
    let d = 100 + sin(t * 2) * 50;
    let r = 20 + cos(t * 3) * 10;
    
    // Geometric patterns
    triangle(d, 0, d - 20, 20, d - 20, -20);
    ellipse(d/2, 0, d, r * 2);
    
    pop();
  }
  
  // Center pulsing core
  noStroke();
  fill((t * 2) % 360, 80, 100);
  circle(0, 0, 10 + 10 * sin(t * 5));
}`;

const EXPRESS_DEMO_CODE = `const app = express();
const port = 3000;

// Internal "Database"
const inventory = [
  { id: 1, item: "Space Suit", price: 500 },
  { id: 2, item: "Oxygen Tank", price: 150 },
  { id: 3, item: "Dehydrated Ice Cream", price: 5 }
];

app.get('/api/inventory', (req, res) => {
  res.json(inventory);
});

app.get('/api/inventory/:id', (req, res) => {
  const item = inventory.find(i => i.id == req.params.id);
  if (item) {
    res.json(item);
  } else {
    res.status(404).json({ error: "Item not found in airlock" });
  }
});

app.listen(port, () => {
  console.log('Deep Space Network active on port ' + port);
});`;

const EXPRESS_TS_DEMO_CODE = `import express, { Request, Response } from 'express';

const app = express();
const port = 3000;

interface CrewMember {
  id: number;
  name: string;
  rank: 'Commander' | 'Pilot' | 'Specialist';
}

const crew: CrewMember[] = [
  { id: 1, name: "Ripley", rank: "Commander" },
  { id: 2, name: "Dallas", rank: "Pilot" }
];

app.get('/crew', (req: Request, res: Response) => {
  res.json(crew);
});

app.get('/crew/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const member = crew.find(c => c.id === id);
  if (member) {
    res.json(member);
  } else {
    res.status(404).json({ error: "Crew member missing" });
  }
});

app.listen(port, () => {
  console.log(\`Nostromo manifest available on port \${port}\`);
});`;

export const Demo: React.FC = () => {
    // We use isolated sandbox states for the demos so they don't interfere with the main app
    const matrixState = useSandboxState('demo_matrix');
    const p5State = useSandboxState('demo_p5_art'); 
    const expressState = useSandboxState('demo_express');
    const expressTsState = useSandboxState('demo_express_ts');

    const quizCode = "const secret = 42;\nconsole.log('The secret is: ' + secret);";
    const matrixCode = "// Wake up, Neo...\n// The Matrix has you.\n\nfunction followTheWhiteRabbit() {\n  console.log('Knock, knock, Neo.');\n}\n\nfollowTheWhiteRabbit();";
    
    return (
        <div className="h-full w-full overflow-y-auto bg-gray-50 dark:bg-[#121212] transition-colors duration-300">
            <div className="max-w-5xl mx-auto py-12 px-6 space-y-24">
                
                <header>
                    <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">
                        Cookbook Demos
                    </h1>
                    <p className="text-lg opacity-70 max-w-2xl dark:text-gray-300">
                        A collection of example configurations showing the versatility of the CodeShoebox component.
                    </p>
                </header>

                {/* Example 1 */}
                <section>
                    <div className="mb-6">
                        <div className="flex items-center gap-3 mb-2">
                             <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 font-bold text-sm">1</span>
                             <h2 className="text-2xl font-semibold dark:text-gray-100">The "Pop Quiz"</h2>
                        </div>
                        <p className="pl-11 opacity-70 max-w-3xl dark:text-gray-300">
                             Use <code>prediction_prompt</code> to lock the editor and blur the output. 
                             This pedagogical pattern forces students to trace code mentally before executing it.
                        </p>
                    </div>
                    <div className="h-[400px] border rounded-xl overflow-hidden shadow-2xl dark:border-white/10 dark:shadow-blue-900/10">
                        <CodeShoebox 
                            code={quizCode}
                            onCodeChange={() => {}} // Read only
                            environmentMode="dom"
                            theme={themes[0]}
                            themeMode="dark"
                            prediction_prompt="What will be logged to the console?"
                        />
                    </div>
                </section>

                 {/* Example 2: Creative Coding */}
                 <section>
                    <div className="mb-6">
                         <div className="flex items-center gap-3 mb-2">
                             <span className="flex items-center justify-center w-8 h-8 rounded-full bg-pink-100 dark:bg-pink-900 text-pink-600 dark:text-pink-400 font-bold text-sm">2</span>
                             <h2 className="text-2xl font-semibold dark:text-gray-100 flex items-center gap-2">
                                Creative Coding <Palette className="w-5 h-5 opacity-50" />
                             </h2>
                        </div>
                        <p className="pl-11 opacity-70 max-w-3xl dark:text-gray-300">
                            Switching to <code>p5</code> mode automatically detects the canvas and handles the animation loop, making it perfect for generative art courses.
                        </p>
                    </div>
                    <div className="h-[500px] border rounded-xl overflow-hidden shadow-2xl dark:border-white/10 dark:shadow-pink-900/10">
                        <CodeShoebox 
                            // Fallback logic for p5 state
                            code={p5State.code && p5State.code !== themes[0].name ? p5State.code : P5_DEMO_CODE} 
                            onCodeChange={p5State.setCode}
                            environmentMode="p5"
                            theme={themes[2]} // Modern Lab theme
                            themeMode="light"
                        />
                    </div>
                </section>

                {/* Example 3: Backend Simulator */}
                <section>
                    <div className="mb-6">
                         <div className="flex items-center gap-3 mb-2">
                             <span className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400 font-bold text-sm">3</span>
                             <h2 className="text-2xl font-semibold dark:text-gray-100 flex items-center gap-2">
                                API Simulator (JS) <Server className="w-5 h-5 opacity-50" />
                             </h2>
                        </div>
                        <p className="pl-11 opacity-70 max-w-3xl dark:text-gray-300">
                            The <code>express</code> mode replaces the visual output with a "Postman-style" API client. Students can define routes and test them without leaving the browser.
                        </p>
                    </div>
                    <div className="h-[500px] border rounded-xl overflow-hidden shadow-2xl dark:border-white/10 dark:shadow-orange-900/10">
                        <CodeShoebox 
                            code={expressState.code.includes('mock API') ? EXPRESS_DEMO_CODE : expressState.code}
                            onCodeChange={expressState.setCode}
                            environmentMode="express"
                            theme={themes[1]} // Boris Theme
                            themeMode="dark"
                        />
                    </div>
                </section>

                {/* Example 4: Backend Simulator (TS) */}
                <section>
                    <div className="mb-6">
                         <div className="flex items-center gap-3 mb-2">
                             <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 font-bold text-sm">4</span>
                             <h2 className="text-2xl font-semibold dark:text-gray-100 flex items-center gap-2">
                                API Simulator (TypeScript) <Server className="w-5 h-5 opacity-50" />
                             </h2>
                        </div>
                        <p className="pl-11 opacity-70 max-w-3xl dark:text-gray-300">
                            The <code>express-ts</code> mode supports type-safe API development. It includes mocked <code>Request</code> and <code>Response</code> types.
                        </p>
                    </div>
                    <div className="h-[500px] border rounded-xl overflow-hidden shadow-2xl dark:border-white/10 dark:shadow-indigo-900/10">
                        <CodeShoebox 
                            code={expressTsState.code.includes('Express + TypeScript') ? EXPRESS_TS_DEMO_CODE : expressTsState.code}
                            onCodeChange={expressTsState.setCode}
                            environmentMode="express-ts"
                            theme={themes[0]} 
                            themeMode="dark"
                        />
                    </div>
                </section>

                {/* Example 5: Theming */}
                <section>
                    <div className="mb-6">
                         <div className="flex items-center gap-3 mb-2">
                             <span className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 font-bold text-sm">5</span>
                             <h2 className="text-2xl font-semibold dark:text-gray-100 flex items-center gap-2">
                                Custom Branding <Box className="w-5 h-5 opacity-50" />
                             </h2>
                        </div>
                        <p className="pl-11 opacity-70 max-w-3xl dark:text-gray-300">
                            Complete visual control using HSL color variables in the <code>theme</code> prop.
                        </p>
                    </div>
                    <div className="h-[500px] border rounded-xl overflow-hidden shadow-2xl dark:border-green-500/30 dark:shadow-green-900/10">
                        <CodeShoebox 
                            code={matrixState.code || matrixCode}
                            onCodeChange={matrixState.setCode}
                            environmentMode="dom"
                            theme={matrixTheme}
                            themeMode="dark"
                        />
                    </div>
                </section>
                
                <footer className="pt-12 pb-6 text-center opacity-40 text-sm dark:text-gray-400">
                    Built for the CodeShoebox Library
                </footer>
            </div>
        </div>
    );
}