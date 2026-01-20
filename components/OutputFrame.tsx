
import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { getSandboxHtml, executeCodeInSandbox, SANDBOX_ATTRIBUTES } from '../runtime/runner';
import { ThemeMode, EnvironmentMode } from '../types';
import { PreviewContainer } from './PreviewContainer';
import { Console, LogEntry } from './Console';
import { GripHorizontal } from 'lucide-react';

interface OutputFrameProps {
  runTrigger: number;
  code: string;
  themeMode: ThemeMode;
  environmentMode: EnvironmentMode;
  isBlurred?: boolean;
  isPredictionMode?: boolean;
  debugMode?: boolean;
}

export const OutputFrame: React.FC<OutputFrameProps> = ({ 
  runTrigger, 
  code, 
  themeMode, 
  environmentMode,
  isBlurred = false,
  isPredictionMode = false,
  debugMode = false
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<MessageChannel | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  
  const [consoleHeight, setConsoleHeight] = useState(150); 
  const [isDragging, setIsDragging] = useState(false);

  const isHeadless = environmentMode === 'node-js' || environmentMode === 'node-ts';

  const addSystemLog = useCallback((msg: string, type: 'log' | 'error' | 'warn' = 'log') => {
    setLogs(prev => [...prev, {
        type,
        content: `[System] ${msg}`,
        timestamp: Date.now()
    }]);
  }, []);

  // Use sessionId implicitly via key on the iframe component in CodingEnvironment if possible,
  // or here to force re-render on mode change.
  const sandboxHtml = useMemo(() => {
    if (debugMode) addSystemLog(`Generating Sandbox HTML for mode: ${environmentMode}`);
    return getSandboxHtml(environmentMode, isPredictionMode);
  }, [environmentMode, isPredictionMode, debugMode, addSystemLog]);

  useEffect(() => {
    channelRef.current = new MessageChannel();
    
    channelRef.current.port1.onmessage = (event) => {
        const { type, payload } = event.data;
        if (type === 'CONSOLE_LOG' || type === 'RUNTIME_ERROR' || type === 'CONSOLE_WARN') {
             setLogs(prev => [...prev, {
                 type: type === 'RUNTIME_ERROR' ? 'error' : (type === 'CONSOLE_WARN' ? 'warn' : 'log'),
                 content: payload,
                 timestamp: Date.now()
             }]);
        }
        else if (type === 'READY_SIGNAL' && debugMode) {
             addSystemLog('Sandbox Iframe Ready Signal Received via MessageChannel.');
        }
    };

    return () => {
        if (channelRef.current) {
            channelRef.current.port1.close();
        }
    };
  }, [debugMode, addSystemLog]);

  useEffect(() => {
    if (runTrigger > 0) {
        setLogs([]);
        if (debugMode) addSystemLog('Attempting to execute code...');
        if (iframeRef.current?.contentWindow) {
             executeCodeInSandbox(iframeRef.current.contentWindow, code);
             if (debugMode) addSystemLog('EXECUTE message dispatched.');
        } else if (debugMode) {
             addSystemLog('FAILED: iframe.contentWindow is null.', 'error');
        }
    }
  }, [runTrigger, code, debugMode, addSystemLog]);

  useEffect(() => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ type: 'THEME', mode: themeMode }, '*');
    }
  }, [themeMode]);

  const handleIframeLoad = () => {
    if (debugMode) addSystemLog('Iframe "onLoad" event fired.');
    if (iframeRef.current?.contentWindow && channelRef.current) {
      iframeRef.current.contentWindow.postMessage({ type: 'INIT_PORT' }, '*', [channelRef.current.port2]);
      iframeRef.current.contentWindow.postMessage({ type: 'THEME', mode: themeMode }, '*');
      if (debugMode) addSystemLog('Channel Ports initialized.');
    }
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
      isReady={runTrigger > 0}
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

        {!isHeadless && (
          <div 
              onMouseDown={handleMouseDown}
              className={`h-3 shrink-0 flex items-center justify-center cursor-row-resize z-10 hover:bg-blue-500 hover:text-white transition-colors ${themeMode === 'dark' ? 'bg-[#252526] text-gray-600 border-t border-b border-black/20' : 'bg-gray-100 text-gray-400 border-t border-b border-gray-200'}`}
          >
               <GripHorizontal className="w-3 h-3" />
          </div>
        )}

        <div style={{ height: isHeadless ? '100%' : consoleHeight }} className="shrink-0 min-h-0">
             <Console logs={logs} onClear={() => setLogs([])} themeMode={themeMode} />
        </div>

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
