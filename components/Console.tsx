
import React from 'react';
import { Terminal, Ban } from 'lucide-react';
import { ThemeMode } from '../types';
import { Button } from './Button';

export interface LogEntry {
  type: 'log' | 'error' | 'warn';
  content: string;
  timestamp: number;
}

interface ConsoleProps {
  logs: LogEntry[];
  onClear: () => void;
  themeMode: ThemeMode;
  height?: number | string;
  className?: string;
}

export const Console: React.FC<ConsoleProps> = ({ 
  logs, 
  onClear, 
  themeMode, 
  className = '' 
}) => {
  return (
    <div className={`flex flex-col h-full w-full overflow-hidden ${className} ${themeMode === 'dark' ? 'bg-[#1e1e1e]' : 'bg-gray-50'}`}>
      {/* Console Header */}
      <div className={`flex items-center justify-between px-3 py-1 shrink-0 border-b ${themeMode === 'dark' ? 'border-white/10 bg-[#252526]' : 'border-gray-200 bg-gray-100'}`}>
        <div className="flex items-center gap-2 text-xs font-semibold opacity-70">
          <Terminal className="w-3 h-3" />
          <span>Console ({logs.length})</span>
        </div>
        <Button variant="ghost" onClick={onClear} className="!p-1 h-6 w-6" title="Clear Console">
          <Ban className="w-3 h-3" />
        </Button>
      </div>

      {/* Logs Area */}
      <div 
        className={`flex-1 overflow-y-auto p-2 font-mono text-xs space-y-1 ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
      >
        {logs.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center opacity-30 select-none">
            <span className="italic">No output</span>
          </div>
        )}
        
        {logs.map((log, i) => (
          <div key={i} className={`
            border-b border-transparent hover:bg-black/5 dark:hover:bg-white/5 px-1 py-0.5 break-all whitespace-pre-wrap
            ${log.type === 'error' ? 'text-red-500 bg-red-500/5' : ''}
            ${log.type === 'warn' ? 'text-yellow-500 bg-yellow-500/5' : ''}
          `}>
             <span className="opacity-50 mr-2 select-none">
                {'>'}
             </span>
             {log.content}
          </div>
        ))}
      </div>
    </div>
  );
};
