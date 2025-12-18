
export const APP_NAME = "CodeShoebox";

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
    alert('Button clicked! Securely.');
    console.log('Button interaction detected at ' + new Date().toLocaleTimeString());
};

root.appendChild(button);

// Example 3: Console logging
console.log('Code loaded successfully.');
`;

// Using array join to safely handle nested template literals and avoid escaping issues in complex starter code strings
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
