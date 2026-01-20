
import React from 'react';

// Added EnvironmentMode type to satisfy imports in runner.ts
/**
 * Fix: Synchronized with the master EnvironmentMode definition in types.ts.
 * This ensures that 'hono' and 'hono-ts' are recognized as valid modes in the runtime, 
 * resolving "is not assignable" errors in OutputFrame.tsx and ServerOutput.tsx.
 */
export type EnvironmentMode = 'dom' | 'p5' | 'p5-ts' | 'react' | 'typescript' | 'react-ts' | 'express' | 'express-ts' | 'node-js' | 'node-ts' | 'hono' | 'hono-ts';

export interface SandboxConfig {
  allowScripts: boolean;
  allowSameOrigin: boolean;
}

export interface SandboxMessage {
  type: 'EXECUTE';
  code: string;
  envMode?: string;
}

export type BabelPreset = 'react' | 'typescript' | 'env';

export interface EnvironmentRecipe {
  name: string;
  cdns?: string[];
  babelPresets?: BabelPreset[];
  mocks?: string;
  styles?: string;
  executeWrapper?: (code: string) => string;
  showPlaceholder?: boolean;
  headless?: boolean;
  // Added logic property to support environment-specific initialization scripts
  logic?: string;
}
