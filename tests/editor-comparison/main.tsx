import React, { useState } from 'react';
import type { CompletionSource } from '@codemirror/autocomplete';
import { createRoot } from 'react-dom/client';
import { CodeShoebox } from '../../components/CodeShoebox';
import { EditorBackendContext, type EditorBackend } from '../../components/EditorBackendContext';
import { EDITOR_DEMO_PRESETS } from '../../demoPresets';
import { baseTheme } from '../../theme';
import '../../dist/styles.css';

const params = new URLSearchParams(location.search);
const backend: EditorBackend = params.get('editor') === 'codemirror' ? 'codemirror' : 'monaco';
const scenario = params.get('scenario') ?? 'html-css-js-tabs-demo';
const preset = EDITOR_DEMO_PRESETS.find(preset => preset.id === scenario)!;
// The existing console bridge intercepts log/error/warn/info, not console.table.
const initialCode = preset.mode === 'node-ts' ? preset.code.replace('console.table(tasks)', 'console.log(tasks)') : preset.code;
if (backend === 'monaco' && params.get('assets') !== 'cdn') {
  const { loader } = await import('@monaco-editor/react');
  loader.config({ paths: { vs: '/node_modules/monaco-editor/min/vs' } });
}

// Comparison-only probes. No probe hooks are exposed by the library.
const monacoApi = () => (window as Window & { monaco: any }).monaco;
const probes = {
  async ready() {
    if (backend === 'codemirror') return true;
    const monaco = monacoApi();
    const model = monaco.editor.getEditors()[0].getModel();
    const getWorker = model.getLanguageId() === 'typescript'
      ? await monaco.languages.typescript.getTypeScriptWorker()
      : await monaco.languages.typescript.getJavaScriptWorker();
    const worker = await getWorker(model.uri);
    await worker.getSemanticDiagnostics(model.uri.toString());
    return true;
  },
  async diagnostics(): Promise<number[]> {
    if (backend === 'codemirror') return [];
    const monaco = monacoApi();
    const model = monaco.editor.getEditors()[0].getModel();
    const getWorker = await monaco.languages.typescript.getTypeScriptWorker();
    const worker = await getWorker(model.uri);
    return (await worker.getSemanticDiagnostics(model.uri.toString())).map((diagnostic: { code: number }) => diagnostic.code);
  },
  async completions(): Promise<string[]> {
    if (backend === 'codemirror') {
      const [{ EditorView }, { CompletionContext }] = await Promise.all([
        import('@codemirror/view'), import('@codemirror/autocomplete'),
      ]);
      const view = EditorView.findFromDOM(document.querySelector('.cm-editor') as HTMLElement)!;
      const pos = view.state.selection.main.head;
      const context = new CompletionContext(view.state, pos, true);
      const results = await Promise.all(view.state.languageDataAt<CompletionSource>('autocomplete', pos).map(source => source(context)));
      return results.flatMap(result => result?.options.map(option => option.label) ?? []);
    }
    const monaco = monacoApi();
    const editor = monaco.editor.getEditors()[0];
    const model = editor.getModel();
    const getWorker = await monaco.languages.typescript.getTypeScriptWorker();
    const worker = await getWorker(model.uri);
    return (await worker.getCompletionsAtPosition(model.uri.toString(), model.getOffsetAt(editor.getPosition())))?.entries.map((entry: { name: string }) => entry.name) ?? [];
  },
  async hover(word: string): Promise<string> {
    if (backend === 'codemirror') return '';
    const monaco = monacoApi();
    const model = monaco.editor.getEditors()[0].getModel();
    const getWorker = await monaco.languages.typescript.getTypeScriptWorker();
    const worker = await getWorker(model.uri);
    const hover = await worker.getQuickInfoAtPosition(model.uri.toString(), model.getValue().indexOf(word) + 1);
    return hover?.displayParts.map((part: { text: string }) => part.text).join('') ?? '';
  },
};
declare global { interface Window { editorComparison: typeof probes; } }
window.editorComparison = probes;

function Comparison() {
  const [code, setCode] = useState(initialCode);
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('dark');
  const [sessionId, setSessionId] = useState(1);
  const [enableEmmet, setEnableEmmet] = useState(params.get('emmet') === '1');
  return (
    <EditorBackendContext.Provider value={backend}>
      <nav style={{ padding: 12, display: 'flex', gap: 12 }}>
        <strong>{backend} · {preset.mode}</strong>
        <button onClick={() => setThemeMode(mode => mode === 'dark' ? 'light' : 'dark')}>Toggle theme</button>
        <button onClick={() => { setCode(initialCode); setSessionId(id => id + 1); }}>Reset exercise</button>
        <label><input type="checkbox" checked={enableEmmet} onChange={event => setEnableEmmet(event.target.checked)} /> Enable Emmet</label>
        <a href={`?editor=${backend === 'monaco' ? 'codemirror' : 'monaco'}&scenario=${scenario}`}>Compare other editor</a>
      </nav>
      <div style={{ flex: 1, minHeight: 0 }}>
        <CodeShoebox code={code} onCodeChange={setCode} environmentMode={preset.mode}
          themeMode={themeMode} theme={baseTheme} sessionId={sessionId} enableEmmet={enableEmmet} />
      </div>
      <output id="source" hidden>{code}</output>
    </EditorBackendContext.Provider>
  );
}

createRoot(document.getElementById('root')!).render(<React.StrictMode><Comparison /></React.StrictMode>);
