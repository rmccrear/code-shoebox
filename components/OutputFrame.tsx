
import React, { useEffect, useRef, useState } from 'react';
import { createSandboxUrl, executeCodeInSandbox, SANDBOX_ATTRIBUTES } from '../runtime/runner';
import { ThemeMode, EnvironmentMode } from '../types';
import { PreviewContainer } from './PreviewContainer';

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
  const [sandboxSrc, setSandboxSrc] = useState<string>('');

  // Re-generate the sandbox URL whenever the Environment Mode or Prediction Mode changes.
  useEffect(() => {
    const url = createSandboxUrl(environmentMode, isPredictionMode);
    setSandboxSrc(url);

    // Cleanup: revoke the URL when the component unmounts or mode changes
    return () => {
        URL.revokeObjectURL(url);
    };
  }, [environmentMode, isPredictionMode]); 

  // Sync Theme
  useEffect(() => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ type: 'THEME', mode: themeMode }, '*');
    }
  }, [themeMode]);

  // Execute Code
  useEffect(() => {
    if (runTrigger > 0 && iframeRef.current?.contentWindow) {
      executeCodeInSandbox(iframeRef.current.contentWindow, code);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runTrigger]);

  const handleIframeLoad = () => {
    // Initial sync on load
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ type: 'THEME', mode: themeMode }, '*');
    }
  };

  return (
    <PreviewContainer 
      themeMode={themeMode} 
      isReady={runTrigger > 0}
      overlayMessage={isBlurred ? "Make your Prediction" : undefined}
    >
      <div className="w-full h-full relative">
        <iframe
          ref={iframeRef}
          src={sandboxSrc}
          title="Code Output"
          sandbox={SANDBOX_ATTRIBUTES} 
          className="w-full h-full border-none"
          onLoad={handleIframeLoad}
        />
      </div>
    </PreviewContainer>
  );
};
