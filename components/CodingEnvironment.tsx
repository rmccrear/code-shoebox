
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, CheckCircle2, FileCode, Book, Brain, Lock, Columns, Rows, GripVertical, GripHorizontal } from 'lucide-react';
import { CodeEditor } from './CodeEditor';
import { OutputFrame } from './OutputFrame';
import { ServerOutput } from './ServerOutput';
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
  predictionPrompt?: React.ReactNode;
}

type LayoutDirection = 'horizontal' | 'vertical';

export const CodingEnvironment: React.FC<CodingEnvironmentProps> = ({ 
  code, 
  onChange, 
  onRun,
  isRunning,
  runTrigger,
  themeMode,
  environmentMode,
  sessionId,
  predictionPrompt
}) => {
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [predictionAnswer, setPredictionAnswer] = useState('');
  const [isPredictionLocked, setIsPredictionLocked] = useState(false);
  const [layout, setLayout] = useState<LayoutDirection>('horizontal');
  
  // Resizing State
  const containerRef = useRef<HTMLDivElement>(null);
  const [editorRatio, setEditorRatio] = useState(0.5); // 0.0 to 1.0
  const [isDragging, setIsDragging] = useState(false);

  const hasDocs = !!getDocsForMode(environmentMode);
  const hasPredictionTask = predictionPrompt !== undefined && predictionPrompt !== null && predictionPrompt !== '';
  const isPredictionFulfilled = !hasPredictionTask || predictionAnswer.trim().length > 0;

  // Reset local state when session changes
  useEffect(() => {
    setPredictionAnswer('');
    setIsPredictionLocked(false);
  }, [sessionId]);

  // Close help if mode changes to one without docs
  useEffect(() => {
    if (!hasDocs) setIsHelpOpen(false);
  }, [environmentMode, hasDocs]);

  const handleRunClick = () => {
    if (hasPredictionTask) {
        setIsPredictionLocked(true);
    }
    onRun();
  };

  // --- Resizing Logic ---

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    let newRatio = 0.5;

    if (layout === 'horizontal') {
      const relativeX = e.clientX - containerRect.left;
      newRatio = relativeX / containerRect.width;
    } else {
      const relativeY = e.clientY - containerRect.top;
      newRatio = relativeY / containerRect.height;
    }

    // Clamp ratio between 10% and 90%
    newRatio = Math.max(0.1, Math.min(0.9, newRatio));
    setEditorRatio(newRatio);
  }, [isDragging, layout]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      // Prevent selection during drag
      document.body.style.userSelect = 'none';
      document.body.style.cursor = layout === 'horizontal' ? 'col-resize' : 'row-resize';
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, [isDragging, handleMouseMove, handleMouseUp, layout]);

  // --- End Resizing Logic ---

  let fileName = 'script.js';
  switch (environmentMode) {
    case 'p5': fileName = 'sketch.js'; break;
    case 'react': fileName = 'App.jsx'; break;
    case 'typescript': fileName = 'script.ts'; break;
    case 'react-ts': fileName = 'App.tsx'; break;
    case 'express': fileName = 'server.js'; break;
    case 'express-ts': fileName = 'server.ts'; break;
    default: fileName = 'script.js';
  }

  const isServerMode = environmentMode === 'express' || environmentMode === 'express-ts';

  return (
    <main className="flex-1 overflow-hidden flex flex-col relative">
      
      {/* Prediction Panel */}
      {hasPredictionTask && (
        <div className={`
          shrink-0 border-b p-4 flex flex-col gap-3 transition-colors duration-300
          ${themeMode === 'dark' ? 'bg-[#252526] border-white/10' : 'bg-blue-50/50 border-blue-100'}
        `}>
          <div className="flex items-start gap-3">
             <div className={`p-2 rounded-lg shrink-0 ${themeMode === 'dark' ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-700'}`}>
                <Brain className="w-5 h-5" />
             </div>
             <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className={`text-sm font-bold uppercase tracking-wide mb-1 ${themeMode === 'dark' ? 'text-purple-400' : 'text-purple-700'}`}>
                        Predict
                    </h3>
                    <div className={`text-sm leading-relaxed ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-800'}`}>
                        {predictionPrompt}
                    </div>
                  </div>
                  {isPredictionLocked && (
                      <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded border ml-4 ${themeMode === 'dark' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-green-100 text-green-700 border-green-200'}`}>
                          <Lock className="w-3 h-3" />
                          Locked
                      </div>
                  )}
                </div>
                
                <textarea
                  value={predictionAnswer}
                  onChange={(e) => setPredictionAnswer(e.target.value)}
                  placeholder="Type your prediction here..."
                  disabled={isPredictionLocked}
                  className={`
                    w-full min-h-[60px] p-3 rounded-md text-sm outline-none border focus:ring-2 transition-all resize-y
                    disabled:opacity-60 disabled:cursor-not-allowed
                    ${themeMode === 'dark' 
                      ? 'bg-black/20 border-white/10 text-gray-200 placeholder-gray-500 focus:border-purple-500/50 focus:ring-purple-500/20 disabled:bg-black/40' 
                      : 'bg-white border-gray-300 text-gray-800 placeholder-gray-400 focus:border-purple-500 focus:ring-purple-200 disabled:bg-gray-50'}
                  `}
                />
             </div>
          </div>
        </div>
      )}

      {/* Component Navbar */}
      <div className={`h-12 shrink-0 border-b flex items-center justify-between px-4 transition-colors duration-300 ${themeMode === 'dark' ? 'bg-[#1e1e1e] border-white/10' : 'bg-white border-gray-200'}`}>
         {/* Left: File Info */}
         <div className={`flex items-center gap-2 transition-colors ${themeMode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            <FileCode className="w-4 h-4" />
            <span className="text-sm font-mono opacity-80">{fileName}</span>
            {hasPredictionTask && (
               <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-500 border border-orange-500/20">
                  Read Only
               </span>
            )}
         </div>

         {/* Right: Actions */}
         <div className="flex items-center gap-3">
            {/* Layout Toggle */}
            <div className="hidden sm:flex items-center gap-1 bg-black/5 dark:bg-white/5 rounded-md p-0.5">
                <button
                    onClick={() => setLayout('horizontal')}
                    className={`p-1.5 rounded ${layout === 'horizontal' ? (themeMode === 'dark' ? 'bg-gray-700 text-white shadow-sm' : 'bg-white text-black shadow-sm') : 'opacity-50 hover:opacity-100'}`}
                    title="Split Screen (Side by Side)"
                >
                    <Columns className="w-3.5 h-3.5" />
                </button>
                <button
                    onClick={() => setLayout('vertical')}
                    className={`p-1.5 rounded ${layout === 'vertical' ? (themeMode === 'dark' ? 'bg-gray-700 text-white shadow-sm' : 'bg-white text-black shadow-sm') : 'opacity-50 hover:opacity-100'}`}
                    title="Vertical Split (Stacked)"
                >
                    <Rows className="w-3.5 h-3.5" />
                </button>
            </div>

            <div className={`h-4 w-px mx-1 ${themeMode === 'dark' ? 'bg-white/10' : 'bg-gray-200'}`} />

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

            <Button 
                onClick={handleRunClick} 
                disabled={isRunning || !isPredictionFulfilled}
                className={`h-8 px-4 text-sm font-semibold shadow-sm transition-all duration-300 ${!isPredictionFulfilled ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
                icon={isRunning ? <CheckCircle2 className="w-3.5 h-3.5 animate-pulse"/> : <Play className="w-3.5 h-3.5 fill-current" />}
            >
                {isRunning ? 'Running...' : 'Run Code'}
            </Button>
         </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Editor & Output Container */}
        <div 
            ref={containerRef}
            className={`flex-1 flex overflow-hidden min-w-0 ${layout === 'horizontal' ? 'flex-row' : 'flex-col'}`}
        >
          {/* Editor Pane */}
          <section 
            style={{ 
                [layout === 'horizontal' ? 'width' : 'height']: `${editorRatio * 100}%` 
            }}
            className={`
             flex flex-col relative group transition-colors duration-300 min-w-0
             ${themeMode === 'dark' ? 'border-gray-800' : 'border-gray-200'}
            `}
          >
            <CodeEditor 
              code={code} 
              onChange={(val) => onChange(val || '')} 
              themeMode={themeMode}
              environmentMode={environmentMode}
              sessionId={sessionId}
              readOnly={hasPredictionTask}
            />
          </section>

          {/* Resizer Handle */}
          <div
            onMouseDown={handleMouseDown}
            className={`
                z-20 flex items-center justify-center shrink-0 hover:bg-blue-500 hover:text-white transition-colors
                ${themeMode === 'dark' ? 'bg-[#1e1e1e] text-gray-600 border-black/20' : 'bg-gray-100 text-gray-400 border-white'}
                ${isDragging ? '!bg-blue-600 !text-white' : ''}
                ${layout === 'horizontal' 
                    ? 'w-3 h-full cursor-col-resize border-l border-r' 
                    : 'h-3 w-full cursor-row-resize border-t border-b'
                }
            `}
          >
            {layout === 'horizontal' 
                ? <GripVertical className="w-3 h-3" /> 
                : <GripHorizontal className="w-3 h-3" />
            }
          </div>

          {/* Output Pane */}
          <section 
            style={{ 
                [layout === 'horizontal' ? 'width' : 'height']: `${(1 - editorRatio) * 100}%` 
            }}
            className={`
                flex flex-col relative transition-colors duration-300 min-w-0 
                ${themeMode === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}
                ${isDragging ? 'pointer-events-none' : ''} /* Prevent iframe stealing mouse events */
            `}
          >
            <div className="flex-1 p-2 md:p-4 h-full overflow-hidden">
              {isServerMode ? (
                <ServerOutput
                   runTrigger={runTrigger}
                   code={code}
                   themeMode={themeMode}
                   environmentMode={environmentMode}
                   isBlurred={!isPredictionFulfilled}
                />
              ) : (
                <OutputFrame 
                  runTrigger={runTrigger} 
                  code={code} 
                  themeMode={themeMode}
                  environmentMode={environmentMode}
                  isBlurred={!isPredictionFulfilled}
                  isPredictionMode={hasPredictionTask}
                />
              )}
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