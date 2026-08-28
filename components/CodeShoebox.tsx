
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { CodingEnvironment } from './CodingEnvironment';
import { CodeShoeboxProps } from '../types';

export const CodeShoebox: React.FC<CodeShoeboxProps> = ({
  code,
  onCodeChange,
  environmentMode,
  fixtureHtml,
  fixtureCss,
  mediaAssets,
  enableEmmet = false,
  mockApi,
  theme,
  themeMode,
  sessionId = 0,
  prediction_prompt,
  debugMode = false
}) => {
  const [runTrigger, setRunTrigger] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const runFallbackRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setRunTrigger(0);
    setIsRunning(false);
    if (runFallbackRef.current) clearTimeout(runFallbackRef.current);
  }, [sessionId]);

  useEffect(() => () => {
    if (runFallbackRef.current) clearTimeout(runFallbackRef.current);
  }, []);

  const handleRun = () => {
    setIsRunning(true);
    setRunTrigger(prev => prev + 1);

    if (runFallbackRef.current) clearTimeout(runFallbackRef.current);
    runFallbackRef.current = setTimeout(() => {
      setIsRunning(false);
      runFallbackRef.current = null;
    }, environmentMode === 'fetch' ? 10000 : 500);
  };

  const handleExecutionComplete = () => {
    if (runFallbackRef.current) clearTimeout(runFallbackRef.current);
    runFallbackRef.current = null;
    setIsRunning(false);
  };

  const themeStyles = useMemo(() => {
    const colors = themeMode === 'dark' ? theme.dark : theme.light;
    const defaultBg = themeMode === 'dark' ? '220 13% 18%' : '0 0% 98%';
    const defaultFg = themeMode === 'dark' ? '0 0% 95%' : '220 13% 18%';

    return {
      '--primary': colors.primary,
      '--primary-foreground': colors.primaryForeground,
      '--ring': colors.ring,
      '--sidebar-primary': colors.sidebarPrimary,
      '--sidebar-primary-foreground': colors.sidebarPrimaryForeground,
      '--sidebar-ring': colors.sidebarRing,
      '--background': colors.background || defaultBg,
      '--foreground': colors.foreground || defaultFg,
    } as React.CSSProperties;
  }, [themeMode, theme]);

  return (
    <div 
      className="flex flex-col h-full w-full transition-colors duration-300 bg-[hsl(var(--background))] text-[hsl(var(--foreground))]"
      style={themeStyles}
    >
      <CodingEnvironment 
        key={sessionId}
        sessionId={sessionId}
        code={code}
        onChange={onCodeChange}
        onRun={handleRun}
        isRunning={isRunning}
        runTrigger={runTrigger}
        themeMode={themeMode}
        environmentMode={environmentMode}
        fixtureHtml={fixtureHtml}
        fixtureCss={fixtureCss}
        mediaAssets={mediaAssets}
        enableEmmet={enableEmmet}
        mockApi={mockApi}
        predictionPrompt={prediction_prompt}
        debugMode={debugMode}
        onExecutionComplete={handleExecutionComplete}
      />
    </div>
  );
};
