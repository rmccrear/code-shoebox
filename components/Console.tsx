
import React from 'react';
import { Terminal, Ban } from 'lucide-react';
import { ThemeMode } from '../types';
import { Button } from './Button';

export type LogPartKind =
  | 'string' | 'number' | 'bigint' | 'boolean' | 'null' | 'undefined'
  | 'symbol' | 'function' | 'object' | 'error';

/** A colored run of text inside a console value's preview. */
export type LogSegmentKind =
  | 'text' | 'string' | 'number' | 'bigint' | 'boolean' | 'null' | 'undefined'
  | 'symbol' | 'regexp' | 'function' | 'fnprefix' | 'subtle' | 'node';

export interface LogSegment {
  kind: LogSegmentKind;
  text: string;
}

/** One row of an expanded value: `name: value`, or a bare DOM child node. */
export interface LogChild {
  name?: string;
  /** Non-enumerable or internal (`length`, `size`, `[[Entries]]`). */
  subtle?: boolean;
  value: LogValue;
}

/**
 * Snapshot of a console argument, taken in the sandbox at log time.
 * `children` present means the value can be expanded.
 */
export interface LogValue {
  /** Chrome's one-line preview: `(2) [{…}, {…}]`. */
  preview: LogSegment[];
  /** Header shown while expanded, when it differs (an element's start tag). */
  open?: LogSegment[];
  /** Row shown after the children while expanded (an element's end tag). */
  close?: LogSegment[];
  children?: LogChild[];
  /** The sandbox stopped at its depth or size limit; shown as `…`. */
  truncated?: boolean;
}

/** One console argument, as described by the sandbox kernel (issue #29 follow-up). */
export interface LogPart {
  kind: LogPartKind;
  text: string;
  /** Structured tree for objects, arrays, Maps, Sets, elements and functions. */
  value?: LogValue;
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

const LOG_SEGMENT_KINDS: ReadonlySet<string> = new Set<LogSegmentKind>([
  'text', 'string', 'number', 'bigint', 'boolean', 'null', 'undefined',
  'symbol', 'regexp', 'function', 'fnprefix', 'subtle', 'node'
]);

// Host-side ceilings, a little above the sandbox's own (depth 6, 2000 nodes),
// so a hostile message cannot make the console render without bound.
const MAX_VALUE_DEPTH = 12;
const MAX_VALUE_NODES = 5000;
const MAX_SEGMENTS = 100000;

type ValueBudget = { nodes: number; segments: number };

const toSegments = (raw: unknown, budget: ValueBudget): LogSegment[] | undefined => {
  if (!Array.isArray(raw)) return undefined;
  const segments: LogSegment[] = [];
  for (const item of raw) {
    if (
      !item
      || typeof item !== 'object'
      || typeof item.text !== 'string'
      || !LOG_SEGMENT_KINDS.has(item.kind)
      || ++budget.segments > MAX_SEGMENTS
    ) {
      return undefined;
    }
    segments.push({ kind: item.kind, text: item.text });
  }
  return segments;
};

const toLogValue = (raw: unknown, depth: number, budget: ValueBudget): LogValue | undefined => {
  if (!raw || typeof raw !== 'object' || depth > MAX_VALUE_DEPTH || ++budget.nodes > MAX_VALUE_NODES) {
    return undefined;
  }
  const source = raw as Record<string, unknown>;
  const preview = toSegments(source.preview, budget);
  if (!preview) return undefined;
  const value: LogValue = { preview };
  if (source.open !== undefined) {
    const open = toSegments(source.open, budget);
    if (!open) return undefined;
    value.open = open;
  }
  if (source.close !== undefined) {
    const close = toSegments(source.close, budget);
    if (!close) return undefined;
    value.close = close;
  }
  if (source.children !== undefined) {
    if (!Array.isArray(source.children)) return undefined;
    const children: LogChild[] = [];
    for (const item of source.children) {
      if (!item || typeof item !== 'object') return undefined;
      const { name, subtle } = item as Record<string, unknown>;
      if (name !== undefined && typeof name !== 'string') return undefined;
      const childValue = toLogValue((item as Record<string, unknown>).value, depth + 1, budget);
      if (!childValue) return undefined;
      const child: LogChild = { value: childValue };
      if (name !== undefined) child.name = name;
      if (subtle === true) child.subtle = true;
      children.push(child);
    }
    value.children = children;
  }
  if (source.truncated === true) value.truncated = true;
  return value;
};

/**
 * Validates `parts` from a sandbox message. Learner code shares the iframe,
 * so a malformed part list is dropped and the row falls back to `content`;
 * a malformed `value` tree is dropped and the part shows its `text`.
 */
export const toLogParts = (raw: unknown): LogPart[] | undefined => {
  if (!Array.isArray(raw)) return undefined;
  const parts: LogPart[] = [];
  const budget: ValueBudget = { nodes: 0, segments: 0 };
  for (const item of raw) {
    if (
      !item
      || typeof item !== 'object'
      || typeof item.text !== 'string'
      || !LOG_PART_KINDS.has(item.kind)
    ) {
      return undefined;
    }
    const part: LogPart = { kind: item.kind, text: item.text };
    const value = item.value === undefined ? undefined : toLogValue(item.value, 0, budget);
    if (value) part.value = value;
    parts.push(part);
  }
  return parts;
};

type ConsolePalette = Record<LogSegmentKind | 'base' | 'name' | 'toggle', string | undefined>;

// Chrome DevTools colors (devtools-frontend objectValue.css and
// design_system_tokens.css, resolved). Legacy rgb() syntax for older engines.
const CHROME_PALETTES: Record<ThemeMode, ConsolePalette> = {
  light: {
    base: '#1f1f1f',
    text: undefined,
    number: 'rgb(8, 66, 160)',
    boolean: 'rgb(8, 66, 160)',
    fnprefix: 'rgb(8, 66, 160)',
    bigint: 'rgb(20, 108, 46)',
    null: 'rgba(31, 31, 31, 0.38)',
    undefined: 'rgba(31, 31, 31, 0.38)',
    string: 'rgb(220, 54, 46)',
    symbol: 'rgb(220, 54, 46)',
    regexp: 'rgb(220, 54, 46)',
    function: undefined,
    subtle: 'rgb(117, 117, 117)',
    node: undefined,
    name: 'rgb(142, 0, 75)',
    toggle: 'rgb(117, 117, 117)'
  },
  dark: {
    base: '#e3e3e3',
    text: undefined,
    number: 'rgb(153, 128, 255)',
    boolean: 'rgb(153, 128, 255)',
    fnprefix: 'rgb(153, 128, 255)',
    bigint: 'rgb(171, 171, 171)',
    null: 'rgba(227, 227, 227, 0.38)',
    undefined: 'rgba(227, 227, 227, 0.38)',
    string: 'rgb(92, 213, 251)',
    symbol: 'rgb(92, 213, 251)',
    regexp: 'rgb(92, 213, 251)',
    function: undefined,
    subtle: 'rgb(143, 143, 143)',
    node: 'rgb(199, 199, 199)',
    name: 'rgb(124, 172, 248)',
    toggle: 'rgb(143, 143, 143)'
  }
};

// Top-level arguments: strings stay plain base text, as in Chrome.
const PART_COLOR_KIND: Partial<Record<LogPartKind, LogSegmentKind>> = {
  number: 'number',
  bigint: 'bigint',
  boolean: 'boolean',
  null: 'null',
  undefined: 'undefined',
  symbol: 'symbol'
};

const colorStyle = (color: string | undefined) => (color ? { color } : undefined);

const Segments = ({ segments, palette }: { segments: LogSegment[]; palette: ConsolePalette }) => (
  <>
    {segments.map((segment, index) => (
      <span key={index} data-seg-kind={segment.kind} style={colorStyle(palette[segment.kind])}>
        {segment.text}
      </span>
    ))}
  </>
);

// Width of the ▶ marker, so leaf rows line up with expandable siblings.
const ARROW_WIDTH = '1.1em';

const toggleStyle: React.CSSProperties = {
  appearance: 'none',
  background: 'transparent',
  border: 0,
  paddingTop: 0,
  paddingRight: 0,
  paddingBottom: 0,
  margin: 0,
  font: 'inherit',
  color: 'inherit',
  textAlign: 'left',
  cursor: 'pointer',
  // A wrapped preview hangs after the ▶, which sits in the left padding.
  position: 'relative',
  display: 'inline-block',
  maxWidth: '100%',
  verticalAlign: 'top',
  paddingLeft: ARROW_WIDTH,
  whiteSpace: 'pre-wrap',
  overflowWrap: 'break-word'
};

// Chrome's console wraps rows (consoleView.css: #console-messages
// overflow-wrap: break-word; message text pre-wrap) instead of scrolling.
const ROW_WRAP_STYLE: React.CSSProperties = { whiteSpace: 'pre-wrap', overflowWrap: 'break-word' };

const Arrow = ({ open, palette }: { open: boolean; palette: ConsolePalette }) => (
  <span
    aria-hidden="true"
    style={{ position: 'absolute', left: 0, top: 0, width: ARROW_WIDTH, fontSize: '0.75em', color: palette.toggle }}
  >
    {open ? '▼' : '▶'}
  </span>
);

const isExpandable = (value: LogValue) =>
  !!value.children && (value.children.length > 0 || !!value.truncated);

interface ConsoleValueProps {
  value: LogValue;
  palette: ConsolePalette;
  label?: React.ReactNode;
}

/** One console value: Chrome's ▶ preview that toggles to ▼ and its children. */
const ConsoleValue = ({ value, palette, label }: ConsoleValueProps) => {
  const [open, setOpen] = React.useState(false);
  if (!isExpandable(value)) {
    return (
      <>
        {label}
        <Segments segments={value.preview} palette={palette} />
      </>
    );
  }
  const header = open && value.open ? value.open : value.preview;
  return (
    <span
      data-console-tree=""
      style={open ? { display: 'inline-block', maxWidth: '100%', verticalAlign: 'top' } : undefined}
    >
      <button type="button" aria-expanded={open} onClick={() => setOpen(current => !current)} style={toggleStyle}>
        <Arrow open={open} palette={palette} />
        {label}
        <Segments segments={header} palette={palette} />
      </button>
      {open && (
        <span role="group" style={{ display: 'block', paddingLeft: ARROW_WIDTH }}>
          {value.children?.map((child, index) => (
            <span
              key={index}
              // Leaf rows indent by the arrow's width, wrapped lines included.
              style={{ display: 'block', paddingLeft: isExpandable(child.value) ? 0 : ARROW_WIDTH }}
              data-console-row=""
            >
              <ConsoleValue
                value={child.value}
                palette={palette}
                label={child.name === undefined ? undefined : (
                  <>
                    <span data-seg-kind="name" style={colorStyle(child.subtle ? palette.subtle : palette.name)}>
                      {child.name}
                    </span>
                    {': '}
                  </>
                )}
              />
            </span>
          ))}
          {value.truncated && (
            <span style={{ display: 'block', paddingLeft: ARROW_WIDTH, color: palette.subtle }} data-console-row="">
              {'…'}
            </span>
          )}
        </span>
      )}
      {open && value.close && (
        <span style={{ display: 'block', paddingLeft: ARROW_WIDTH }} data-console-row="">
          <Segments segments={value.close} palette={palette} />
        </span>
      )}
    </span>
  );
};

const renderLogText = (log: LogEntry, themeMode: ThemeMode) => {
  // Warn and error rows keep their row color; only plain logs get part colors.
  if (log.type !== 'log' || !log.parts || log.parts.length === 0) return log.content;
  const palette = CHROME_PALETTES[themeMode === 'dark' ? 'dark' : 'light'];
  return log.parts.map((part, index) => {
    const colorKind = PART_COLOR_KIND[part.kind];
    return (
      <React.Fragment key={index}>
        {index > 0 && ' '}
        <span data-log-kind={part.kind} style={colorStyle(colorKind && palette[colorKind])}>
          {part.value ? <ConsoleValue value={part.value} palette={palette} /> : part.text}
        </span>
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
          <div key={i} data-console-message="" style={log.type === 'log' ? { ...ROW_WRAP_STYLE, color: CHROME_PALETTES[themeMode === 'dark' ? 'dark' : 'light'].base } : ROW_WRAP_STYLE} className={`
            border-b border-transparent hover:bg-black/5 dark:hover:bg-white/5 px-1 py-0.5
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
