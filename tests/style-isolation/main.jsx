import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { CodeShoebox, baseTheme } from '../../dist/export.js';

// Deliberately differ from packaged utility/preflight values. Every declaration
// belongs to a layer, matching Tailwind v4 consumer cascade behavior.
const layeredHost = `
@layer theme, base, components, utilities;
@layer theme { #host { --primary: 220 90% 50%; color: rgb(21, 31, 41); } }
@layer base {
  #host h1 { font-size: 31px; font-weight: 600; margin: 17px; }
  #host ul { list-style-type: square; margin: 13px; padding: 23px; }
  #host input { font-family: serif; font-size: 19px; border: 3px solid purple; padding: 7px; }
  #host img { display: inline; vertical-align: baseline; max-width: none; }
  #host button { font-family: serif; font-size: 17px; border: 3px solid green; padding: 7px; }
}
@layer components { .bg-primary { background-color: rgb(24, 70, 160); } }
@layer utilities {
  .text-white { color: rgb(250, 250, 250); }
  .text-zinc-400 { color: rgb(160, 160, 170); }
  .flex { display: block; }
  .p-4 { padding: 31px; }
  .text-sm { font-size: 23px; line-height: 33px; }
}
@keyframes pulse { from, to { opacity: 0.83; } }
#animation { animation: pulse 100s linear infinite; }
`;
const plainHost = `
#host { color: rgb(21, 31, 41); }
#primary { background: rgb(24, 70, 160); color: rgb(250, 250, 250); }
#inactive { color: rgb(160, 160, 170); }
@keyframes pulse { from, to { opacity: 0.83; } }
#animation { animation: pulse 100s linear infinite; }
`;

const params = new URLSearchParams(location.search);
const scenario = params.get('scenario') || 'B';
const plain = params.get('host') === 'plain';
const reverse = params.get('order') === 'package-first';
const editable = params.get('editable') === '1';
if (editable) {
  const { loader } = await import('@monaco-editor/react');
  loader.config({ paths: { vs: '/node_modules/monaco-editor/min/vs' } });
  const monaco = await loader.init();
  // Test explicit suggestions while keeping background requests from racing
  // with the smoke test's rapid model changes.
  monaco.editor.onDidCreateEditor(editor => editor.updateOptions({
    quickSuggestions: false, suggestOnTriggerCharacters: false, occurrencesHighlight: 'off',
  }));
}
// Layer D must be declared before any host layers are established.
if (scenario === 'D') addStyle('@layer code-shoebox, theme, base, components, utilities;');
const hostStyle = addStyle(plain ? plainHost : layeredHost);

function addStyle(css) {
  const style = document.createElement('style');
  style.textContent = css;
  document.head.append(style);
  return style;
}

const fields = ['backgroundColor', 'color', 'fontFamily', 'fontSize', 'fontWeight',
  'lineHeight', 'borderTopWidth', 'borderTopStyle', 'borderTopColor', 'paddingTop',
  'marginTop', 'display', 'boxSizing', 'listStyleType', 'verticalAlign', 'maxWidth', 'opacity'];
function snapshot() {
  return Object.fromEntries([...document.querySelectorAll('#host [id]')].map(element => {
    const computed = getComputedStyle(element);
    return [element.id, Object.fromEntries(fields.map(field => [field, computed[field]]))];
  }));
}

const before = snapshot();
if (reverse) hostStyle.remove();
if (scenario === 'B') {
  // The documented consumer path: a JavaScript CSS import of the built artifact.
  await import('../../dist/styles.css');
} else if (scenario !== 'A') {
  const { default: css } = await import('../../dist/styles.css?inline');
  if (!css.includes('box-sizing')) throw new Error('Built stylesheet was not loaded');
  addStyle(`@layer code-shoebox { ${css} }`);
}
if (reverse) document.head.append(hostStyle);

addStyle('#components { display: grid; gap: 16px; } .component-holder { width: 900px; height: 560px; font-family: Inter, serif; }');
function EditableFixture() {
  const [code, setCode] = useState(JSON.stringify({ __csFiles__: 1, files: {
    'index.html': '<p id="result">Ready</p><script src="script.js"></script>',
    'style.css': '#result { color: purple; }',
    'script.js': 'document.querySelector("#result").textContent = "Editable sandbox ran"; console.log("editable smoke");',
  } }));
  window.editableCode = code;
  return <div className="component-holder" data-theme="light"><CodeShoebox code={code}
    onCodeChange={setCode} environmentMode="html-js-css-media" theme={baseTheme} themeMode="light"
    sessionId={91} mediaAssets={[{ kind: 'image', name: 'Local preview', alt: 'Fixture media',
      src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20'/%3E" }]} />
  </div>;
}

createRoot(document.getElementById('components')).render(editable ? <EditableFixture /> : (
  <>
    {['light', 'dark'].map(themeMode => (
      <div className="component-holder" key={themeMode} data-theme={themeMode}>
        <CodeShoebox code="<p>Hello from the sandbox</p>" onCodeChange={() => {}}
          environmentMode="html" theme={baseTheme} themeMode={themeMode}
          prediction_prompt="Predict what this HTML displays." />
      </div>
    ))}
  </>,
));
window.styleIsolation = { before, snapshot, scenario, plain };
