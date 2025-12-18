
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
  const channelRef = useRef<MessageChannel | null>(null);
  const [sandboxSrc, setSandboxSrc] = useState<string>('');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  
  const [route, setRoute] = useState('/');
  const [method, setMethod] = useState('GET');
  const [response, setResponse] = useState<RequestResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [serverReady, setServerReady] = useState(false);
  const [runtimeError, setRuntimeError] = useState<string | null>(null);

  const [consoleHeight, setConsoleHeight] = useState(150);
  const [isDragging, setIsDragging] = useState(false);

  // Initialize MessageChannel
  useEffect(() => {
    channelRef.current = new MessageChannel();
    
    channelRef.current.port1.onmessage = (event) => {
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

    return () => {
        if (channelRef.current) channelRef.current.port1.close();
    };
  }, []);

  useEffect(() => {
    const url = createSandboxUrl(environmentMode);
    setSandboxSrc(url);
    return () => URL.revokeObjectURL(url);
  }, [environmentMode]);

  useEffect(() => {
    if (runTrigger > 0 && iframeRef.current?.contentWindow) {
      setServerReady(false);
      setResponse(null);
      setRuntimeError(null);
      setLogs([]);
      executeCodeInSandbox(iframeRef.current.contentWindow, code);
    }
  }, [runTrigger, code]);

  useEffect(() => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ type: 'THEME', mode: themeMode }, '*');
    }
  }, [themeMode]);

  const handleIframeLoad = () => {
    if (iframeRef.current?.contentWindow && channelRef.current) {
        iframeRef.current.contentWindow.postMessage({ type: 'INIT_PORT' }, '*', [channelRef.current.port2]);
        iframeRef.current.contentWindow.postMessage({ type: 'THEME', mode: themeMode }, '*');
    }
  };

  const sendRequest = () => {
    if (!serverReady || !channelRef.current) return;
    setIsLoading(true);
    setResponse(null);
    setRuntimeError(null);
    
    // Send request via the private port
    channelRef.current.port1.postMessage({
        type: 'SIMULATE_REQUEST',
        payload: { method, url: route }
    });
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
    const clampedHeight = Math.max(30, Math.min(containerRect.height * 0.8, newHeight));
    setConsoleHeight(clampedHeight);
  }, [isDragging]);

  const handleMouseUp = useCallback(() => setIsDragging(false), []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'row-resize';
      document.body.style.userSelect = 'none';
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const isReady = runTrigger > 0;

  return (
    <div className="flex flex-col h-full w-full gap-2">
      <div className={`flex items-center gap-2 p-2 rounded-md border transition-colors ${themeMode === 'dark' ? 'bg-[#252526] border-white/10' : 'bg-white border-gray-200'}`}>
         <div className={`px-3 py-1.5 rounded text-xs font-bold tracking-wider ${themeMode === 'dark' ? 'bg-blue-900/50 text-blue-400' : 'bg-blue-100 text-blue-700'}`}>GET</div>
         <input type="text" value={route} onChange={(e) => setRoute(e.target.value)} placeholder="/api/users" className={`flex-1 bg-transparent border-none outline-none text-sm font-mono ${themeMode === 'dark' ? 'text-white placeholder-gray-600' : 'text-gray-800 placeholder-gray-400'}`} />
         <Button onClick={sendRequest} disabled={!isReady || isLoading || !serverReady || !!runtimeError} className="!py-1 !px-3 h-8 text-xs">
            {isLoading ? 'Sending...' : 'Send'}
         </Button>
      </div>

      <PreviewContainer themeMode={themeMode} isReady={isReady} overlayMessage={isBlurred ? "Make your Prediction" : undefined}>
        <div ref={containerRef} className="flex flex-col h-full relative">
            {isReady && !serverReady && !runtimeError && !isBlurred && (
                 <div className="absolute top-2 right-2 z-10 flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-xs">
                    <Clock className="w-3 h-3 animate-pulse" />
                    <span>Starting Server...</span>
                 </div>
            )}
            <div className={`flex-1 overflow-auto p-4 font-mono text-sm ${themeMode === 'dark' ? 'bg-[#1e1e1e]' : 'bg-gray-50'}`}>
                {runtimeError ? (
                    <div className="p-4 border border-red-500/20 rounded bg-red-500/5 text-red-400">
                        <div className="flex items-center gap-2 text-red-500 font-bold mb-2"><AlertCircle className="w-4 h-4" /><span>Runtime Error</span></div>
                        <pre className="whitespace-pre-wrap break-all">{runtimeError}</pre>
                    </div>
                ) : response ? (
                    <div>
                        <div className="flex items-center justify-between mb-4 pb-2 border-b border-dashed border-gray-500/20">
                            <span className={`font-bold ${response.status < 300 ? 'text-green-500' : 'text-red-500'}`}>{response.status}</span>
                        </div>
                        <pre className={`${themeMode === 'dark' ? 'text-blue-300' : 'text-blue-700'}`}>{JSON.stringify(response.data, null, 2)}</pre>
                    </div>
                ) : <div className="h-full flex flex-col items-center justify-center opacity-20"><Server className="w-12 h-12 mb-2" /><p>Ready</p></div>}
            </div>
            <div onMouseDown={handleMouseDown} className={`h-3 shrink-0 flex items-center justify-center cursor-row-resize ${themeMode === 'dark' ? 'bg-[#252526] text-gray-600 border-t border-b border-black/20' : 'bg-gray-100 text-gray-400 border-t border-b border-gray-200'}`}><GripHorizontal className="w-3 h-3" /></div>
            <div style={{ height: consoleHeight }} className="shrink-0 min-h-0"><Console logs={logs} onClear={() => setLogs([])} themeMode={themeMode} /></div>
            <iframe ref={iframeRef} src={sandboxSrc} title="Server Execution" sandbox={SANDBOX_ATTRIBUTES} className="hidden" onLoad={handleIframeLoad} />
        </div>
      </PreviewContainer>
    </div>
  );
};
