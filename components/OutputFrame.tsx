
import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { getSandboxHtml, executeCodeInSandbox, SANDBOX_ATTRIBUTES } from '../runtime/runner';
import { ThemeMode, EnvironmentMode, MockApiConfig } from '../types';
import { PreviewContainer } from './PreviewContainer';
import { Console, LogEntry } from './Console';
import { GripHorizontal } from 'lucide-react';

const MAX_CONSOLE_LOGS = 500;
const appendLog = (prev: LogEntry[], entry: LogEntry): LogEntry[] =>
  prev.length >= MAX_CONSOLE_LOGS
    ? [...prev.slice(-(MAX_CONSOLE_LOGS - 1)), entry]
    : [...prev, entry];

interface OutputFrameProps {
  runTrigger: number;
  code: string;
  themeMode: ThemeMode;
  environmentMode: EnvironmentMode;
  fixtureHtml?: string;
  fixtureCss?: string;
  mockApi?: MockApiConfig;
  isBlurred?: boolean;
  isPredictionMode?: boolean;
  debugMode?: boolean;
  onExecutionComplete?: () => void;
}

export const OutputFrame: React.FC<OutputFrameProps> = ({ 
  runTrigger, 
  code, 
  themeMode, 
  environmentMode,
  fixtureHtml,
  fixtureCss,
  mockApi,
  isBlurred = false,
  isPredictionMode = false,
  debugMode = false,
  onExecutionComplete,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<MessageChannel | null>(null);
  const executionRef = useRef({ code, environmentMode, fixtureHtml, fixtureCss, mockApi, debugMode });
  const latestExecutionIdRef = useRef<number | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  
  const [consoleHeight, setConsoleHeight] = useState(150); 
  const [isDragging, setIsDragging] = useState(false);

  const isHeadless = environmentMode === 'node-js' || environmentMode === 'node-ts';
  // HTML modes (single-file and tabbed): full-height output with no console
  // panel, rendered on mount and live-updated as the user types (safe: these
  // modes cannot run JS).
  const isStaticHtmlMode = environmentMode === 'html' || environmentMode === 'html-css';

  const addSystemLog = useCallback((msg: string, type: 'log' | 'error' | 'warn' = 'log') => {
    setLogs(prev => appendLog(prev, {
        type,
        content: `[System] ${msg}`,
        timestamp: Date.now()
    }));
  }, []);

  const sandboxHtml = useMemo(
    () => getSandboxHtml(environmentMode, isPredictionMode),
    [environmentMode, isPredictionMode]
  );

  useEffect(() => {
    executionRef.current = { code, environmentMode, fixtureHtml, fixtureCss, mockApi, debugMode };
  }, [code, environmentMode, fixtureHtml, fixtureCss, mockApi, debugMode]);

  const handleKernelMessage = useCallback((data: any) => {
    if (!data || typeof data !== 'object') return;
    const { type, payload } = data;
    if (type === 'CONSOLE_LOG' || type === 'RUNTIME_ERROR' || type === 'CONSOLE_WARN') {
      setLogs(prev => appendLog(prev, {
        type: type === 'RUNTIME_ERROR' ? 'error' : (type === 'CONSOLE_WARN' ? 'warn' : 'log'),
        content: payload,
        timestamp: Date.now()
      }));
    } else if (type === 'READY_SIGNAL' && debugMode) {
      addSystemLog('Sandbox Iframe Ready Signal Received via MessageChannel.');
    } else if (
      type === 'EXECUTION_COMPLETE'
      && environmentMode === 'fetch'
      && payload?.executionId === latestExecutionIdRef.current
    ) {
      onExecutionComplete?.();
    }
  }, [debugMode, addSystemLog, environmentMode, onExecutionComplete]);

  // Keep the latest message handler without recreating the transferred port.
  const kernelMessageRef = useRef(handleKernelMessage);
  useEffect(() => {
    kernelMessageRef.current = handleKernelMessage;
  }, [handleKernelMessage]);

  useEffect(() => () => {
    channelRef.current?.port1.close();
    channelRef.current = null;
  }, []);

  useEffect(() => {
    if (runTrigger > 0) {
        const execution = executionRef.current;
        setLogs([]);
        if (execution.debugMode) addSystemLog('Attempting to execute code...');
        if (iframeRef.current?.contentWindow) {
             if (execution.environmentMode === 'fetch') latestExecutionIdRef.current = runTrigger;
             const hasDomFixture = execution.environmentMode === 'dom'
               && (execution.fixtureHtml !== undefined || execution.fixtureCss !== undefined);
             if (hasDomFixture) {
               executeCodeInSandbox(iframeRef.current.contentWindow, execution.code, {
                 fixtureHtml: execution.fixtureHtml,
                 fixtureCss: execution.fixtureCss,
               });
             } else if (execution.environmentMode === 'fetch') {
               executeCodeInSandbox(iframeRef.current.contentWindow, execution.code, {
                 mockApi: execution.mockApi,
               }, runTrigger);
             } else {
               executeCodeInSandbox(iframeRef.current.contentWindow, execution.code);
             }
             if (execution.debugMode) addSystemLog('EXECUTE message dispatched.');
        } else if (execution.debugMode) {
             addSystemLog('FAILED: iframe.contentWindow is null.', 'error');
        }
    }
  }, [runTrigger, addSystemLog]);

  useEffect(() => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ type: 'THEME', mode: themeMode }, '*');
    }
  }, [themeMode]);

  // Live preview for HTML & CSS mode: re-render shortly after typing stops.
  // The Run button still works via the runTrigger effect above as a manual
  // re-render if the debounce misbehaves.
  useEffect(() => {
    if (!isStaticHtmlMode) return;
    const timer = setTimeout(() => {
      if (iframeRef.current?.contentWindow) {
        executeCodeInSandbox(iframeRef.current.contentWindow, code);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [code, isStaticHtmlMode]);

  const handleIframeLoad = () => {
    if (debugMode) addSystemLog('Iframe "onLoad" event fired.');
    if (!iframeRef.current?.contentWindow) return;
    channelRef.current?.port1.close();
    const channel = new MessageChannel();
    channelRef.current = channel;
    channel.port1.onmessage = (event) => kernelMessageRef.current(event.data);
    iframeRef.current.contentWindow.postMessage({ type: 'INIT_PORT' }, '*', [channel.port2]);
    iframeRef.current.contentWindow.postMessage({ type: 'THEME', mode: themeMode }, '*');
    if (isStaticHtmlMode) executeCodeInSandbox(iframeRef.current.contentWindow, code);
    if (debugMode) addSystemLog('Channel Ports initialized.');
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const relativeY = e.clientY - containerRect.top;
    const newHeight = containerRect.height - relativeY;
    setConsoleHeight(Math.max(30, Math.min(containerRect.height * 0.8, newHeight)));
  }, [isDragging]);

  const handleMouseUp = useCallback(() => setIsDragging(false), []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'row-resize';
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
    }
    return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);


  return (
    <PreviewContainer 
      themeMode={themeMode} 
      isReady={isStaticHtmlMode || runTrigger > 0}
      overlayMessage={isBlurred ? "Make your Prediction" : undefined}
    >
      <div ref={containerRef} className="w-full h-full flex flex-col relative">
        {!isHeadless && (
          <div className="flex-1 min-h-0 relative">
               <iframe
                  key={`${environmentMode}-${isPredictionMode}`}
                  ref={iframeRef}
                  srcDoc={sandboxHtml}
                  title="Code Output"
                  sandbox={SANDBOX_ATTRIBUTES} 
                  className={`w-full h-full border-none ${isDragging ? 'pointer-events-none' : ''}`}
                  onLoad={handleIframeLoad}
              />
          </div>
        )}

        {!isHeadless && !isStaticHtmlMode && (
          <div
              onMouseDown={handleMouseDown}
              className={`h-3 shrink-0 flex items-center justify-center cursor-row-resize z-10 hover:bg-blue-500 hover:text-white transition-colors ${themeMode === 'dark' ? 'bg-[#252526] text-gray-600 border-t border-b border-black/20' : 'bg-gray-100 text-gray-400 border-t border-b border-gray-200'}`}
          >
               <GripHorizontal className="w-3 h-3" />
          </div>
        )}

        {!isStaticHtmlMode && (
          <div style={{ height: isHeadless ? '100%' : consoleHeight }} className="shrink-0 min-h-0">
               <Console logs={logs} onClear={() => setLogs([])} themeMode={themeMode} />
          </div>
        )}

        {isHeadless && (
          <iframe
            key={`headless-${environmentMode}`}
            ref={iframeRef}
            srcDoc={sandboxHtml}
            title="Headless Execution"
            sandbox={SANDBOX_ATTRIBUTES} 
            className="hidden"
            onLoad={handleIframeLoad}
          />
        )}
      </div>
    </PreviewContainer>
  );
};
