
import React from 'react';
import { Theme } from './theme';

export interface ExecutionMessage {
  type: 'EXECUTE_CODE';
  payload: string;
}

export type ThemeMode = 'light' | 'dark';

export type EnvironmentMode = 'dom' | 'p5' | 'p5-ts' | 'react' | 'typescript' | 'react-ts' | 'express' | 'express-ts' | 'node-js' | 'node-ts' | 'hono' | 'hono-ts';

export interface EditorProps {
  initialCode: string;
  onChange: (code: string) => void;
  theme?: ThemeMode;
}

export interface CodeShoeboxProps {
  code: string;
  onCodeChange: (code: string) => void;
  environmentMode: EnvironmentMode;
  themeMode: ThemeMode;
  theme: Theme;
  sessionId?: number;
  prediction_prompt?: React.ReactNode;
  /** Enables verbose system logging for debugging communication issues */
  debugMode?: boolean;
}
