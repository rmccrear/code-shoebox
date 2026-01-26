
import React, { useMemo } from 'react';
import Editor, { OnMount } from "@monaco-editor/react";
import { ThemeMode, EnvironmentMode } from '../types';

interface CodeEditorProps {
  code: string;
  onChange: (value: string | undefined) => void;
  themeMode: ThemeMode;
  environmentMode: EnvironmentMode;
  sessionId: number;
  readOnly?: boolean;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ 
  code, 
  onChange, 
  themeMode, 
  environmentMode, 
  sessionId,
  readOnly = false 
}) => {
  // Construct a deterministic path.
  const modelPath = useMemo(() => {
    const basePath = `sandbox-${environmentMode}-${sessionId}`;
    switch (environmentMode) {
      case 'typescript': 
      case 'express-ts':
      case 'hono-ts':
      case 'p5-ts':
      case 'node-ts': 
        return `${basePath}.ts`;
      case 'react-ts': 
        return `${basePath}.tsx`;
      case 'react': 
        return `${basePath}.jsx`;
      case 'p5': 
        return `${basePath}.js`;
      default: 
        return `${basePath}.js`;
    }
  }, [sessionId, environmentMode]);

  const language = useMemo(() => {
    const tsModes: EnvironmentMode[] = ['typescript', 'react-ts', 'express-ts', 'hono-ts', 'node-ts', 'p5-ts'];
    if (tsModes.includes(environmentMode)) return 'typescript';
    return 'javascript';
  }, [environmentMode]);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editor.focus();
    
    // Configure compiler options for TS
    if (language === 'typescript') {
        monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
            jsx: monaco.languages.typescript.JsxEmit.React,
            target: monaco.languages.typescript.ScriptTarget.ES2020,
            allowNonTsExtensions: true,
            moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
            noLib: false,
            esModuleInterop: true,
        });
        
        // Add a basic shim for React types
        if (environmentMode === 'react-ts') {
             monaco.languages.typescript.typescriptDefaults.addExtraLib(
                `
                declare module 'react' { var x: any; export = x; }
                declare module 'react-dom/client' { var x: any; export = x; }
                `,
                'react-shim.d.ts'
             );
        }

        // Add a shim for Express types
        if (environmentMode === 'express-ts') {
            monaco.languages.typescript.typescriptDefaults.addExtraLib(
                `
                declare module 'express' {
                    export interface Request {
                        params: any;
                        query: any;
                        body: any;
                        method: string;
                        url: string;
                    }
                    export interface Response {
                        status(code: number): this;
                        json(data: any): void;
                        send(data: any): void;
                    }
                    export interface Application {
                        get(path: string, handler: (req: Request, res: Response) => void): void;
                        post(path: string, handler: (req: Request, res: Response) => void): void;
                        listen(port: number, cb?: () => void): void;
                    }
                    function express(): Application;
                    export default express;
                }
                `,
                'express.d.ts'
            );
        }

        // Add a shim for Hono types
        if (environmentMode === 'hono-ts') {
            monaco.languages.typescript.typescriptDefaults.addExtraLib(
                `
                declare module 'hono' {
                    export interface Context {
                        text(content: string): any;
                        json(data: any): any;
                        req: {
                            param(name: string): string;
                            query(name: string): string;
                            query(): Record<string, string>;
                        };
                    }
                    export class Hono {
                        get(path: string, handler: (c: Context) => any): void;
                        post(path: string, handler: (c: Context) => any): void;
                        fire(): void;
                    }
                }
                declare class Hono {
                    get(path: string, handler: (c: any) => any): void;
                    post(path: string, handler: (c: any) => any): void;
                    fire(): void;
                }
                `,
                'hono.d.ts'
            );
        }

        // Add a shim for p5.js types
        if (environmentMode === 'p5-ts') {
            monaco.languages.typescript.typescriptDefaults.addExtraLib(
                `
                declare function createCanvas(w: number, h: number): any;
                declare function background(gray: number, alpha?: number): void;
                declare function background(r: number, g: number, b: number, a?: number): void;
                declare function background(color: string): void;
                declare function stroke(gray: number, alpha?: number): void;
                declare function stroke(r: number, g: number, b: number, a?: number): void;
                declare function noStroke(): void;
                declare function fill(gray: number, alpha?: number): void;
                declare function fill(r: number, g: number, b: number, a?: number): void;
                declare function fill(color: string): void;
                declare function noFill(): void;
                declare function circle(x: number, y: number, d: number): void;
                declare function line(x1: number, y1: number, x2: number, y2: number): void;
                declare function rect(x: number, y: number, w: number, h: number): void;
                declare function ellipse(x: number, y: number, w: number, h: number): void;
                declare function triangle(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number): void;
                declare function dist(x1: number, y1: number, x2: number, y2: number): number;
                declare function random(max?: number): number;
                declare function random(min: number, max: number): number;
                declare function colorMode(mode: string, max?: number): void;
                declare function angleMode(mode: string): void;
                declare function translate(x: number, y: number): void;
                declare function rotate(angle: number): void;
                declare function push(): void;
                declare function pop(): void;
                declare function frameRate(fps: number): void;
                declare function strokeWeight(weight: number): void;
                declare var width: number;
                declare var height: number;
                declare var frameCount: number;
                declare var mouseX: number;
                declare var mouseY: number;
                declare var mouseIsPressed: boolean;
                declare var keyIsPressed: boolean;
                declare const PI: number;
                declare const TWO_PI: number;
                declare const DEGREES: string;
                declare const RADIANS: string;
                declare const HSB: string;
                declare const RGB: string;
                
                // Allow defining setup and draw on window for global mode
                interface Window {
                    setup?: () => void;
                    draw?: () => void;
                }
                `,
                'p5-shim.d.ts'
            );
        }
    }
  };

  return (
    <div className="monaco-editor-container h-full w-full overflow-hidden">
      <Editor
        key={modelPath} // Force full re-render of Editor component when path changes
        height="100%"
        path={modelPath}
        language={language}
        theme={themeMode === 'dark' ? 'vs-dark' : 'light'}
        value={code}
        onChange={onChange}
        onMount={handleEditorDidMount}
        loading={<div className="h-full w-full flex items-center justify-center text-sm opacity-50">Loading Editor...</div>}
        options={{
          readOnly: readOnly,
          minimap: { enabled: false },
          fontSize: 14,
          wordWrap: 'on',
          automaticLayout: true,
          padding: { top: 16, bottom: 16 },
          scrollBeyondLastLine: false,
          fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
          fixedOverflowWidgets: true,
          renderValidationDecorations: 'on',
          lineHeight: 24,
        }}
      />
    </div>
  );
};
