export interface ExecutionMessage {
  type: 'EXECUTE_CODE';
  payload: string;
}

export type ThemeMode = 'light' | 'dark';

export type EnvironmentMode = 'dom' | 'p5' | 'react';

export interface EditorProps {
  initialCode: string;
  onChange: (code: string) => void;
  theme?: ThemeMode;
}