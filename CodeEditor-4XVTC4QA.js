// components/CodeEditor.tsx
import { useMemo } from "react";
import Editor from "@monaco-editor/react";

// components/emmet.ts
var registerHtmlEmmetForModel = (monaco, enabledModel) => import("emmet-monaco-es").then(({ emmetHTML }) => {
  const languagesProxy = new Proxy(monaco.languages, {
    get(target, property) {
      if (property !== "registerCompletionItemProvider") {
        return Reflect.get(target, property, target);
      }
      return (languageSelector, provider) => target.registerCompletionItemProvider(languageSelector, {
        ...provider,
        provideCompletionItems(model, position, context, token) {
          if (model !== enabledModel) return void 0;
          return provider.provideCompletionItems(model, position, context, token);
        }
      });
    }
  });
  const gatedMonaco = new Proxy(monaco, {
    get(target, property) {
      if (property === "languages") return languagesProxy;
      return Reflect.get(target, property, target);
    }
  });
  return emmetHTML(gatedMonaco, ["html"], { tokenizer: "standard" });
});

// components/CodeEditor.tsx
import { jsx } from "react/jsx-runtime";
var EDITOR_FONT_FAMILY = 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';
var CONSOLE_ONLY_JS_MODES = ["node-js", "express", "hono"];
var CONSOLE_SHIM = `
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
var applyJavaScriptLibs = (monaco, environmentMode) => {
  const consoleOnly = CONSOLE_ONLY_JS_MODES.includes(environmentMode);
  const ts = monaco.languages.typescript;
  ts.javascriptDefaults.setCompilerOptions({
    target: ts.ScriptTarget.ES2020,
    allowNonTsExtensions: true,
    allowJs: true,
    lib: consoleOnly ? ["es2020"] : ["es2020", "dom"]
  });
  ts.javascriptDefaults.addExtraLib(
    consoleOnly ? CONSOLE_SHIM : "",
    "ts:code-shoebox-console.d.ts"
  );
};
var CodeEditor = ({
  code,
  onChange,
  themeMode,
  environmentMode,
  sessionId,
  activeFile,
  enableEmmet = false,
  readOnly = false
}) => {
  const modelPath = useMemo(() => {
    const basePath = `sandbox-${environmentMode}-${sessionId}`;
    if (activeFile) return `${basePath}-${activeFile}`;
    switch (environmentMode) {
      case "typescript":
      case "express-ts":
      case "hono-ts":
      case "p5-ts":
      case "node-ts":
        return `${basePath}.ts`;
      case "react-ts":
        return `${basePath}.tsx`;
      case "html":
        return `${basePath}.html`;
      case "react":
        return `${basePath}.jsx`;
      case "p5":
        return `${basePath}.js`;
      default:
        return `${basePath}.js`;
    }
  }, [sessionId, environmentMode, activeFile]);
  const language = useMemo(() => {
    if (activeFile?.endsWith(".html")) return "html";
    if (activeFile?.endsWith(".css")) return "css";
    if (activeFile?.endsWith(".js")) return "javascript";
    if (environmentMode === "html") return "html";
    const tsModes = ["typescript", "react-ts", "express-ts", "hono-ts", "node-ts", "p5-ts"];
    if (tsModes.includes(environmentMode)) return "typescript";
    return "javascript";
  }, [environmentMode, activeFile]);
  const handleEditorDidMount = (editor, monaco) => {
    editor.focus();
    const refreshEditorMetrics = () => {
      monaco.editor.remeasureFonts();
      editor.layout();
    };
    refreshEditorMetrics();
    window.requestAnimationFrame(refreshEditorMetrics);
    window.setTimeout(refreshEditorMetrics, 250);
    document.fonts?.ready.then(refreshEditorMetrics).catch(() => void 0);
    if (enableEmmet && language === "html" && !readOnly) {
      const model = editor.getModel();
      if (model) {
        let editorDisposed = false;
        let disposeEmmet;
        void registerHtmlEmmetForModel(monaco, model).then((dispose) => {
          if (editorDisposed) dispose();
          else disposeEmmet = dispose;
        }).catch((error) => {
          if (!editorDisposed) console.error("[CodeShoebox] Failed to enable Emmet.", error);
        });
        editor.onDidDispose(() => {
          editorDisposed = true;
          disposeEmmet?.();
        });
      }
    }
    if (language === "javascript") {
      applyJavaScriptLibs(monaco, environmentMode);
      editor.onDidFocusEditorText(() => applyJavaScriptLibs(monaco, environmentMode));
    }
    if (language === "typescript") {
      monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
        jsx: monaco.languages.typescript.JsxEmit.React,
        target: monaco.languages.typescript.ScriptTarget.ES2020,
        allowNonTsExtensions: true,
        moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
        noLib: false,
        esModuleInterop: true
      });
      if (environmentMode === "react-ts") {
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
          "react-shim.d.ts"
        );
      }
      if (environmentMode === "express-ts") {
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
          "express.d.ts"
        );
      }
      if (environmentMode === "hono-ts") {
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
          "hono.d.ts"
        );
      }
      if (environmentMode === "p5-ts") {
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
          "p5-shim.d.ts"
        );
      }
    }
  };
  return /* @__PURE__ */ jsx("div", { className: "monaco-editor-container h-full w-full overflow-hidden", children: /* @__PURE__ */ jsx(
    Editor,
    {
      height: "100%",
      path: modelPath,
      language,
      theme: themeMode === "dark" ? "vs-dark" : "light",
      value: code,
      onChange,
      onMount: handleEditorDidMount,
      loading: /* @__PURE__ */ jsx("div", { className: "h-full w-full flex items-center justify-center text-sm opacity-50", children: "Loading Editor..." }),
      options: {
        readOnly,
        minimap: { enabled: false },
        fontSize: 14,
        wordWrap: "on",
        automaticLayout: true,
        padding: { top: 16, bottom: 16 },
        scrollBeyondLastLine: false,
        fontFamily: EDITOR_FONT_FAMILY,
        fontLigatures: false,
        fixedOverflowWidgets: true,
        renderValidationDecorations: "on",
        lineHeight: 24,
        letterSpacing: 0
      }
    },
    `${modelPath}-${enableEmmet ? "emmet" : "plain"}`
  ) });
};
export {
  CodeEditor
};
