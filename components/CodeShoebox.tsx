
import React, { useState, useMemo, useEffect } from 'react';
import { CodingEnvironment } from './CodingEnvironment';
import { CodeShoeboxProps } from '../types';

export const CodeShoebox: React.FC<CodeShoeboxProps> = ({
  code,
  onCodeChange,
  environmentMode,
  theme,
  themeMode,
  sessionId = 0,
  prediction_prompt,
  debugMode = false
}) => {
  const [runTrigger, setRunTrigger] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  useEffect(() => {
    setRunTrigger(0);
    setIsRunning(false);
  }, [sessionId]);

  const handleRun = () => {
    setIsRunning(true);
    setRunTrigger(prev => prev + 1);
    
    setTimeout(() => {
      setIsRunning(false);
    }, 500);
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
        predictionPrompt={prediction_prompt}
        debugMode={debugMode}
      />
    </div>
  );
};
