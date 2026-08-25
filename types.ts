
import React from 'react';
import { Theme } from './theme';

export interface ExecutionMessage {
  type: 'EXECUTE_CODE';
  payload: string;
}

export type ThemeMode = 'light' | 'dark';

export type EnvironmentMode = 'html' | 'html-css' | 'html-js' | 'html-css-js' | 'html-js-css-media' | 'dom' | 'p5' | 'p5-ts' | 'p5play' | 'react' | 'typescript' | 'react-ts' | 'express' | 'express-ts' | 'node-js' | 'node-ts' | 'hono' | 'hono-ts';

export type MediaAsset =
  | { kind: 'image'; name: string; src: string; alt: string }
  | { kind: 'audio'; name: string; src: string }
  | { kind: 'video'; name: string; src: string };

export interface EditorProps {
  initialCode: string;
  onChange: (code: string) => void;
  theme?: ThemeMode;
}

export interface CodeShoeboxProps {
  code: string;
  onCodeChange: (code: string) => void;
  environmentMode: EnvironmentMode;
  /** Trusted host-authored markup restored before each run in dom mode. */
  fixtureHtml?: string;
  /** Trusted host-authored styles restored with fixtureHtml in dom mode. */
  fixtureCss?: string;
  /** Host-authored media shown read-only in html-js-css-media mode. */
  mediaAssets?: readonly MediaAsset[];
  /** Enables Emmet abbreviation completions in editable HTML models. */
  enableEmmet?: boolean;
  themeMode: ThemeMode;
  theme: Theme;
  sessionId?: number;
  prediction_prompt?: React.ReactNode;
  /** Enables verbose system logging for debugging communication issues */
  debugMode?: boolean;
}
