
import React from 'react';
import { Theme } from './theme';

export interface ExecutionMessage {
  type: 'EXECUTE_CODE';
  payload: string;
}

export type ThemeMode = 'light' | 'dark';

export type EnvironmentMode = 'html' | 'html-css' | 'html-js' | 'html-js-fetch' | 'html-css-js' | 'html-js-css-media' | 'dom' | 'fetch' | 'p5' | 'p5-ts' | 'p5play' | 'react' | 'typescript' | 'react-ts' | 'express' | 'express-ts' | 'node-js' | 'node-ts' | 'hono' | 'hono-ts';

export type JsonValue =
  | null
  | boolean
  | number
  | string
  | readonly JsonValue[]
  | { readonly [key: string]: JsonValue };

export type MockApiMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface MockApiRouteBase {
  method: MockApiMethod;
  path: string;
  /** Exact query match. Routes without this field accept any query string. */
  query?: Readonly<Record<string, string>>;
  /** Required request headers. Names are case-insensitive; extra learner headers are allowed. */
  requestHeaders?: Readonly<Record<string, string>>;
  /** Deep-equal JSON request body match. Object key order is ignored. */
  requestBody?: JsonValue;
  /** Overrides the API-wide simulated latency for this route. */
  delayMs?: number;
}

export type MockApiRoute = MockApiRouteBase & (
  | {
      networkError: true;
      errorMessage?: string;
      body?: never;
      status?: never;
      headers?: never;
    }
  | {
      networkError?: false;
      body: JsonValue;
      status?: number;
      headers?: Readonly<Record<string, string>>;
    }
);

export interface MockApiConfig {
  /** Defaults to 1000 ms so learners can observe that awaited data arrives later. */
  defaultDelayMs?: number;
  routes: readonly MockApiRoute[];
}

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
  /** Host-authored, local-only routes shown and executed in fetch-enabled modes. */
  mockApi?: MockApiConfig;
  themeMode: ThemeMode;
  theme: Theme;
  sessionId?: number;
  prediction_prompt?: React.ReactNode;
  /** Enables verbose system logging for debugging communication issues */
  debugMode?: boolean;
}
