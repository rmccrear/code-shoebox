
import React, { useState, useMemo, useEffect } from 'react';
import { CodingEnvironment } from './CodingEnvironment';
import { Theme } from '../theme';
import { ThemeMode, EnvironmentMode } from '../types';

export interface CodeShoeboxProps {
  /** The current code to display in the editor */
  code: string;
  /** Callback when code changes */
  onCodeChange: (code: string) => void;
  /** The execution environment (DOM, p5, React) */
  environmentMode: EnvironmentMode;
  /** The theme definition object containing colors */
  theme: Theme;
  /** Light or Dark mode */
  themeMode: ThemeMode;
  /** 
   * A unique key/id for the session. 
   * Changing this value forces the editor to reset (clearing history/undo stack).
   */
  sessionId?: number;
  /**
   * Optional prompt to display in a prediction panel.
   * If present, code editing is disabled and output is blurred until user enters a prediction.
   * Accepts text or JSX elements.
   */
  prediction_prompt?: React.ReactNode;
}

export const CodeShoebox: React.FC<CodeShoeboxProps> = ({
  code,
  onCodeChange,
  environmentMode,
  theme,
  themeMode,
  sessionId = 0,
  prediction_prompt
}) => {
  // Internal state for execution coordination between Editor and Output
  const [runTrigger, setRunTrigger] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  // Reset execution state if the session changes
  useEffect(() => {
    setRunTrigger(0);
    setIsRunning(false);
  }, [sessionId]);

  const handleRun = () => {
    setIsRunning(true);
    setRunTrigger(prev => prev + 1);
    
    // Simple feedback animation timeout
    setTimeout(() => {
      setIsRunning(false);
    }, 500);
  };

  // Generate CSS variables based on current theme mode and active theme
  const themeStyles = useMemo(() => {
    const colors = themeMode === 'dark' ? theme.dark : theme.light;
    
    // Fallback default colors if the theme doesn't specify background/foreground
    const defaultBg = themeMode === 'dark' ? '220 13% 18%' : '0 0% 98%';
    const defaultFg = themeMode === 'dark' ? '0 0% 95%' : '220 13% 18%';

    return {
      '--primary': colors.primary,
      '--primary-foreground': colors.primaryForeground,
      '--ring': colors.ring,
      '--sidebar-primary': colors.sidebarPrimary,
      '--sidebar-primary-foreground': colors.sidebarPrimaryForeground,
      '--sidebar-ring': colors.sidebarRing,
      // Use theme specific background if available, else default
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
        key={sessionId} // Remount environment on session change
        sessionId={sessionId}
        code={code}
        onChange={onCodeChange}
        onRun={handleRun}
        isRunning={isRunning}
        runTrigger={runTrigger}
        themeMode={themeMode}
        environmentMode={environmentMode}
        predictionPrompt={prediction_prompt}
      />
    </div>
  );
};