import React, { useEffect, useRef, useState } from 'react';
import { createSandboxUrl, executeCodeInSandbox, SANDBOX_ATTRIBUTES } from '../runtime/runner';
import { ThemeMode, EnvironmentMode } from '../types';
import { PreviewContainer } from './PreviewContainer';

interface OutputFrameProps {
  runTrigger: number;
  code: string;
  themeMode: ThemeMode;
  environmentMode: EnvironmentMode;
}

export const OutputFrame: React.FC<OutputFrameProps> = ({ runTrigger, code, themeMode, environmentMode }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [sandboxSrc, setSandboxSrc] = useState<string>('');

  // Re-generate the sandbox URL whenever the Environment Mode changes.
  // We do NOT depend on runTrigger here, because we don't want to reload the iframe
  // when the user clicks Run.
  // Note: Full resets (Start Over) are handled by the parent component (App.tsx) 
  // forcing a re-mount of this component via the 'key' prop.
  useEffect(() => {
    const url = createSandboxUrl(environmentMode);
    setSandboxSrc(url);

    // Cleanup: revoke the URL when the component unmounts or mode changes
    return () => {
        URL.revokeObjectURL(url);
    };
  }, [environmentMode]); 

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
    <PreviewContainer themeMode={themeMode} isReady={runTrigger > 0}>
      <iframe
        ref={iframeRef}
        src={sandboxSrc}
        title="Code Output"
        sandbox={SANDBOX_ATTRIBUTES} 
        className="w-full h-full border-none"
        onLoad={handleIframeLoad}
      />
    </PreviewContainer>
  );
};