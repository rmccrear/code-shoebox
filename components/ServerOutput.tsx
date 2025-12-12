
import React, { useEffect, useRef, useState } from 'react';
import { Send, Server, Clock, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { createSandboxUrl, executeCodeInSandbox, SANDBOX_ATTRIBUTES } from '../runtime/runner';
import { ThemeMode, EnvironmentMode } from '../types';
import { PreviewContainer } from './PreviewContainer';
import { Button } from './Button';

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
  const [sandboxSrc, setSandboxSrc] = useState<string>('');
  
  // Postman UI State
  const [route, setRoute] = useState('/');
  const [method, setMethod] = useState('GET');
  const [response, setResponse] = useState<RequestResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [serverReady, setServerReady] = useState(false);
  const [runtimeError, setRuntimeError] = useState<string | null>(null);

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
        setRuntimeError(null); // Clear any startup errors if server manages to signal ready
      }
      if (type === 'REQUEST_COMPLETE') {
        setResponse(payload);
        setIsLoading(false);
      }
      if (type === 'RUNTIME_ERROR') {
        setRuntimeError(payload);
        setIsLoading(false);
        // If error happens during startup, server might not be ready
        if (!serverReady) setServerReady(false); 
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

  const isReady = runTrigger > 0;

  return (
    <div className="flex flex-col h-full w-full gap-2">
      {/* Postman Controls - Rendered OUTSIDE the iframe container */}
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
        <div className="flex flex-col h-full relative">
            
            {/* Server Status Indicator (Overlay) */}
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

            {/* Response Viewer or Error Display */}
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
                        <p className="mt-4 text-xs text-gray-500">
                            Check the console log below for more details.
                        </p>
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

            {/* Hidden Iframe (Kept for console logs) */}
            <div className="h-1/3 border-t border-gray-500/20 relative">
                 <iframe
                    ref={iframeRef}
                    src={sandboxSrc}
                    title="Server Console"
                    sandbox={SANDBOX_ATTRIBUTES} 
                    className="w-full h-full border-none"
                    // We don't need onLoad sync here as we do it in useEffect
                  />
            </div>
        </div>
      </PreviewContainer>
    </div>
  );
};
