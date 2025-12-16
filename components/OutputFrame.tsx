
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createSandboxUrl, executeCodeInSandbox, SANDBOX_ATTRIBUTES } from '../runtime/runner';
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
}

export const OutputFrame: React.FC<OutputFrameProps> = ({ 
  runTrigger, 
  code, 
  themeMode, 
  environmentMode,
  isBlurred = false,
  isPredictionMode = false
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [sandboxSrc, setSandboxSrc] = useState<string>('');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  
  // Resizable Console State
  const [consoleHeight, setConsoleHeight] = useState(150); // Default height in pixels
  const [isDragging, setIsDragging] = useState(false);

  // Re-generate the sandbox URL whenever the Environment Mode or Prediction Mode changes.
  useEffect(() => {
    const url = createSandboxUrl(environmentMode, isPredictionMode);
    setSandboxSrc(url);

    // Cleanup: revoke the URL when the component unmounts or mode changes
    return () => {
        URL.revokeObjectURL(url);
    };
  }, [environmentMode, isPredictionMode]); 

  // Reset logs when run triggers
  useEffect(() => {
    if (runTrigger > 0) {
        setLogs([]);
        if (iframeRef.current?.contentWindow) {
             executeCodeInSandbox(iframeRef.current.contentWindow, code);
        }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runTrigger]);

  // Sync Theme
  useEffect(() => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ type: 'THEME', mode: themeMode }, '*');
    }
  }, [themeMode]);

  // Message Listener (Console logs from Iframe)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
        // Ensure message is from our iframe
        // Note: checking source is tricky with multiple frames, but we can rely on data structure
        const { type, payload } = event.data;
        
        if (type === 'CONSOLE_LOG' || type === 'RUNTIME_ERROR' || type === 'CONSOLE_WARN') {
             setLogs(prev => [...prev, {
                 type: type === 'RUNTIME_ERROR' ? 'error' : (type === 'CONSOLE_WARN' ? 'warn' : 'log'),
                 content: payload,
                 timestamp: Date.now()
             }]);
        }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleIframeLoad = () => {
    // Initial sync on load
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ type: 'THEME', mode: themeMode }, '*');
    }
  };

  // --- Resize Logic ---
  
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    // Calculate new height: Total Height - Mouse Y relative to container top
    // Since console is at bottom, we check distance from bottom
    const relativeY = e.clientY - containerRect.top;
    const newHeight = containerRect.height - relativeY;

    // Clamp height (min 30px, max 80% of container)
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


  return (
    <PreviewContainer 
      themeMode={themeMode} 
      isReady={runTrigger > 0}
      overlayMessage={isBlurred ? "Make your Prediction" : undefined}
    >
      <div 
        ref={containerRef}
        className="w-full h-full flex flex-col relative"
      >
        {/* Iframe Area */}
        <div className="flex-1 min-h-0 relative">
             <iframe
                ref={iframeRef}
                src={sandboxSrc}
                title="Code Output"
                sandbox={SANDBOX_ATTRIBUTES} 
                className={`w-full h-full border-none ${isDragging ? 'pointer-events-none' : ''}`}
                onLoad={handleIframeLoad}
            />
        </div>

        {/* Resizer Handle */}
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

        {/* Console Area */}
        <div style={{ height: consoleHeight }} className="shrink-0 min-h-0">
             <Console 
                logs={logs} 
                onClear={() => setLogs([])} 
                themeMode={themeMode} 
            />
        </div>
      </div>
    </PreviewContainer>
  );
};
