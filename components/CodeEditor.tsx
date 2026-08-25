
import React, { useMemo } from 'react';
import Editor, { OnMount } from "@monaco-editor/react";
import { ThemeMode, EnvironmentMode } from '../types';
import { registerHtmlEmmetForModel } from './emmet';

const EDITOR_FONT_FAMILY = 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';

/**
 * JavaScript environments whose runner shadows `window`, `document`, and `root`
 * with `null`. Monaco's default JS lib set includes `lib.dom.d.ts`, so without
 * this distinction the editor advertises a DOM the runtime has deliberately
 * removed — and `let name = "Ada"` merges with the deprecated `window.name`,
 * striking through the learner's own variable.
 */
const CONSOLE_ONLY_JS_MODES: EnvironmentMode[] = ['node-js', 'express', 'hono'];

/**
 * `console` lives in `lib.dom.d.ts`, not in `lib.es2020`. Dropping the DOM lib
 * without this shim would take `console.log` autocomplete down with it
 * (measured: 22 completions → 2).
 */
const CONSOLE_SHIM = `
declare var console: {
  log(...data: any[]): void;
  error(...data: any[]): void;
  warn(...data: any[]): void;
  info(...data: any[]): void;
  debug(...data: any[]): void;
  table(data: any, columns?: string[]): void;
  dir(item?: any): void;
  group(...data: any[]): void;
  groupEnd(): void;
  time(label?: string): void;
  timeEnd(label?: string): void;
  count(label?: string): void;
  assert(condition?: boolean, ...data: any[]): void;
  trace(...data: any[]): void;
  clear(): void;
};
`;

/**
 * Points the shared JavaScript language service at the lib set that matches
 * this editor's environment.
 *
 * Monaco's language defaults are global to the runtime, not per-model, so a
 * host page holding both a `node-js` and a `dom` sandbox can only have one
 * configuration live at a time. We therefore re-apply on focus as well as on
 * mount: whichever editor the learner is actually typing in is the one
 * configured correctly.
 */
const applyJavaScriptLibs = (monaco: any, environmentMode: EnvironmentMode) => {
  const consoleOnly = CONSOLE_ONLY_JS_MODES.includes(environmentMode);
  const ts = monaco.languages.typescript;

  ts.javascriptDefaults.setCompilerOptions({
    target: ts.ScriptTarget.ES2020,
    allowNonTsExtensions: true,
    allowJs: true,
    lib: consoleOnly ? ['es2020'] : ['es2020', 'dom'],
  });

  // Replaces any previously registered shim under the same path.
  ts.javascriptDefaults.addExtraLib(
    consoleOnly ? CONSOLE_SHIM : '',
    'ts:code-shoebox-console.d.ts'
  );
};

interface CodeEditorProps {
  code: string;
  onChange: (value: string | undefined) => void;
  themeMode: ThemeMode;
  environmentMode: EnvironmentMode;
  sessionId: number;
  /** Active filename for multi-file modes; selects the Monaco model and language. */
  activeFile?: string;
  /** Enables Emmet completions for this editor's editable HTML model. */
  enableEmmet?: boolean;
  readOnly?: boolean;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  onChange,
  themeMode,
  environmentMode,
  sessionId,
  activeFile,
  enableEmmet = false,
  readOnly = false
}) => {
  // Construct a deterministic path.
  const modelPath = useMemo(() => {
    const basePath = `sandbox-${environmentMode}-${sessionId}`;
    // Multi-file modes get one Monaco model per file, preserving per-file
    // undo history across tab switches.
    if (activeFile) return `${basePath}-${activeFile}`;
    switch (environmentMode) {
      case 'typescript': 
      case 'express-ts':
      case 'hono-ts':
      case 'p5-ts':
      case 'node-ts': 
        return `${basePath}.ts`;
      case 'react-ts':
        return `${basePath}.tsx`;
      case 'html':
        return `${basePath}.html`;
      case 'react': 
        return `${basePath}.jsx`;
      case 'p5': 
        return `${basePath}.js`;
      default:
        return `${basePath}.js`;
    }
  }, [sessionId, environmentMode, activeFile]);

  const language = useMemo(() => {
    if (activeFile?.endsWith('.html')) return 'html';
    if (activeFile?.endsWith('.css')) return 'css';
    if (activeFile?.endsWith('.js')) return 'javascript';
    if (environmentMode === 'html') return 'html';
    const tsModes: EnvironmentMode[] = ['typescript', 'react-ts', 'express-ts', 'hono-ts', 'node-ts', 'p5-ts'];
    if (tsModes.includes(environmentMode)) return 'typescript';
    return 'javascript';
  }, [environmentMode, activeFile]);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editor.focus();

    const refreshEditorMetrics = () => {
      monaco.editor.remeasureFonts();
      editor.layout();
    };

    refreshEditorMetrics();
    window.requestAnimationFrame(refreshEditorMetrics);
    window.setTimeout(refreshEditorMetrics, 250);
    document.fonts?.ready
      .then(refreshEditorMetrics)
      .catch(() => undefined);

    if (enableEmmet && language === 'html' && !readOnly) {
      const model = editor.getModel();
      if (model) {
        let editorDisposed = false;
        let disposeEmmet: (() => void) | undefined;

        void registerHtmlEmmetForModel(monaco, model).then((dispose) => {
          if (editorDisposed) dispose();
          else disposeEmmet = dispose;
        }).catch((error) => {
          if (!editorDisposed) console.error('[CodeShoebox] Failed to enable Emmet.', error);
        });

        editor.onDidDispose(() => {
          editorDisposed = true;
          disposeEmmet?.();
        });
      }
    }

    // Match the JS lib set to this environment, and re-assert it whenever this
    // editor regains focus — the language defaults are shared across every
    // editor on the page, so the last one touched has to win.
    if (language === 'javascript') {
      applyJavaScriptLibs(monaco, environmentMode);
      editor.onDidFocusEditorText(() => applyJavaScriptLibs(monaco, environmentMode));
    }

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
                declare namespace React {
                    type ReactNode = any;
                    interface FC<P = {}> {
                        (props: P): ReactNode;
                    }
                    interface Dispatch<A> {
                        (value: A): void;
                    }
                    type SetStateAction<S> = S | ((prevState: S) => S);
                }

                declare module 'react' {
                    export type ReactNode = any;
                    export interface FC<P = {}> {
                        (props: P): ReactNode;
                    }
                    export interface Dispatch<A> {
                        (value: A): void;
                    }
                    export type SetStateAction<S> = S | ((prevState: S) => S);
                    export function useState<S>(initialState: S | (() => S)): [S, Dispatch<SetStateAction<S>>];

                    const React: {
                        FC: FC<any>;
                        useState: typeof useState;
                    };
                    export default React;
                }

                declare module 'react-dom/client' {
                    export interface Root {
                        render(children: any): void;
                        unmount(): void;
                    }
                    export function createRoot(container: Element | DocumentFragment): Root;
                }
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
        key={`${modelPath}-${enableEmmet ? 'emmet' : 'plain'}`} // Re-register editor features when the opt-in changes.
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
          fontFamily: EDITOR_FONT_FAMILY,
          fontLigatures: false,
          fixedOverflowWidgets: true,
          renderValidationDecorations: 'on',
          lineHeight: 24,
          letterSpacing: 0,
        }}
      />
    </div>
  );
};
