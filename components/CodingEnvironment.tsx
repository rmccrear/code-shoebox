import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Play, 
  CheckCircle2, 
  FileCode, 
  Book, 
  Brain, 
  Lock, 
  Columns, 
  Rows, 
  GripVertical, 
  GripHorizontal,
  Maximize2
} from 'lucide-react';
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
  debugMode?: boolean;
}

export const CodingEnvironment: React.FC<CodingEnvironmentProps> = ({ 
  code, 
  onChange, 
  onRun,
  isRunning,
  runTrigger,
  themeMode,
  environmentMode,
  sessionId,
  predictionPrompt,
  debugMode = false
}) => {
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [predictionAnswer, setPredictionAnswer] = useState('');
  const [isPredictionLocked, setIsPredictionLocked] = useState(false);
  const [layout, setLayout] = useState<'horizontal' | 'vertical'>('horizontal');
  const [editorRatio, setEditorRatio] = useState(0.5);
  const [isDragging, setIsDragging] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const hasDocs = !!getDocsForMode(environmentMode);
  const isPredictionFulfilled = !predictionPrompt || predictionAnswer.trim().length > 0;

  const handleRunClick = () => {
    if (predictionPrompt) setIsPredictionLocked(true);
    onRun();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const newRatio = layout === 'horizontal' 
      ? (e.clientX - rect.left) / rect.width 
      : (e.clientY - rect.top) / rect.height;
    setEditorRatio(Math.max(0.2, Math.min(0.8, newRatio)));
  }, [isDragging, layout]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', () => setIsDragging(false));
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', () => setIsDragging(false));
    };
  }, [isDragging, handleMouseMove]);

  const isServerMode = environmentMode.startsWith('express') || environmentMode.startsWith('hono');

  return (
    <div className={`flex-1 flex flex-col overflow-hidden ${themeMode === 'dark' ? 'bg-[#1e1e1e]' : 'bg-white'}`}>
      {/* Prediction UI */}
      {predictionPrompt && (
        <div className={`p-4 border-b flex gap-4 ${themeMode === 'dark' ? 'bg-[#252526] border-white/10' : 'bg-blue-50 border-blue-100'}`}>
          <div className="flex-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-purple-500 mb-2">Knowledge Check</h3>
            <div className="text-sm opacity-80 mb-3">{predictionPrompt}</div>
            <textarea
              value={predictionAnswer}
              onChange={(e) => setPredictionAnswer(e.target.value)}
              disabled={isPredictionLocked}
              placeholder="What will happen when the code runs?"
              className={`w-full p-2 text-sm rounded border focus:ring-1 focus:ring-purple-500 outline-none transition-all ${themeMode === 'dark' ? 'bg-black/20 border-white/10 text-white' : 'bg-white border-gray-200'}`}
            />
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className={`h-12 px-4 border-b flex items-center justify-between ${themeMode === 'dark' ? 'bg-[#1e1e1e] border-white/10 text-gray-400' : 'bg-white border-gray-100'}`}>
        <div className="flex items-center gap-2">
          <FileCode className="w-4 h-4 text-blue-500" />
          <span className="text-xs font-mono font-medium hidden sm:inline">{environmentMode}.script</span>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Enhanced Layout Switcher */}
          <div className="flex bg-black/5 dark:bg-white/5 p-0.5 rounded-lg border border-black/5 dark:border-white/5">
            <button 
              onClick={() => setLayout('horizontal')} 
              title="Split View (Side by Side)"
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-tight transition-all ${layout === 'horizontal' ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-500' : 'opacity-40 hover:opacity-60'}`}
            >
              <Columns size={12}/>
              <span className="hidden md:inline">Split</span>
            </button>
            <button 
              onClick={() => setLayout('vertical')} 
              title="Vertical View (Stacked)"
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-tight transition-all ${layout === 'vertical' ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-500' : 'opacity-40 hover:opacity-60'}`}
            >
              <Rows size={12}/>
              <span className="hidden md:inline">Stacked</span>
            </button>
          </div>
          
          {!isServerMode && (
            <Button 
              onClick={handleRunClick} 
              disabled={isRunning || !isPredictionFulfilled}
              variant="primary"
              className="h-8 !px-5 text-xs font-bold shadow-lg shadow-blue-500/20"
              icon={isRunning ? <CheckCircle2 className="animate-pulse" size={14}/> : <Play size={14}/>}
            >
              {isRunning ? 'RUNNING...' : 'RUN CODE'}
            </Button>
          )}
        </div>
      </div>

      {/* Editor & Output Workspace */}
      <div ref={containerRef} className={`flex-1 flex overflow-hidden ${layout === 'horizontal' ? 'flex-row' : 'flex-col'}`}>
        <div style={{ [layout === 'horizontal' ? 'width' : 'height']: `${editorRatio * 100}%` }} className="relative flex flex-col min-w-0 min-h-0">
          <CodeEditor 
            code={code} 
            onChange={(val) => onChange(val || '')} 
            themeMode={themeMode} 
            environmentMode={environmentMode} 
            sessionId={sessionId} 
            readOnly={!!predictionPrompt && isPredictionLocked}
          />
        </div>

        <div 
          onMouseDown={handleMouseDown} 
          className={`flex items-center justify-center shrink-0 hover:bg-blue-500/50 transition-colors z-10 ${layout === 'horizontal' ? 'w-1.5 cursor-col-resize' : 'h-1.5 cursor-row-resize'} ${themeMode === 'dark' ? 'bg-black/40' : 'bg-gray-100'}`}
        >
          {layout === 'horizontal' ? <GripVertical size={10} className="opacity-20"/> : <GripHorizontal size={10} className="opacity-20"/>}
        </div>

        <div style={{ [layout === 'horizontal' ? 'width' : 'height']: `${(1 - editorRatio) * 100}%` }} className={`relative flex flex-col min-w-0 min-h-0 ${isDragging ? 'pointer-events-none' : ''}`}>
          <div className="flex-1 p-2 md:p-3 overflow-hidden">
            {isServerMode ? (
              <ServerOutput 
                runTrigger={runTrigger} 
                code={code} 
                themeMode={themeMode} 
                environmentMode={environmentMode} 
                isBlurred={!isPredictionFulfilled} 
                debugMode={debugMode}
                onTriggerRun={handleRunClick}
              />
            ) : (
              <OutputFrame runTrigger={runTrigger} code={code} themeMode={themeMode} environmentMode={environmentMode} isBlurred={!isPredictionFulfilled} isPredictionMode={!!predictionPrompt} debugMode={debugMode} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};