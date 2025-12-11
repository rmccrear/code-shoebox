
import React, { useState, useEffect } from 'react';
import { Play, CheckCircle2, FileCode, Book, HelpCircle } from 'lucide-react';
import { CodeEditor } from './CodeEditor';
import { OutputFrame } from './OutputFrame';
import { HelpSidebar } from './HelpSidebar';
import { Button } from './Button';
import { ThemeMode, EnvironmentMode } from '../types';
import { getDocsForMode } from '../docs';

interface CodingEnvironmentProps {
  code: string;
  onChange: (code: string) => void;
  onRun: () => void;
  isRunning: boolean;
  runTrigger: number;
  themeMode: ThemeMode;
  environmentMode: EnvironmentMode;
  sessionId: number;
}

export const CodingEnvironment: React.FC<CodingEnvironmentProps> = ({ 
  code, 
  onChange, 
  onRun,
  isRunning,
  runTrigger,
  themeMode,
  environmentMode,
  sessionId
}) => {
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const hasDocs = !!getDocsForMode(environmentMode);

  // Close help if mode changes to one without docs
  useEffect(() => {
    if (!hasDocs) setIsHelpOpen(false);
  }, [environmentMode, hasDocs]);

  let fileName = 'script.js';
  switch (environmentMode) {
    case 'p5': fileName = 'sketch.js'; break;
    case 'react': fileName = 'App.jsx'; break;
    case 'typescript': fileName = 'script.ts'; break;
    case 'react-ts': fileName = 'App.tsx'; break;
    default: fileName = 'script.js';
  }

  return (
    <main className="flex-1 overflow-hidden flex flex-col relative">
      {/* Component Navbar */}
      <div className={`h-12 shrink-0 border-b flex items-center justify-between px-4 transition-colors duration-300 ${themeMode === 'dark' ? 'bg-[#1e1e1e] border-white/10' : 'bg-white border-gray-200'}`}>
         {/* Left: File Info */}
         <div className={`flex items-center gap-2 transition-colors ${themeMode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            <FileCode className="w-4 h-4" />
            <span className="text-sm font-mono opacity-80">{fileName}</span>
         </div>

         {/* Right: Actions */}
         <div className="flex items-center gap-3">
            {hasDocs && (
              <Button
                variant="ghost"
                onClick={() => setIsHelpOpen(!isHelpOpen)}
                className={`!px-2 ${isHelpOpen ? 'bg-blue-500/10 text-blue-500' : ''}`}
                title="Toggle Documentation"
              >
                <Book className="w-4 h-4" />
                <span className="hidden sm:inline text-xs ml-2">Help</span>
              </Button>
            )}

            <div className={`h-4 w-px mx-1 ${themeMode === 'dark' ? 'bg-white/10' : 'bg-gray-200'}`} />

            <Button 
                onClick={onRun} 
                disabled={isRunning}
                className="h-8 px-4 text-sm font-semibold shadow-sm"
                icon={isRunning ? <CheckCircle2 className="w-3.5 h-3.5 animate-pulse"/> : <Play className="w-3.5 h-3.5 fill-current" />}
            >
                {isRunning ? 'Running...' : 'Run Code'}
            </Button>
         </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Editor & Output Container */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-w-0">
          {/* Editor Pane */}
          <section className={`flex-1 flex flex-col min-h-[40%] md:min-h-0 border-b md:border-b-0 md:border-r relative group transition-colors duration-300 ${themeMode === 'dark' ? 'border-gray-800' : 'border-gray-200'}`}>
            <CodeEditor 
              code={code} 
              onChange={(val) => onChange(val || '')} 
              themeMode={themeMode}
              environmentMode={environmentMode}
              sessionId={sessionId}
            />
          </section>

          {/* Output Pane */}
          <section className={`flex-1 flex flex-col min-h-[40%] md:min-h-0 relative transition-colors duration-300 ${themeMode === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
            <div className="flex-1 p-2 md:p-4 h-full overflow-hidden">
              <OutputFrame 
                runTrigger={runTrigger} 
                code={code} 
                themeMode={themeMode}
                environmentMode={environmentMode}
              />
            </div>
          </section>
        </div>

        {/* Help Sidebar (Conditionally Rendered Layout) */}
        {hasDocs && isHelpOpen && (
          <HelpSidebar 
            isOpen={isHelpOpen} 
            onClose={() => setIsHelpOpen(false)}
            themeMode={themeMode}
            environmentMode={environmentMode}
          />
        )}
      </div>
    </main>
  );
};
