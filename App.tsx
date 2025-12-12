
import React, { useState } from 'react';
import { Box, Code2, Palette, Sun, Moon, RotateCcw, Brain } from 'lucide-react';
import { CodeShoebox } from './components/CodeShoebox';
import { Button } from './components/Button';
import { ConfirmationModal } from './components/ConfirmationModal';
import { themes, Theme } from './theme';
import { ThemeMode, EnvironmentMode } from './types';
import { getPredictionPrompt } from './prompts';
import { 
  STARTER_CODE, 
  P5_STARTER_CODE, 
  REACT_STARTER_CODE, 
  TYPESCRIPT_STARTER_CODE,
  REACT_TS_STARTER_CODE,
  EXPRESS_STARTER_CODE,
  APP_NAME 
} from './constants';

const App: React.FC = () => {
  // -- State --
  const [environmentMode, setEnvironmentMode] = useState<EnvironmentMode>('dom');
  const [themeMode, setThemeMode] = useState<ThemeMode>('dark');
  const [activeTheme, setActiveTheme] = useState<Theme>(themes[0]);
  const [isPredictionMode, setIsPredictionMode] = useState(false);
  
  // Code State
  // We initialize with the starter code for the default mode (dom)
  const [code, setCode] = useState<string>(STARTER_CODE);
  
  // Session ID used to force resets of the internal editor state
  const [sessionId, setSessionId] = useState<number>(0);

  // -- Modal State --
  const [modalOpen, setModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ title: '', message: '', onConfirm: () => {} });

  // -- Helpers --
  const getStarterCode = (mode: EnvironmentMode) => {
    switch (mode) {
      case 'p5': return P5_STARTER_CODE;
      case 'react': return REACT_STARTER_CODE;
      case 'typescript': return TYPESCRIPT_STARTER_CODE;
      case 'react-ts': return REACT_TS_STARTER_CODE;
      case 'express': return EXPRESS_STARTER_CODE;
      default: return STARTER_CODE;
    }
  };

  const triggerModal = (title: string, message: string, onConfirm: () => void) => {
    setModalConfig({ title, message, onConfirm });
    setModalOpen(true);
  };

  const handleModalConfirm = () => {
    modalConfig.onConfirm();
    setModalOpen(false);
  };

  // -- Event Handlers --

  const toggleThemeMode = () => {
    setThemeMode(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = themes.find(t => t.name === e.target.value);
    if (selected) {
      setActiveTheme(selected);
    }
  };

  const handleModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMode = e.target.value as EnvironmentMode;
    if (newMode !== environmentMode) {
      triggerModal(
        "Switch Mode?",
        "Switching modes will reset your code. Continue?",
        () => {
          setEnvironmentMode(newMode);
          const newCode = getStarterCode(newMode);
          setCode(newCode);
          setSessionId(prev => prev + 1);
        }
      );
    }
  };

  const handleStartOver = () => {
    triggerModal(
      "Start Over?",
      "Are you sure you want to start over? This will revert your code to the starter template and you will lose your changes.",
      () => {
        const newCode = getStarterCode(environmentMode);
        setCode(newCode);
        setSessionId(prev => prev + 1);
      }
    );
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-[#1e1e1e] text-gray-200">
      
      {/* --- Top Chrome (Test Harness) --- */}
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
           {/* Environment Dropdown */}
           <div className="relative group hidden sm:block">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-md border text-sm transition-colors ${themeMode === 'dark' ? 'border-gray-700 bg-gray-800 text-gray-200' : 'border-gray-300 bg-white text-gray-700'}`}>
              <Code2 className="w-4 h-4 opacity-70" />
              <select 
                value={environmentMode}
                onChange={handleModeChange}
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

          {/* Theme Dropdown */}
          <div className="relative group hidden sm:block">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-md border text-sm transition-colors ${themeMode === 'dark' ? 'border-gray-700 bg-gray-800 text-gray-200' : 'border-gray-300 bg-white text-gray-700'}`}>
              <Palette className="w-4 h-4 opacity-70" />
              <select 
                value={activeTheme.name}
                onChange={handleThemeChange}
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

          <div className="h-6 w-px bg-current opacity-10 mx-1" />

          {/* Prediction Toggle (For Demo Purposes) */}
          <Button 
            variant="ghost" 
            onClick={() => setIsPredictionMode(!isPredictionMode)}
            className={isPredictionMode ? (themeMode === 'dark' ? 'text-purple-400 bg-purple-500/10' : 'text-purple-600 bg-purple-100') : ''}
            title="Toggle Prediction Mode (Demo)"
          >
            <Brain className="w-4 h-4" />
          </Button>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            onClick={toggleThemeMode}
            title={`Switch to ${themeMode === 'dark' ? 'light' : 'dark'} mode`}
          >
            {themeMode === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>

          {/* Start Over */}
          <Button 
            variant="ghost" 
            onClick={handleStartOver} 
            title="Clear editor and start over with starter code"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Start Over</span>
          </Button>
        </div>
      </header>

      {/* --- Component Under Test --- */}
      <div className="flex-1 overflow-hidden">
        <CodeShoebox 
          code={code}
          onCodeChange={setCode}
          environmentMode={environmentMode}
          themeMode={themeMode}
          theme={activeTheme}
          sessionId={sessionId}
          prediction_prompt={isPredictionMode ? getPredictionPrompt(environmentMode) : undefined}
        />
      </div>

      {/* --- Modals --- */}
      <ConfirmationModal
        isOpen={modalOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        onConfirm={handleModalConfirm}
        onCancel={() => setModalOpen(false)}
        themeMode={themeMode}
      />
    </div>
  );
};

export default App;
