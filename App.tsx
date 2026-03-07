
import React, { useEffect, useState } from 'react';
import { Box, Code2, Palette, Sun, Moon, RotateCcw, Brain, ArrowLeft, Bug } from 'lucide-react';
import { CodeShoebox } from './components/CodeShoebox';
import { Demo } from './Demo';
import { Button } from './components/Button';
import { ConfirmationModal } from './components/ConfirmationModal';
import { themes } from './theme';
import { EnvironmentMode } from './types';
import { getPredictionPrompt } from './prompts';
import { APP_NAME } from './constants';
import { useSandboxState } from './hooks/useSandboxState';

const EDITOR_HASH_PRESETS: Record<string, { mode: EnvironmentMode; code: string }> = {
  'ts-express-rest-demo': {
    mode: 'express-ts',
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
  'hono-api-demo': {
    mode: 'hono',
    code: `const app = new Hono();
app.get('/', (c) => c.text('Hono running on Web Standards!'));
app.get('/api/stats', (c) => c.json({ engine: "Hono", version: "4.x", environment: "CodeShoebox" }));
export default app;`
  },
  'p5-ts-demo': {
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
  'ts-logic-demo': {
    mode: 'node-ts',
    code: `interface Task { id: number; title: string; }
const tasks: Task[] = [{ id: 1, title: "Ship hash presets" }];
console.table(tasks);`
  }
};

const HASH_ALIASES: Record<string, string> = {
  'express-rest-demo': 'ts-express-rest-demo'
};

const MODE_TO_HASH: Partial<Record<EnvironmentMode, string>> = {
  'express-ts': 'ts-express-rest-demo',
  'hono': 'hono-api-demo',
  'p5-ts': 'p5-ts-demo',
  'node-ts': 'ts-logic-demo'
};

const App: React.FC = () => {
  const {
    environmentMode,
    themeMode,
    activeThemeName,
    code,
    sessionId,
    setEnvironmentMode,
    setThemeMode,
    setActiveThemeName,
    setCode,
    resetCode
  } = useSandboxState('demo_workspace_v1'); 

  const [view, setView] = useState<'editor' | 'demo'>('editor');
  const [editorMountKey, setEditorMountKey] = useState(0);
  const [isPredictionMode, setIsPredictionMode] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ title: '', message: '', onConfirm: () => {} });

  const activeTheme = themes.find(t => t.name === activeThemeName) || themes[0];

  const handleStartOver = () => {
    setModalConfig({
      title: "Reset Code?",
      message: `Are you sure you want to reset your ${environmentMode} workspace? This will delete your saved progress for this mode and revert to the starter code.`,
      onConfirm: () => {
        resetCode();
        setModalOpen(false);
      }
    });
    setModalOpen(true);
  };

  const toggleThemeMode = () => {
    setThemeMode(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const syncHashForMode = (mode: EnvironmentMode) => {
    const nextHash = MODE_TO_HASH[mode];
    const currentHash = window.location.hash.replace(/^#/, '');

    if (nextHash) {
      if (currentHash !== nextHash) {
        window.location.hash = nextHash;
      }
      return;
    }

    if (currentHash) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  };

  const applyEditorPreset = (rawHash: string) => {
    const hash = decodeURIComponent(rawHash);
    const resolvedHash = HASH_ALIASES[hash] || hash;
    const preset = EDITOR_HASH_PRESETS[resolvedHash];
    if (!preset) return false;

    setView('editor');
    setIsPredictionMode(false);
    setEnvironmentMode(preset.mode);
    setCode(preset.code);
    setEditorMountKey(prev => prev + 1);
    return true;
  };

  useEffect(() => {
    const applyHashPreset = () => {
      const rawHash = window.location.hash.replace(/^#/, '');
      if (!rawHash) return;
      applyEditorPreset(rawHash);
    };

    applyHashPreset();
    window.addEventListener('hashchange', applyHashPreset);

    return () => window.removeEventListener('hashchange', applyHashPreset);
  }, [setCode, setEnvironmentMode]);

  return (
    <div className={`h-screen w-screen flex flex-col transition-colors duration-300 ${themeMode === 'dark' ? 'bg-[#1e1e1e] text-gray-200' : 'bg-gray-50 text-gray-900'}`}>
      
      <header className={`flex items-center justify-between px-4 sm:px-6 py-3 border-b shrink-0 transition-colors duration-300 ${themeMode === 'dark' ? 'bg-[#1e1e1e] border-white/10' : 'bg-white border-black/10 text-gray-800'}`}>
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg ${themeMode === 'dark' ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
            <Box className={`w-6 h-6 ${themeMode === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
          </div>
          <div className="hidden sm:block">
            <h1 className="font-bold text-lg leading-tight">{APP_NAME}</h1>
            <p className="text-xs opacity-60">Educational Sandbox</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {view === 'editor' ? (
            <Button
              variant="ghost"
              onClick={() => setView('demo')}
              title="Open Gallery"
            >
              <span className="hidden sm:inline">Gallery</span>
            </Button>
          ) : (
            <Button
              variant="ghost"
              onClick={() => setView('editor')}
              title="Back to Editor"
              className="bg-blue-500/10 text-blue-500"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline ml-2">Editor</span>
            </Button>
          )}

           {view === 'editor' && (
             <div className="relative group hidden sm:block">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-md border text-sm transition-colors ${themeMode === 'dark' ? 'border-gray-700 bg-gray-800 text-gray-200' : 'border-gray-300 bg-white text-gray-700'}`}>
                <Code2 className="w-4 h-4 opacity-70" />
                <select 
                  value={environmentMode}
                  onChange={(e) => {
                    const mode = e.target.value as EnvironmentMode;
                    setEnvironmentMode(mode);
                    syncHashForMode(mode);
                    const hash = MODE_TO_HASH[mode];
                    if (hash) {
                      applyEditorPreset(hash);
                    }
                  }}
                  className="bg-transparent border-none outline-none appearance-none cursor-pointer pr-4 font-medium"
                >
                  <optgroup label="Web & UI" className="text-black">
                    <option value="dom">DOM / JS</option>
                    <option value="typescript">TypeScript</option>
                    <option value="p5">p5.js</option>
                    <option value="p5-ts">p5.js (TS)</option>
                    <option value="react">React (JS)</option>
                    <option value="react-ts">React (TS)</option>
                  </optgroup>
                  <optgroup label="Logic & Console" className="text-black">
                    <option value="node-js">JavaScript (Console)</option>
                    <option value="node-ts">TypeScript (Console)</option>
                  </optgroup>
                  <optgroup label="Modern Server (Hono)" className="text-black">
                    <option value="hono">Hono (JS)</option>
                    <option value="hono-ts">Hono (TS)</option>
                  </optgroup>
                  <optgroup label="Server (Express)" className="text-black">
                    <option value="express">Node / Express</option>
                    <option value="express-ts">Express (TS)</option>
                  </optgroup>
                </select>
              </div>
            </div>
           )}

          {view === 'editor' && (
            <div className="relative group hidden sm:block">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-md border text-sm transition-colors ${themeMode === 'dark' ? 'border-gray-700 bg-gray-800 text-gray-200' : 'border-gray-300 bg-white text-gray-700'}`}>
                <Palette className="w-4 h-4 opacity-70" />
                <select 
                  value={activeThemeName}
                  onChange={(e) => setActiveThemeName(e.target.value)}
                  className="bg-transparent border-none outline-none appearance-none cursor-pointer pr-4 font-medium"
                >
                  {themes.map(t => (
                    <option key={t.name} value={t.name} className="text-black">
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="h-6 w-px bg-current opacity-10 mx-1" />

          {view === 'editor' && (
            <Button 
              variant="ghost" 
              onClick={() => setIsPredictionMode(!isPredictionMode)}
              className={isPredictionMode ? (themeMode === 'dark' ? 'text-purple-400 bg-purple-500/10' : 'text-purple-600 bg-purple-100') : ''}
              title="Toggle Prediction Mode (Demo)"
            >
              <Brain className="w-4 h-4" />
            </Button>
          )}

          <Button 
            variant="ghost" 
            onClick={() => setDebugMode(!debugMode)}
            className={debugMode ? (themeMode === 'dark' ? 'text-orange-400 bg-orange-500/10' : 'text-orange-600 bg-orange-100') : ''}
            title="Toggle Diagnostic Mode"
          >
            <Bug className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            onClick={toggleThemeMode}
            title={`Switch to ${themeMode === 'dark' ? 'light' : 'dark'} mode`}
          >
            {themeMode === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>

          {view === 'editor' && (
            <Button 
              variant="ghost" 
              onClick={handleStartOver} 
              title="Clear editor and reset to starter code"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">Start Over</span>
            </Button>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        {view === 'editor' ? (
          <CodeShoebox 
            key={editorMountKey}
            code={code}
            onCodeChange={setCode}
            environmentMode={environmentMode}
            themeMode={themeMode}
            theme={activeTheme}
            sessionId={sessionId}
            prediction_prompt={isPredictionMode ? getPredictionPrompt(environmentMode) : undefined}
            debugMode={debugMode}
          />
        ) : (
          <Demo />
        )}
      </div>

      <ConfirmationModal
        isOpen={modalOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        onConfirm={modalConfig.onConfirm}
        onCancel={() => setModalOpen(false)}
        themeMode={themeMode}
      />
    </div>
  );
};

export default App;
