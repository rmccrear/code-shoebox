
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

export const TYPESCRIPT_STARTER_CODE = `// Welcome to TypeScript!
// The browser will transpile this code before running it.

interface User {
  id: number;
  name: string;
  role: 'admin' | 'user';
}

const currentUser: User = {
  id: 42,
  name: "Sandbox Developer",
  role: "admin"
};

// 'root' is available in the global scope
const displayUser = (user: User) => {
  const card = document.createElement('div');
  Object.assign(card.style, {
    padding: '20px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    fontFamily: 'monospace'
  });

  card.innerHTML = \`
    <h3>\${user.name}</h3>
    <p>ID: \${user.id}</p>
    <p>Role: <span style="color: blue">\${user.role}</span></p>
  \`;
  
  root.appendChild(card);
};

displayUser(currentUser);
console.log("TypeScript execution complete");
`;

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
