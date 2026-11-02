
import React from 'react';
import { Terminal, Ban } from 'lucide-react';
import { ThemeMode } from '../types';
import { Button } from './Button';

export type LogPartKind =
  | 'string' | 'number' | 'bigint' | 'boolean' | 'null' | 'undefined'
  | 'symbol' | 'function' | 'object' | 'error';

/** One console argument, as described by the sandbox kernel (issue #29). */
export interface LogPart {
  kind: LogPartKind;
  text: string;
}

export interface LogEntry {
  type: 'log' | 'error' | 'warn';
  content: string;
  /** Typed console arguments; absent for system logs and older kernels. */
  parts?: LogPart[];
  timestamp: number;
}

const LOG_PART_KINDS: ReadonlySet<string> = new Set<LogPartKind>([
  'string', 'number', 'bigint', 'boolean', 'null', 'undefined',
  'symbol', 'function', 'object', 'error'
]);

/**
 * Validates `parts` from a sandbox message. Learner code shares the iframe,
 * so anything malformed is dropped and the row falls back to `content`.
 */
export const toLogParts = (raw: unknown): LogPart[] | undefined => {
  if (!Array.isArray(raw)) return undefined;
  const parts: LogPart[] = [];
  for (const item of raw) {
    if (
      !item
      || typeof item !== 'object'
      || typeof item.text !== 'string'
      || !LOG_PART_KINDS.has(item.kind)
    ) {
      return undefined;
    }
    parts.push({ kind: item.kind, text: item.text });
  }
  return parts;
};

// Chrome DevTools colors for top-level primitives.
const PART_COLORS: Partial<Record<LogPartKind, { light: string; dark: string }>> = {
  number: { light: '#1a1aa6', dark: '#9980ff' },
  bigint: { light: '#1a1aa6', dark: '#9980ff' },
  boolean: { light: '#1a1aa6', dark: '#9980ff' },
  null: { light: '#80868b', dark: '#9aa0a6' },
  undefined: { light: '#80868b', dark: '#9aa0a6' }
};

const renderLogText = (log: LogEntry, themeMode: ThemeMode) => {
  // Warn and error rows keep their row color; only plain logs get part colors.
  if (log.type !== 'log' || !log.parts || log.parts.length === 0) return log.content;
  return log.parts.map((part, index) => {
    const colors = PART_COLORS[part.kind];
    const color = colors ? (themeMode === 'dark' ? colors.dark : colors.light) : undefined;
    return (
      <React.Fragment key={index}>
        {index > 0 && ' '}
        <span data-log-kind={part.kind} style={color ? { color } : undefined}>{part.text}</span>
      </React.Fragment>
    );
  });
};

interface ConsoleProps {
  logs: LogEntry[];
  onClear: () => void;
  themeMode: ThemeMode;
  height?: number | string;
  className?: string;
}

export const Console = React.memo(function Console({
  logs,
  onClear,
  themeMode,
  className = ''
}: ConsoleProps) {
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
            border-b border-transparent hover:bg-black/5 dark:hover:bg-white/5 px-1 py-0.5 break-all whitespace-pre
            ${log.type === 'error' ? 'text-red-500 bg-red-500/5' : ''}
            ${log.type === 'warn' ? 'text-yellow-500 bg-yellow-500/5' : ''}
          `}>
             <span className="opacity-50 mr-2 select-none">
                {'>'}
             </span>
             {renderLogText(log, themeMode)}
          </div>
        ))}
      </div>
    </div>
  );
});
