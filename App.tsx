import React, { useState } from 'react';
import { Box, Code2, Palette, Sun, Moon, RotateCcw, Brain, LayoutTemplate, ArrowLeft } from 'lucide-react';
import { CodeShoebox } from './components/CodeShoebox';
import { Demo } from './Demo';
import { Button } from './components/Button';
import { ConfirmationModal } from './components/ConfirmationModal';
import { themes } from './theme';
import { EnvironmentMode } from './types';
import { getPredictionPrompt } from './prompts';
import { APP_NAME } from './constants';
import { useSandboxState } from './hooks/useSandboxState';

const App: React.FC = () => {
  // We provide a static key here to ensure this specific instance saves data.
  // If you used <CodeShoebox /> on another page without a key (or with a different key),
  // it would not conflict with this one.
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
  const [isPredictionMode, setIsPredictionMode] = useState(false);
  
  // UI State for modals
  const [modalOpen, setModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ title: '', message: '', onConfirm: () => {} });

  // -- Handlers --

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

  return (
    <div className={`h-screen w-screen flex flex-col transition-colors duration-300 ${themeMode === 'dark' ? 'bg-[#1e1e1e] text-gray-200' : 'bg-gray-50 text-gray-900'}`}>
      
      {/* --- Top Chrome --- */}
      <header className={`flex items-center justify-between px-4 sm:px-6 py-3 border-b shrink-0 transition-colors duration-300 ${themeMode === 'dark' ? 'bg-[#1e1e1e] border-white/10' : 'bg-white border-black/10 text-gray-800'}`}>
        <div className="flex items-center gap-2">
          {/* Logo / Branding */}
          <div className={`p-2 rounded-lg ${themeMode === 'dark' ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
            <Box className={`w-6 h-6 ${themeMode === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
          </div>
          <div className="hidden sm:block">
            <h1 className="font-bold text-lg leading-tight">{APP_NAME}</h1>
            <p className="text-xs opacity-60">Educational Sandbox</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
           
           <Button 
            variant="ghost" 
            onClick={() => setView(prev => prev === 'editor' ? 'demo' : 'editor')}
            title={view === 'editor' ? "View Demos" : "Back to Editor"}
            className={view === 'demo' ? 'bg-blue-500/10 text-blue-500' : ''}
          >
            {view === 'editor' ? <LayoutTemplate className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
            <span className="hidden sm:inline ml-2">{view === 'editor' ? "Demos" : "Editor"}</span>
          </Button>

           {/* Environment Dropdown (Only show in Editor view) */}
           {view === 'editor' && (
             <div className="relative group hidden sm:block">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-md border text-sm transition-colors ${themeMode === 'dark' ? 'border-gray-700 bg-gray-800 text-gray-200' : 'border-gray-300 bg-white text-gray-700'}`}>
                <Code2 className="w-4 h-4 opacity-70" />
                <select 
                  value={environmentMode}
                  onChange={(e) => setEnvironmentMode(e.target.value as EnvironmentMode)}
                  className="bg-transparent border-none outline-none appearance-none cursor-pointer pr-4 font-medium"
                >
                  <option value="dom" className="text-black">DOM / JS</option>
                  <option value="typescript" className="text-black">TypeScript</option>
                  <option value="p5" className="text-black">p5.js</option>
                  <option value="react" className="text-black">React (JS)</option>
                  <option value="react-ts" className="text-black">React (TS)</option>
                  <option value="express" className="text-black">Node / Express</option>
                </select>
              </div>
            </div>
           )}

          {/* Theme Dropdown (Only show in Editor view) */}
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

          {/* Prediction Toggle (Only show in Editor view) */}
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

          {/* Theme Toggle - Global */}
          <Button
            variant="ghost"
            onClick={toggleThemeMode}
            title={`Switch to ${themeMode === 'dark' ? 'light' : 'dark'} mode`}
          >
            {themeMode === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>

          {/* Start Over (Only show in Editor view) */}
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

      {/* --- Main Content --- */}
      <div className="flex-1 overflow-hidden">
        {view === 'editor' ? (
          <CodeShoebox 
            code={code}
            onCodeChange={setCode}
            environmentMode={environmentMode}
            themeMode={themeMode}
            theme={activeTheme}
            sessionId={sessionId}
            prediction_prompt={isPredictionMode ? getPredictionPrompt(environmentMode) : undefined}
          />
        ) : (
          <Demo />
        )}
      </div>

      {/* --- Modals --- */}
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