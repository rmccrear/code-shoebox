
import { serializeFileBundle } from './runtime/fileBundle';

export const APP_NAME = "CodeShoebox";

export const HTML_STARTER_CODE = `<!DOCTYPE html>
<html>
<head>
  <title>My First Page</title>
  <style>
    body {
      font-family: sans-serif;
      margin: 2rem;
    }
    h1 { color: #6366f1; }
    .highlight {
      background: #fef08a;
      padding: 0 4px;
    }
  </style>
</head>
<body>
  <h1>Hello, HTML!</h1>
  <p>This is a <span class="highlight">real
     web page</span>. Edit it and press Run.</p>
  <a href="https://developer.mozilla.org">
    Learn more at MDN</a>
</body>
</html>
`;

export const HTML_CSS_STARTER_CODE = serializeFileBundle({
  'index.html': `<!DOCTYPE html>
<html>
<head>
  <title>Two Files</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <h1>Hello, style.css!</h1>
  <p>The styles for this page live in the <strong>style.css</strong> tab.</p>
</body>
</html>
`,
  'style.css': `body {
  font-family: sans-serif;
  margin: 2rem;
}

h1 {
  color: #6366f1;
}

strong {
  background: #fef08a;
  padding: 0 4px;
}
`
});

export const HTML_JS_STARTER_CODE = serializeFileBundle({
  'index.html': `<!DOCTYPE html>
<html>
<head>
  <title>Two Files</title>
</head>
<body>
  <h1>HTML meets JavaScript</h1>
  <p id="message">Press the button to run an interaction.</p>
  <button id="change-message">Change message</button>
  <script src="script.js"></script>
</body>
</html>
`,
  'script.js': `const button = document.getElementById('change-message');
const message = document.getElementById('message');

button.addEventListener('click', () => {
  message.textContent = 'JavaScript changed the page!';
  console.log('Message updated');
});
`
});

export const HTML_CSS_JS_STARTER_CODE = serializeFileBundle({
  'index.html': `<!DOCTYPE html>
<html>
<head>
  <title>Three Files</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <main class="message-card">
    <p class="eyebrow">HTML + CSS + JavaScript</p>
    <h1 id="message">Ready for all three layers.</h1>
    <button id="change-message" type="button">Change message</button>
  </main>
  <script src="script.js"></script>
</body>
</html>
`,
  'style.css': `body {
  margin: 0;
  padding: 2rem;
  background: #eef2ff;
  font-family: ui-sans-serif, system-ui, sans-serif;
}

.message-card {
  max-width: 28rem;
  padding: 1.5rem;
  border: 1px solid #a5b4fc;
  border-radius: 1rem;
  background: white;
  color: #1e1b4b;
}

.eyebrow { color: #4f46e5; font-weight: 700; }
button { padding: 0.7rem 1rem; border: 0; border-radius: 999px; background: #4f46e5; color: white; }
`,
  'script.js': `const button = document.getElementById('change-message');
const message = document.getElementById('message');

button.addEventListener('click', () => {
  message.textContent = 'HTML, CSS, and JavaScript are connected!';
  console.log('Three-file interaction complete');
});
`
});

export const HTML_JS_CSS_MEDIA_STARTER_CODE = serializeFileBundle({
  'index.html': `<!DOCTYPE html>
<html>
<head>
  <title>Media Page</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <main class="media-card">
    <p class="eyebrow">HTML + CSS + JavaScript + Media</p>
    <h1>Build with media</h1>
    <div id="media-gallery">
      Open the Media tab and paste a snippet here.
    </div>
    <button id="check-media" type="button">Check my page</button>
  </main>
  <script src="script.js"></script>
</body>
</html>
`,
  'style.css': `body {
  margin: 0;
  padding: 2rem;
  background: #fff7ed;
  font-family: ui-sans-serif, system-ui, sans-serif;
  color: #7c2d12;
}

.media-card {
  max-width: 32rem;
  padding: 1.5rem;
  border: 1px solid #fdba74;
  border-radius: 1rem;
  background: white;
}

.eyebrow { color: #ea580c; font-weight: 700; }
#media-gallery { margin: 1rem 0; padding: 1rem; border: 2px dashed #fdba74; border-radius: 0.75rem; }
button { padding: 0.7rem 1rem; border: 0; border-radius: 999px; background: #ea580c; color: white; }
`,
  'script.js': `const button = document.getElementById('check-media');
const gallery = document.getElementById('media-gallery');

button.addEventListener('click', () => {
  console.log(gallery.children.length > 0 ? 'Media added!' : 'Choose a snippet from the Media tab.');
});
`
});

export const STARTER_CODE = `// Welcome to your coding sandbox!
// You can use standard JavaScript here.
// 'root' is a reference to the main container div.

// Example 1: Manipulate the DOM
const heading = document.createElement('h1');
heading.innerText = 'Hello, Sandbox!';
heading.style.color = '#3b82f6';
root.appendChild(heading);

// Example 2: Add some interactivity
const button = document.createElement('button');
button.innerText = 'Click Me';
button.style.marginTop = '10px';
button.style.padding = '8px 16px';
button.style.cursor = 'pointer';

button.onclick = () => {
    console.log('Button clicked! Interaction detected at ' + new Date().toLocaleTimeString());
};

root.appendChild(button);

// Example 3: Console logging
console.log('Code loaded successfully.');
`;

export const FETCH_STARTER_CODE = `// Fetch data from the routes in the API Server tab.
// The mock server waits one second so you can observe that await pauses here.

let response = await fetch("/api/air-quality?limit=4");
let readings = await response.json();

console.log("The first city is " + readings[0].city);
console.log(readings);
`;

export const TYPESCRIPT_STARTER_CODE = [
  '// Welcome to TypeScript!',
  '// The browser will transpile this code before running it.',
  '',
  'interface User {',
  '  id: number;',
  '  name: string;',
  '  role: \'admin\' | \'user\';',
  '}',
  '',
  'const currentUser: User = {',
  '  id: 42,',
  '  name: "Sandbox Developer",',
  '  role: "admin"',
  '};',
  '',
  '// \'root\' is available in the global scope',
  'const displayUser = (user: User) => {',
  '  const card = document.createElement(\'div\');',
  '  Object.assign(card.style, {',
  '    padding: \'20px\',',
  '    border: \'1px solid #ccc\',',
  '    borderRadius: \'8px\',',
  '    fontFamily: \'monospace\'',
  '  });',
  '',
  '  card.innerHTML = `',
  '    <h3>${user.name}</h3>',
  '    <p>ID: ${user.id}</p>',
  '    <p>Role: <span style="color: blue">${user.role}</span></p>',
  '  `;',
  '  ',
  '  root.appendChild(card);',
  '};',
  '',
  'displayUser(currentUser);',
  'console.log("TypeScript execution complete");'
].join('\n');

export const P5_STARTER_CODE = `// Welcome to p5.js Creative Coding!
// The console below will capture your logs.

function setup() {
  createCanvas(400, 400);
  background(220);
  console.log("p5.js setup complete!");
}

function draw() {
  // Move mouse to draw
  if (mouseIsPressed) {
    fill(0);
  } else {
    fill(255);
  }
  
  // Draw an ellipse at mouse position
  ellipse(mouseX, mouseY, 20, 20);
}
`;

export const P5_TS_STARTER_CODE = `/**
 * p5.js + TypeScript
 * Using interfaces and types for creative coding!
 */

interface Particle {
  x: number;
  y: number;
  size: number;
  color: string;
}

const particles: Particle[] = [];

// Global scope p5 functions
(window as any).setup = () => {
  createCanvas(400, 400);
  background(20);
  console.log("Typed p5 setup complete");
};

(window as any).draw = () => {
  background(20, 20);
  
  if (mouseIsPressed) {
    const p: Particle = {
      x: mouseX,
      y: mouseY,
      size: random(10, 30),
      color: \`hsl(\${frameCount % 360}, 70%, 60%)\`
    };
    particles.push(p);
  }

  // Draw typed particles
  particles.forEach((p, i) => {
    noStroke();
    fill(p.color);
    circle(p.x, p.y, p.size);
    p.size *= 0.95; // Shrink
    if (p.size < 0.5) particles.splice(i, 1);
  });
};
`;

export const REACT_STARTER_CODE = `import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div style={{ fontFamily: 'sans-serif', textAlign: 'center', padding: 20 }}>
      <h2>React Counter</h2>
      <p style={{ fontSize: '2rem', margin: '10px 0' }}>{count}</p>
      <button 
        style={{ padding: '8px 16px', cursor: 'pointer', fontSize: '1rem' }}
        onClick={() => setCount(count + 1)}
      >
        Increment
      </button>
    </div>
  );
}

const root = createRoot(document.getElementById('root'));
root.render(<Counter />);
`;

export const REACT_TS_STARTER_CODE = `import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';

interface CounterProps {
  start?: number;
}

const Counter: React.FC<CounterProps> = ({ start = 0 }) => {
  const [count, setCount] = useState<number>(start);

  return (
    <div style={{ fontFamily: 'sans-serif', textAlign: 'center', padding: 20 }}>
      <h2>React + TypeScript</h2>
      <p style={{ fontSize: '2rem', margin: '10px 0' }}>{count}</p>
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <button 
          onClick={() => setCount(c => c - 1)}
          style={{ padding: '8px 16px', cursor: 'pointer' }}
        >
          -
        </button>
        <button 
          onClick={() => setCount(c => c + 1)}
          style={{ padding: '8px 16px', cursor: 'pointer' }}
        >
          +
        </button>
      </div>
    </div>
  );
};

// Ensure root exists
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<Counter start={10} />);
}
`;

export const EXPRESS_STARTER_CODE = [
  '// Welcome to the Express.js Simulator!',
  '// We\'ve mocked \'express\' so you can write server-side code in the browser.',
  '',
  'const app = express();',
  'const port = 3000;',
  '',
  '// Database simulation',
  'const users = [',
  '  { id: 1, name: \'Alice\', role: \'engineer\' },',
  '  { id: 2, name: \'Bob\', role: \'designer\' }',
  '];',
  '',
  '// Define your routes below',
  'app.get(\'/\', (req, res) => {',
  '  res.json({ message: \'Welcome to the mock API!\' });',
  '});',
  '',
  'app.get(\'/users\', (req, res) => {',
  '  res.json(users);',
  '});',
  '',
  'app.get(\'/users/:id\', (req, res) => {',
  '  const id = parseInt(req.params.id);',
  '  const user = users.find(u => u.id === id);',
  '  ',
  '  if (user) {',
  '    res.json(user);',
  '  } else {',
  '    res.status(404).json({ error: \'User not found\' });',
  '  }',
  '});',
  '',
  '// Start the server',
  'app.listen(port, () => {',
  '  console.log(`Mock server listening on port ${port}`);',
  '});'
].join('\n');

export const EXPRESS_TS_STARTER_CODE = [
  '// Express + TypeScript Simulator',
  'import express, { Request, Response } from \'express\';',
  '',
  'const app = express();',
  'const port = 3000;',
  '',
  'interface Product {',
  '  id: number;',
  '  name: string;',
  '  stock: number;',
  '}',
  '',
  'const inventory: Product[] = [',
  '  { id: 101, name: "Laptop", stock: 5 },',
  '  { id: 102, name: "Mouse", stock: 12 }',
  '];',
  '',
  'app.get(\'/\', (req: Request, res: Response) => {',
  '  res.json({ status: "system_nominal", timestamp: Date.now() });',
  '});',
  '',
  'app.get(\'/products\', (req: Request, res: Response) => {',
  '  res.json(inventory);',
  '});',
  '',
  'app.get(\'/products/:id\', (req: Request, res: Response) => {',
  '  const id = parseInt(req.params.id);',
  '  const item = inventory.find(p => p.id === id);',
  '  ',
  '  if (item) {',
  '    res.json(item);',
  '  } else {',
  '    res.status(404).json({ error: "Product not found" });',
  '  }',
  '});',
  '',
  'app.listen(port, () => {',
  '  console.log(`TS Server initialized on port ${port}`);',
  '});'
].join('\n');

export const HONO_STARTER_CODE = [
  '// Modern Server Simulation using Hono!',
  '// Hono is built on web standards like Request and Response.',
  '',
  'const app = new Hono();',
  '',
  'app.get(\'/\', (c) => {',
  '  return c.text(\'Hono says hello!\');',
  '});',
  '',
  'app.get(\'/api/hello\', (c) => {',
  '  return c.json({',
  '    message: \'Hono is lightweight and fast!\',',
  '    runtime: \'Browser Sandbox\'',
  '  });',
  '});',
  '',
  '// Try sending a GET request to /user/123',
  'app.get(\'/user/:id\', (c) => {',
  '  const id = c.req.param(\'id\');',
  '  return c.json({ userId: id, status: \'active\' });',
  '});',
  '',
  '// Standard Export for Modern Runtimes (Cloudflare, Bun, etc)',
  'export default app;'
].join('\n');

export const HONO_TS_STARTER_CODE = [
  '// Hono + TypeScript',
  'import { Hono } from \'hono\';',
  '',
  'const app = new Hono();',
  '',
  'interface Profile {',
  '  username: string;',
  '  bio: string;',
  '}',
  '',
  'const profile: Profile = {',
  '  username: "shoebox_dev",',
  '  bio: "Simulating the future of web frameworks in a tab."',
  '};',
  '',
  'app.get(\'/\', (c) => c.text(\'Hono TS Environment Ready\'));',
  '',
  'app.get(\'/profile\', (c) => {',
  '  return c.json(profile);',
  '});',
  '',
  'export default app;'
].join('\n');

export const NODE_JS_STARTER_CODE = `/**
 * Logic & Algorithms: The Reducer Pattern
 * 
 * Scenario: Track Meet Analysis
 * Goal: Sum up the total miles where the pace was under 7:00 min/mile.
 */

const trackMeets = [
  { event: "High School Invitational", miles: 3.1, pacePerMile: 6.45 },
  { event: "City Championship", miles: 3.1, pacePerMile: 7.10 },
  { event: "District Finals", miles: 3.1, pacePerMile: 6.55 },
  { event: "State Meet", miles: 3.1, pacePerMile: 6.50 },
  { event: "Morning Training Run", miles: 5.0, pacePerMile: 8.30 },
  { event: "Speed Workout", miles: 4.0, pacePerMile: 6.58 }
];

console.log("Analyzing Track Meet Data...");
console.table(trackMeets);

// Use reduce to filter and sum in one pass
const eliteMiles = trackMeets.reduce((total, meet) => {
  if (meet.pacePerMile < 7.0) {
    console.log(\`✅ Included: \${meet.event} (\${meet.miles} miles @ \${meet.pacePerMile})\`);
    return total + meet.miles;
  }
  return total;
}, 0);

console.log("\\n--- Results ---");
console.log(\`Total "Elite" Miles (Under 7:00 pace): \${eliteMiles.toFixed(1)} miles\`);
`;

export const NODE_TS_STARTER_CODE = `/**
 * Pure TypeScript Console Environment
 * Focus on types and logic without DOM distraction.
 */

interface Task {
  id: number;
  title: string;
  completed: boolean;
}

class TodoList {
  private tasks: Task[] = [];

  addTask(title: string): void {
    const newTask: Task = {
      id: this.tasks.length + 1,
      title,
      completed: false
    };
    this.tasks.push(newTask);
    console.log(\`Added task: "\${title}"\`);
  }

  showTasks(): void {
    console.log("--- Current Todo List ---");
    console.table(this.tasks);
  }
}

const myTodos = new TodoList();
myTodos.addTask("Learn TypeScript Types");
myTodos.addTask("Master the Console");
myTodos.showTasks();
`;
