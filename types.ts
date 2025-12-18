
export interface ExecutionMessage {
  type: 'EXECUTE_CODE';
  payload: string;
}

export type ThemeMode = 'light' | 'dark';

export type EnvironmentMode = 'dom' | 'p5' | 'react' | 'typescript' | 'react-ts' | 'express' | 'express-ts' | 'node-js' | 'node-ts';

export interface EditorProps {
  initialCode: string;
  onChange: (code: string) => void;
  theme?: ThemeMode;
}

// Re-export specific props if needed by consumers
export interface CodeShoeboxProps {
  code: string;
  onCodeChange: (code: string) => void;
  environmentMode: EnvironmentMode;
  themeMode: ThemeMode;
  /**
   * Optional identifier for the current editing session.
   * Incrementing this value is recommended when resetting code (e.g. "Start Over")
   * as it ensures the Monaco Editor's undo/redo history is cleared.
   */
  sessionId?: number;
}
