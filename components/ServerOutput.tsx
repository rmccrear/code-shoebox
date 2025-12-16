
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Send, Server, Clock, AlertCircle, XCircle, GripHorizontal } from 'lucide-react';
import { createSandboxUrl, executeCodeInSandbox, SANDBOX_ATTRIBUTES } from '../runtime/runner';
import { ThemeMode, EnvironmentMode } from '../types';
import { PreviewContainer } from './PreviewContainer';
import { Button } from './Button';
import { Console, LogEntry } from './Console';

interface ServerOutputProps {
  runTrigger: number;
  code: string;
  themeMode: ThemeMode;
  environmentMode: EnvironmentMode;
  isBlurred?: boolean;
}

interface RequestResponse {
  status: number;
  data: any;
  error?: string;
  headers?: Record<string, string>;
}

export const ServerOutput: React.FC<ServerOutputProps> = ({
  runTrigger,
  code,
  themeMode,
  environmentMode,
  isBlurred = false
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [sandboxSrc, setSandboxSrc] = useState<string>('');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  
  // Postman UI State
  const [route, setRoute] = useState('/');
  const [method, setMethod] = useState('GET');
  const [response, setResponse] = useState<RequestResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [serverReady, setServerReady] = useState(false);
  const [runtimeError, setRuntimeError] = useState<string | null>(null);

  // Console Resize State
  const [consoleHeight, setConsoleHeight] = useState(150);
  const [isDragging, setIsDragging] = useState(false);

  // Setup Sandbox
  useEffect(() => {
    const url = createSandboxUrl(environmentMode);
    setSandboxSrc(url);
    return () => URL.revokeObjectURL(url);
  }, [environmentMode]);

  // Handle Run Logic (Execute code in sandbox)
  useEffect(() => {
    if (runTrigger > 0 && iframeRef.current?.contentWindow) {
      setServerReady(false); // Reset ready state
      setResponse(null);     // Clear previous output
      setRuntimeError(null); // Clear errors
      setLogs([]);           // Clear console
      executeCodeInSandbox(iframeRef.current.contentWindow, code);
    }
  }, [runTrigger, code]);

  // Sync Theme
  useEffect(() => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ type: 'THEME', mode: themeMode }, '*');
    }
  }, [themeMode]);

  // Listen for messages from sandbox
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const { type, payload } = event.data;
      
      if (type === 'SERVER_READY') {
        setServerReady(true);
        setRuntimeError(null); 
        setLogs(prev => [...prev, { type: 'log', content: '[System] Server listening...', timestamp: Date.now() }]);
      }
      else if (type === 'REQUEST_COMPLETE') {
        setResponse(payload);
        setIsLoading(false);
      }
      else if (type === 'RUNTIME_ERROR') {
        setRuntimeError(payload);
        setIsLoading(false);
        setLogs(prev => [...prev, { type: 'error', content: payload, timestamp: Date.now() }]);
        if (!serverReady) setServerReady(false); 
      }
      else if (type === 'CONSOLE_LOG' || type === 'CONSOLE_WARN') {
         setLogs(prev => [...prev, {
             type: type === 'CONSOLE_WARN' ? 'warn' : 'log',
             content: payload,
             timestamp: Date.now()
         }]);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [serverReady]);

  const sendRequest = () => {
    if (!serverReady) return;
    setIsLoading(true);
    setResponse(null);
    setRuntimeError(null);
    
    // Simulate network delay for realism
    setTimeout(() => {
        iframeRef.current?.contentWindow?.postMessage({
            type: 'SIMULATE_REQUEST',
            payload: { method, url: route }
        }, '*');
    }, 300);
  };

  // --- Resize Logic ---
  
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const relativeY = e.clientY - containerRect.top;
    const newHeight = containerRect.height - relativeY;
    const clampedHeight = Math.max(30, Math.min(containerRect.height * 0.8, newHeight));
    setConsoleHeight(clampedHeight);
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'row-resize';
      document.body.style.userSelect = 'none';
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }
    return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const isReady = runTrigger > 0;

  return (
    <div className="flex flex-col h-full w-full gap-2">
      {/* Postman Controls */}
      <div className={`
        flex items-center gap-2 p-2 rounded-md border transition-colors
        ${themeMode === 'dark' ? 'bg-[#252526] border-white/10' : 'bg-white border-gray-200'}
      `}>
         <div className={`
            px-3 py-1.5 rounded text-xs font-bold tracking-wider
            ${themeMode === 'dark' ? 'bg-blue-900/50 text-blue-400' : 'bg-blue-100 text-blue-700'}
         `}>
            GET
         </div>
         <input 
            type="text" 
            value={route}
            onChange={(e) => setRoute(e.target.value)}
            placeholder="/api/users"
            className={`
                flex-1 bg-transparent border-none outline-none text-sm font-mono
                ${themeMode === 'dark' ? 'text-white placeholder-gray-600' : 'text-gray-800 placeholder-gray-400'}
            `}
         />
         <Button 
            onClick={sendRequest} 
            disabled={!isReady || isLoading || !serverReady || !!runtimeError}
            className="!py-1 !px-3 h-8 text-xs"
         >
            {isLoading ? 'Sending...' : 'Send'}
            {!isLoading && <Send className="w-3 h-3 ml-1" />}
         </Button>
      </div>

      <PreviewContainer 
        themeMode={themeMode} 
        isReady={isReady}
        overlayMessage={isBlurred ? "Make your Prediction" : undefined}
      >
        <div ref={containerRef} className="flex flex-col h-full relative">
            
            {/* Server Status Indicators (Overlay) */}
            {isReady && !serverReady && !runtimeError && !isBlurred && (
                 <div className="absolute top-2 right-2 z-10 flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-xs">
                    <Clock className="w-3 h-3 animate-pulse" />
                    <span>Starting Server...</span>
                 </div>
            )}
            {isReady && serverReady && !runtimeError && !isBlurred && (
                 <div className="absolute top-2 right-2 z-10 flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-500 text-xs">
                    <Server className="w-3 h-3" />
                    <span>Listening on :3000</span>
                 </div>
            )}
            
            {/* Error Indicator (Overlay) */}
            {isReady && runtimeError && !isBlurred && (
                 <div className="absolute top-2 right-2 z-10 flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-xs">
                    <XCircle className="w-3 h-3" />
                    <span>Server Error</span>
                 </div>
            )}

            {/* Response Viewer (Top Pane) */}
            <div className={`flex-1 overflow-auto p-4 font-mono text-sm ${themeMode === 'dark' ? 'bg-[#1e1e1e]' : 'bg-gray-50'}`}>
                {runtimeError ? (
                    <div className="animate-in fade-in zoom-in-95 duration-300 p-4 border border-red-500/20 rounded bg-red-500/5">
                        <div className="flex items-center gap-2 text-red-500 font-bold mb-2">
                            <AlertCircle className="w-4 h-4" />
                            <span>Runtime Error</span>
                        </div>
                        <pre className="whitespace-pre-wrap break-all text-red-400 opacity-90">
                            {runtimeError}
                        </pre>
                    </div>
                ) : response ? (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="flex items-center justify-between mb-4 pb-2 border-b border-dashed border-gray-500/20">
                            <span className={`font-bold ${response.status >= 200 && response.status < 300 ? 'text-green-500' : 'text-red-500'}`}>
                                {response.status} {response.status === 200 ? 'OK' : 'Error'}
                            </span>
                            <span className="text-xs opacity-50">{(Math.random() * 40 + 10).toFixed(0)}ms</span>
                        </div>
                        <pre className={`whitespace-pre-wrap break-all ${themeMode === 'dark' ? 'text-blue-300' : 'text-blue-700'}`}>
                            {JSON.stringify(response.data, null, 2)}
                        </pre>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center opacity-20 select-none">
                        <Server className="w-12 h-12 mb-2" />
                        <p>{runtimeError ? 'Fix errors to restart server' : 'No response data'}</p>
                    </div>
                )}
            </div>

            {/* Resizer */}
            <div 
                onMouseDown={handleMouseDown}
                className={`
                    h-3 shrink-0 flex items-center justify-center cursor-row-resize z-10 hover:bg-blue-500 hover:text-white transition-colors
                    ${themeMode === 'dark' ? 'bg-[#252526] text-gray-600 border-t border-b border-black/20' : 'bg-gray-100 text-gray-400 border-t border-b border-gray-200'}
                    ${isDragging ? '!bg-blue-600 !text-white' : ''}
                `}
            >
                 <GripHorizontal className="w-3 h-3" />
            </div>

            {/* Console Log Area */}
            <div style={{ height: consoleHeight }} className="shrink-0 min-h-0">
                 <Console 
                    logs={logs} 
                    onClear={() => setLogs([])} 
                    themeMode={themeMode} 
                />
            </div>

            {/* Hidden Iframe for execution */}
            <iframe
                ref={iframeRef}
                src={sandboxSrc}
                title="Server Execution"
                sandbox={SANDBOX_ATTRIBUTES} 
                className="hidden"
            />
        </div>
      </PreviewContainer>
    </div>
  );
};
