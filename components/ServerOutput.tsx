
import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Send, Server, Clock, AlertCircle, XCircle, GripHorizontal } from 'lucide-react';
import { getSandboxHtml, executeCodeInSandbox, SANDBOX_ATTRIBUTES } from '../runtime/runner';
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
  debugMode?: boolean;
  onTriggerRun?: () => void;
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
  isBlurred = false,
  debugMode = false,
  onTriggerRun
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<MessageChannel | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  
  const [route, setRoute] = useState('/');
  const [method, setMethod] = useState('GET');
  const [response, setResponse] = useState<RequestResponse | null>(null);
  
  // New state for managing the "Smart Send" workflow
  const [pendingRequest, setPendingRequest] = useState<{method: string, url: string} | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [serverReady, setServerReady] = useState(false);
  const [runtimeError, setRuntimeError] = useState<string | null>(null);

  const [consoleHeight, setConsoleHeight] = useState(150);
  const [isDragging, setIsDragging] = useState(false);

  const addSystemLog = useCallback((msg: string) => {
    setLogs(prev => [...prev, { type: 'log', content: `[System] ${msg}`, timestamp: Date.now() }]);
  }, []);

  const clearConsole = useCallback(() => setLogs([]), []);

  const sendSimulatedRequest = useCallback((reqMethod: string, reqUrl: string) => {
      if (!channelRef.current) return;
      
      const requestPayload = {
        type: 'SIMULATE_REQUEST',
        payload: { method: reqMethod, url: reqUrl }
      };

      if (debugMode) addSystemLog(`Sending Request: ${reqMethod} ${reqUrl}`);
      channelRef.current.port1.postMessage(requestPayload);
  }, [debugMode, addSystemLog]);

  const handleSandboxMessage = useCallback((data: any) => {
    if (!data || typeof data !== 'object') return;
    const { type, payload } = data;
    
    switch (type) {
        case 'SERVER_READY':
            setServerReady(true);
            setRuntimeError(null); 
            addSystemLog('Server signaled ready.');
            
            // Critical: If we have a pending request, fire it now
            setPendingRequest(prev => {
                if (prev) {
                    sendSimulatedRequest(prev.method, prev.url);
                    return null; // Clear pending
                }
                return null;
            });
            break;
            
        case 'REQUEST_COMPLETE':
            setResponse(payload);
            setIsLoading(false);
            if (debugMode) addSystemLog(`Request Success: Status ${payload.status}`);
            break;
            
        case 'RUNTIME_ERROR':
            setRuntimeError(payload);
            setIsLoading(false);
            setPendingRequest(null); // Cancel any pending request
            setLogs(prev => [...prev, { type: 'error', content: payload, timestamp: Date.now() }]);
            setServerReady(false); 
            break;
            
        case 'CONSOLE_LOG':
        case 'CONSOLE_WARN':
            setLogs(prev => [...prev, {
                type: type === 'CONSOLE_WARN' ? 'warn' : 'log',
                content: payload,
                timestamp: Date.now()
            }]);
            break;
            
        case 'CONSOLE_CLEAR':
            clearConsole();
            break;
            
        case 'READY_SIGNAL':
            if (debugMode) addSystemLog('Sandbox established MessageChannel port.');
            break;
    }
  }, [debugMode, addSystemLog, clearConsole, sendSimulatedRequest]);

  // Primary MessageChannel listener
  useEffect(() => {
    const channel = new MessageChannel();
    channelRef.current = channel;
    
    channel.port1.onmessage = (event) => {
        handleSandboxMessage(event.data);
    };

    return () => {
        channel.port1.close();
        channelRef.current = null;
    };
  }, [handleSandboxMessage]);

  // Fallback Window listener
  useEffect(() => {
      const globalListener = (event: MessageEvent) => {
          if (event.data && typeof event.data === 'object' && event.data.type) {
              handleSandboxMessage(event.data);
          }
      };
      window.addEventListener('message', globalListener);
      return () => window.removeEventListener('message', globalListener);
  }, [handleSandboxMessage]);

  const sandboxHtml = useMemo(() => {
    return getSandboxHtml(environmentMode);
  }, [environmentMode]);

  // Execution Effect: Triggers when runTrigger changes (from props)
  useEffect(() => {
    if (runTrigger > 0 && iframeRef.current?.contentWindow) {
      setServerReady(false);
      setResponse(null);
      setRuntimeError(null);
      setLogs([]);
      
      // If runTrigger incremented but we don't have a pending request 
      // (e.g. triggered via keyboard shortcut Cmd+Enter), 
      // we assume the user wants to run the current input.
      setPendingRequest(prev => {
          if (!prev) {
              setIsLoading(true);
              return { method, url: route };
          }
          return prev;
      });

      if (debugMode) addSystemLog('Executing server code...');
      executeCodeInSandbox(iframeRef.current.contentWindow, code);
    }
  }, [runTrigger, code, debugMode, addSystemLog, method, route]); // Depend on method/route to capture current inputs for Cmd+Enter

  useEffect(() => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ type: 'THEME', mode: themeMode }, '*');
    }
  }, [themeMode]);

  const handleIframeLoad = () => {
    if (debugMode) addSystemLog('Server Iframe loaded.');
    if (iframeRef.current?.contentWindow && channelRef.current) {
        iframeRef.current.contentWindow.postMessage({ type: 'INIT_PORT' }, '*', [channelRef.current.port2]);
        iframeRef.current.contentWindow.postMessage({ type: 'THEME', mode: themeMode }, '*');
    }
  };

  const handleSendClick = () => {
      // 1. Set UI to loading state
      setIsLoading(true);
      setResponse(null);
      setRuntimeError(null);
      
      // 2. Queue the request to be sent once server is ready
      setPendingRequest({ method, url: route });

      // 3. Trigger the code execution (which will eventually fire SERVER_READY)
      if (onTriggerRun) {
          onTriggerRun();
      } else {
          console.warn("ServerOutput: onTriggerRun prop missing");
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
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // For visual "Ready" state, we check if we have results or if we are idle
  const isReady = runTrigger > 0;

  return (
    <div className="flex flex-col h-full w-full gap-2">
      <div className={`flex items-center gap-2 p-2 rounded-md border transition-colors ${themeMode === 'dark' ? 'bg-[#252526] border-white/10' : 'bg-white border-gray-200'}`}>
         <div className={`px-3 py-1.5 rounded text-xs font-bold tracking-wider ${themeMode === 'dark' ? 'bg-blue-900/50 text-blue-400' : 'bg-blue-100 text-blue-700'}`}>{method}</div>
         <input 
            type="text" 
            value={route} 
            onChange={(e) => setRoute(e.target.value)} 
            placeholder="/api/inventory" 
            className={`flex-1 bg-transparent border-none outline-none text-sm font-mono ${themeMode === 'dark' ? 'text-white placeholder-gray-600' : 'text-gray-800 placeholder-gray-400'}`} 
            onKeyDown={(e) => e.key === 'Enter' && handleSendClick()}
         />
         <Button 
            onClick={handleSendClick} 
            disabled={isLoading || isBlurred} 
            className="!py-1 !px-3 h-8 text-xs"
            title="Restart Server & Send Request"
         >
            {isLoading ? (pendingRequest ? 'Starting...' : 'Sending...') : 'Send'}
         </Button>
      </div>

      <PreviewContainer themeMode={themeMode} isReady={isReady} overlayMessage={isBlurred ? "Make your Prediction" : undefined}>
        <div ref={containerRef} className="flex flex-col h-full relative">
            {isLoading && (
                 <div className="absolute top-2 right-2 z-10 flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-xs shadow-lg backdrop-blur-md">
                    <Clock className="w-3 h-3 animate-pulse" />
                    <span>{pendingRequest ? 'Starting Server...' : 'Processing...'}</span>
                 </div>
            )}
            <div className={`flex-1 overflow-auto p-4 font-mono text-sm ${themeMode === 'dark' ? 'bg-[#1e1e1e]' : 'bg-gray-50'}`}>
                {runtimeError ? (
                    <div className="p-4 border border-red-500/20 rounded bg-red-500/5 text-red-400">
                        <div className="flex items-center gap-2 text-red-500 font-bold mb-2"><AlertCircle className="w-4 h-4" /><span>Runtime Error</span></div>
                        <pre className="whitespace-pre-wrap break-all">{runtimeError}</pre>
                    </div>
                ) : response ? (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="flex items-center justify-between mb-4 pb-2 border-b border-dashed border-gray-500/20">
                            <span className={`font-bold ${response.status < 300 ? 'text-green-500' : 'text-red-500'}`}>{response.status} {response.status === 200 ? 'OK' : ''}</span>
                        </div>
                        <pre className={`${themeMode === 'dark' ? 'text-blue-300' : 'text-blue-700'}`}>{JSON.stringify(response.data, null, 2)}</pre>
                    </div>
                ) : <div className="h-full flex flex-col items-center justify-center opacity-20"><Server className="w-12 h-12 mb-2" /><p>Server Standby</p></div>}
            </div>
            <div onMouseDown={handleMouseDown} className={`h-3 shrink-0 flex items-center justify-center cursor-row-resize ${themeMode === 'dark' ? 'bg-[#252526] text-gray-600 border-t border-b border-black/20' : 'bg-gray-100 text-gray-400 border-t border-b border-gray-200'}`}><GripHorizontal className="w-3 h-3" /></div>
            <div style={{ height: consoleHeight }} className="shrink-0 min-h-0"><Console logs={logs} onClear={clearConsole} themeMode={themeMode} /></div>
            <iframe 
                key={`server-${environmentMode}`}
                ref={iframeRef} 
                srcDoc={sandboxHtml} 
                title="Server Execution" 
                sandbox={SANDBOX_ATTRIBUTES} 
                className="hidden" 
                onLoad={handleIframeLoad} 
            />
        </div>
      </PreviewContainer>
    </div>
  );
};
