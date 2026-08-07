// components/CodeShoebox.tsx
import { useState as useState4, useMemo as useMemo5, useEffect as useEffect4 } from "react";

// components/CodingEnvironment.tsx
import { useState as useState3, useEffect as useEffect3, useRef as useRef3, useCallback as useCallback3, useMemo as useMemo4 } from "react";
import {
  Play,
  CheckCircle2,
  FileCode,
  Lock,
  Columns,
  Rows,
  GripVertical,
  GripHorizontal as GripHorizontal3
} from "lucide-react";

// components/CodeEditor.tsx
import { useMemo } from "react";
import Editor from "@monaco-editor/react";
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
    modelPath
  ) });
};

// components/OutputFrame.tsx
import { useEffect, useRef, useState, useCallback, useMemo as useMemo2 } from "react";

// runtime/templates/common.ts
var BASE_STYLES = `
    html, body {
        height: 100%;
        margin: 0;
        padding: 0;
        overflow: hidden;
    }

    body { 
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        color: #333;
        background: #fff;
        transition: background-color 0.3s, color 0.3s;
        display: flex;
        flex-direction: column;
    }
    
    body.dark { background: #1a1a1a; color: #ddd; }
    
    #root {
        flex: 1;
        overflow: auto;
        padding: 1rem;
        position: relative;
        width: 100%;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        align-items: center;
    }
    
    #root > * {
        max-width: 100%;
        flex-shrink: 0;
    }

    canvas {
        display: block;
        margin-bottom: 1rem;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        border-radius: 4px;
    }
`;
var KERNEL_SCRIPTS = `
    // --- Console & Module System ---
    window.messagePort = null;
    window.__MODULE_REGISTRY__ = {};

    window.require = function(module) {
        if (window.__MODULE_REGISTRY__[module]) return window.__MODULE_REGISTRY__[module];
        if (module === 'react') return window.React;
        if (module === 'react-dom' || module === 'react-dom/client') return window.ReactDOM;
        throw new Error('Module not found: ' + module);
    };

    function sendPayload(type, payload) {
        const message = { type, payload };
        if (window.messagePort) window.messagePort.postMessage(message);
        else window.parent.postMessage(message, '*');
    }

    function formatRuntimeValue(value) {
        if (
            value !== null
            && typeof value === 'object'
            && typeof value.name === 'string'
            && typeof value.message === 'string'
        ) {
            return value.name + ': ' + value.message;
        }
        if (typeof value === 'object' && value !== null) {
            try { return JSON.stringify(value, null, 2); } catch (e) { return String(value); }
        }
        return String(value);
    }

    // Intercept standard logs
    ['log', 'error', 'warn', 'info'].forEach(method => {
        const original = console[method];
        console[method] = function(...args) {
            original.apply(console, args);
            const content = args.map(formatRuntimeValue).join(' ');
            sendPayload(method === 'error' ? 'RUNTIME_ERROR' : (method === 'warn' ? 'CONSOLE_WARN' : 'CONSOLE_LOG'), content);
        };
    });

    console.log("[Kernel] Sandbox started. Initializing environment...");

    window.onerror = (msg, src, line, column, error) => {
        const content = error
            ? formatRuntimeValue(error)
            : 'Error: ' + String(msg) + ' (Line ' + line + ', Column ' + column + ')';
        sendPayload('RUNTIME_ERROR', content);
    };

    window.addEventListener('unhandledrejection', (event) => {
        sendPayload('RUNTIME_ERROR', formatRuntimeValue(event.reason));
    });

    window.addEventListener('message', (event) => {
        if (event.source !== window.parent) return;
        const { type, code, mode, payload } = event.data;
        if (type === 'INIT_PORT' && event.ports[0]) {
            console.log("[Kernel] Received INIT_PORT. Establishing MessageChannel.");
            window.messagePort = event.ports[0];
            window.messagePort.postMessage({ type: 'READY_SIGNAL' });
            if (window.__SERVER_READY__) {
                console.log("[Kernel] Server already ready, resending SERVER_READY signal via Port.");
                window.messagePort.postMessage({ type: 'SERVER_READY' });
            }
        }
        if (type === 'THEME') document.body.className = mode === 'dark' ? 'dark' : '';
        if (type === 'EXECUTE' && window.__RUN_MODE__) {
            console.log("[Kernel] Received EXECUTE signal.");
            const root = document.getElementById('root');
            const placeholder = document.getElementById('placeholder');
            if (placeholder) placeholder.style.display = 'none';
            window.__RUN_MODE__(code, root, payload || {});
        }
    });
`;
var BASE_HTML_WRAPPER = (recipe) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>${BASE_STYLES} ${recipe.styles || ""}</style>
    ${(recipe.cdns || []).join("\n")}
</head>
<body>
    <div id="root">
        ${recipe.showPlaceholder !== false ? '<p id="placeholder" style="color: #888; font-style: italic;">Output will appear here...</p>' : ""}
    </div>
    <script>
        ${KERNEL_SCRIPTS}
        ${recipe.mocks || ""}
        ${recipe.logic}
    </script>
</body>
</html>
`;

// runtime/templates/express.ts
var EXPRESS_MOCK_SETUP = `
    // --- Mock Express & Response Objects ---

    class MockResponse {
        constructor(resolve) {
            this.resolve = resolve;
            this.statusCode = 200;
        }

        status(code) {
            this.statusCode = code;
            return this;
        }

        json(data) {
            this.resolve({
                status: this.statusCode,
                data: data,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        send(data) {
             this.resolve({
                status: this.statusCode,
                data: data,
                headers: { 'Content-Type': 'text/html' }
            });
        }
    }

    class MockApp {
        constructor() {
            this.routes = { GET: {} };
        }

        get(path, handler) {
            const regexPath = path.replace(/:[^/]+/g, '([^/]+)');
            this.routes.GET[regexPath] = { originalPath: path, handler };
        }

        listen(port, cb) {
            if (cb) cb();
            
            // Signal ready via port if available, else global window.parent fallback
            const readyMsg = { type: 'SERVER_READY' };
            if (window.messagePort) {
                window.messagePort.postMessage(readyMsg);
            } else {
                window.parent.postMessage(readyMsg, '*');
                // Flag for async port initialization in common.ts interceptor
                window.serverReadySignal = true;
            }
        }

        async _handleRequest(method, url) {
            // Parse URL to separate path and query
            // We use a dummy base because 'url' is just the path+query like '/users?id=1'
            const urlObj = new URL(url, "http://localhost");
            const pathname = urlObj.pathname;
            const searchParams = urlObj.searchParams;
            
            // Convert searchParams to a plain object
            const query = {};
            for (const [key, value] of searchParams) {
                query[key] = value;
            }

            console.log(\`Incoming Request: \${method} \${url}\`);
            
            const methodRoutes = this.routes[method] || {};
            
            for (const routeRegex in methodRoutes) {
                // Match against pathname, NOT full url (which might contain query strings)
                const match = new RegExp(\`^\${routeRegex}$\`).exec(pathname);
                if (match) {
                    const { handler } = methodRoutes[routeRegex];
                    
                    const params = {};
                    const originalPath = methodRoutes[routeRegex].originalPath;
                    const paramKeys = (originalPath.match(/:([^/]+)/g) || []).map(k => k.substring(1));
                    
                    if (paramKeys.length && match.length > 1) {
                       paramKeys.forEach((key, index) => {
                           params[key] = match[index + 1];
                       });
                    }

                    const req = { 
                        method, 
                        url, 
                        path: pathname,
                        params, 
                        query 
                    };

                    return new Promise(resolve => {
                        const res = new MockResponse(resolve);
                        try {
                            const out = handler(req, res);
                            if (out && typeof out.catch === 'function') {
                                out.catch(e => {
                                    const message = e && e.message ? e.message : String(e);
                                    console.warn(message);
                                    resolve({ status: 500, data: { error: message } });
                                });
                            }
                        } catch (e) {
                            const message = e && e.message ? e.message : String(e);
                            console.warn(message);
                            resolve({ status: 500, data: { error: message } });
                        }
                    });
                }
            }

            return { status: 404, data: { error: \`Cannot \${method} \${pathname}\` } };
        }
    }

    const appInstance = new MockApp();
    window.express = function() { return appInstance; };
    window.appInstance = appInstance;

    // Logic to handle requests coming from the parent
    const requestHandler = async (event) => {
        if (event.data && event.data.type === 'SIMULATE_REQUEST') {
            const { method, url } = event.data.payload;
            try {
                const response = await appInstance._handleRequest(method, url);
                const completeMsg = { type: 'REQUEST_COMPLETE', payload: response };
                
                if (window.messagePort) {
                    window.messagePort.postMessage(completeMsg);
                } else {
                    window.parent.postMessage(completeMsg, '*');
                }
            } catch (err) {
                console.error("[Express Mock] Simulation error:", err);
                sendPayload('RUNTIME_ERROR', err.message);
            }
        }
    };

    // Listen on the main window for initial requests (fallback)
    window.addEventListener('message', (event) => {
        if (event.source !== window.parent) return;
        requestHandler(event);
    });
    
    // Also attach to the message port once it arrives for high-performance communication
    const checkPortInterval = setInterval(() => {
        if (window.messagePort) {
            window.messagePort.addEventListener('message', requestHandler);
            window.messagePort.start();
            clearInterval(checkPortInterval);
        }
    }, 50);
`;

// runtime/templates/hono.ts
var HONO_MOCK_SETUP = `
    // 1. Define Server Starter globally so it is always available
    window.__startHonoServer = function(app) {
        // Debounce: if this exact instance is already running, skip
        if (window.appInstance === app && window.__SERVER_READY__) {
            return;
        }

        window.appInstance = app;
        window.__SERVER_READY__ = true;

        const readyMsg = { type: 'SERVER_READY' };
        if (window.messagePort) {
            window.messagePort.postMessage(readyMsg);
        } else {
            window.parent.postMessage(readyMsg, '*');
        }
    };

    // 2. Setup function called by Runner
    window.__setupHonoMock = function(HonoClass) {
        if (!HonoClass) {
            console.error("[Hono Mock] HonoClass is undefined");
            return;
        }

        // Always patch/re-patch to ensure fresh closure context if needed
        HonoClass.prototype.fire = function() {
            window.__startHonoServer(this);
        };
        
        // Also patch .listen() for Express-style compatibility
        HonoClass.prototype.listen = function() {
            window.__startHonoServer(this);
        };

        // Bridge for require('hono') logic in the runner
        window.__MODULE_REGISTRY__['hono'] = { 
            get Hono() { return window.Hono; } 
        };
    };

    const requestHandler = async (event) => {
        if (event.data && event.data.type === 'SIMULATE_REQUEST') {
            const { method, url } = event.data.payload;
            
            if (!window.appInstance) {
                const errorMsg = "Server not started. Ensure you 'export default app', 'app.fire()', or 'app.listen()'.";
                console.error("[Hono Mock] Error:", errorMsg);
                sendPayload('RUNTIME_ERROR', errorMsg);
                return;
            }

            console.log(\`[Hono] Incoming Request: \${method} \${url}\`);

            try {
                // Mock the request object
                // Note: 'url' includes query params (e.g. /path?q=1), which Request/URL handles automatically
                const req = new Request('http://localhost' + url, { method });
                
                // app.fetch is the standard entry point for Hono
                const res = await window.appInstance.fetch(req);
                
                const status = res.status;
                const contentType = res.headers.get('content-type') || '';
                
                let data;
                if (contentType.includes('application/json')) {
                    try { data = await res.json(); } catch (e) { data = await res.text(); }
                } else {
                    data = await res.text();
                }

                const completeMsg = { type: 'REQUEST_COMPLETE', payload: { status, data } };
                if (window.messagePort) window.messagePort.postMessage(completeMsg);
                else window.parent.postMessage(completeMsg, '*');

            } catch (err) {
                console.error("[Hono Mock] Simulation error:", err);
                sendPayload('RUNTIME_ERROR', err.message);
            }
        }
    };

    window.addEventListener('message', (event) => {
        if (event.source !== window.parent) return;
        requestHandler(event);
    });

    // Attach to messagePort if available
    const checkPortInterval = setInterval(() => {
        if (window.messagePort) {
            window.messagePort.addEventListener('message', requestHandler);
            window.messagePort.start();
            clearInterval(checkPortInterval);
        }
    }, 100);
`;

// runtime/runner.ts
var SANDBOX_ATTRIBUTES = "allow-scripts allow-modals allow-forms";
var BABEL_CDN = '<script src="https://unpkg.com/@babel/standalone@7.26.4/babel.min.js"></script>';
var REACT_CDNS = [
  '<script crossorigin src="https://unpkg.com/react@18.3.1/umd/react.development.js"></script>',
  '<script crossorigin src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js"></script>',
  BABEL_CDN
];
var P5_CDN = '<script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.min.js"></script>';
var P5PLAY_CDNS = [
  P5_CDN,
  '<script src="https://cdn.jsdelivr.net/gh/rmccrear/p5.play@v2.0.0-codex.1/lib/p5.play.js"></script>'
];
var P5_RUNTIME_STYLES = `
  #root {
    padding: 0;
    overflow: hidden;
  }

  canvas.p5Canvas {
    position: absolute !important;
    top: 0 !important;
    left: 0 !important;
    margin: 0 !important;
    border: 2px solid rgba(37, 99, 235, 0.85);
    border-radius: 6px;
    box-sizing: border-box;
  }

  body.dark canvas.p5Canvas {
    border-color: rgba(96, 165, 250, 0.95);
  }
`;
var HONO_CDN = '<script type="module">import { Hono } from "https://esm.sh/hono@4.1.0"; window.Hono = Hono;</script>';
var HTML_RUNTIME_STYLES = `
  #root {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    padding: 0;
  }

  .cs-script-banner,
  .cs-hint-banner {
    flex-shrink: 0;
    padding: 6px 12px;
    font-size: 12px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }

  .cs-script-banner {
    background: #fef3c7;
    color: #92400e;
    border-bottom: 1px solid #fcd34d;
  }

  .cs-hint-banner {
    background: #dbeafe;
    color: #1e40af;
    border-bottom: 1px solid #93c5fd;
  }

  .cs-html-frame {
    flex: 1;
    width: 100%;
    border: none;
    display: block;
    background: #fff;
  }
`;
var ENV_RECIPES = {
  html: {
    name: "HTML (single file)",
    showPlaceholder: false,
    styles: HTML_RUNTIME_STYLES,
    logic: `
      window.__RUN_MODE__ = (code, root) => {
        root.innerHTML = '';
        // The buffer renders verbatim as the srcdoc of a nested iframe with
        // sandbox="" \u2014 script execution is blocked by the browser sandbox
        // itself (nested sandbox flags intersect, so the outer frame's
        // allow-scripts does not leak in). The DOMParser pass below only
        // DETECTS script tags to show the learner a banner; it must not be
        // "upgraded" to stripping, and sandbox="" must stay empty.
        const probe = new DOMParser().parseFromString(code, 'text/html');
        if (probe.querySelector('script')) {
          const banner = document.createElement('div');
          banner.className = 'cs-script-banner';
          banner.textContent = '\\u26a0 <script> is ignored in HTML & CSS mode \\u2014 switch to the DOM mode to write JavaScript.';
          root.appendChild(banner);
        }
        const frame = document.createElement('iframe');
        frame.setAttribute('sandbox', '');
        frame.className = 'cs-html-frame';
        frame.srcdoc = code;
        root.appendChild(frame);
      };
    `
  },
  "html-css": {
    name: "HTML & CSS (style.css)",
    showPlaceholder: false,
    styles: HTML_RUNTIME_STYLES,
    logic: `
      window.__RUN_MODE__ = (code, root) => {
        root.innerHTML = '';
        // Inline copy of parseFileBundle from runtime/fileBundle.ts \u2014 the
        // iframe kernel cannot import modules. Keep the two in sync.
        let files;
        try {
          const parsed = JSON.parse(code);
          files = (parsed && parsed.__csFiles__ === 1 && parsed.files)
            ? { html: String(parsed.files['index.html'] ?? ''), css: String(parsed.files['style.css'] ?? '') }
            : { html: code, css: '' };
        } catch (e) { files = { html: code, css: '' }; }

        const doc = new DOMParser().parseFromString(files.html, 'text/html');

        if (doc.querySelector('script')) {
          const banner = document.createElement('div');
          banner.className = 'cs-script-banner';
          banner.textContent = '\\u26a0 <script> is ignored in HTML & CSS mode \\u2014 switch to the DOM mode to write JavaScript.';
          root.appendChild(banner);
        }

        // Strict link semantics: only a literal style.css href resolves to
        // the css tab. Scripts are still blocked by the inner sandbox=""
        // attribute below, not by stripping \u2014 do not change either rule.
        const links = doc.querySelectorAll('link[rel="stylesheet"][href="style.css"]');
        links.forEach((link) => {
          const style = doc.createElement('style');
          style.textContent = files.css;
          link.replaceWith(style);
        });
        if (links.length === 0 && files.css.trim()) {
          const hint = document.createElement('div');
          hint.className = 'cs-hint-banner';
          hint.textContent = 'style.css is not linked \\u2014 add <link rel="stylesheet" href="style.css"> inside <head>.';
          root.appendChild(hint);
        }

        const frame = document.createElement('iframe');
        frame.setAttribute('sandbox', '');
        frame.className = 'cs-html-frame';
        frame.srcdoc = '<!DOCTYPE html>' + doc.documentElement.outerHTML;
        root.appendChild(frame);
      };
    `
  },
  dom: {
    name: "DOM",
    logic: `
      window.__RUN_MODE__ = (code, root, options = {}) => {
        root.replaceChildren();
        document.querySelectorAll('style[data-code-shoebox-fixture]').forEach((style) => style.remove());

        if (options.fixtureCss !== undefined) {
          const fixtureStyle = document.createElement('style');
          fixtureStyle.setAttribute('data-code-shoebox-fixture', '');
          fixtureStyle.textContent = options.fixtureCss;
          document.head.appendChild(fixtureStyle);
        }

        if (options.fixtureHtml !== undefined) {
          const fixtureDocument = new DOMParser().parseFromString(options.fixtureHtml, 'text/html');
          const fixtureFragment = document.createDocumentFragment();
          fixtureDocument.body.childNodes.forEach((node) => {
            fixtureFragment.appendChild(document.importNode(node, true));
          });
          root.appendChild(fixtureFragment);
        }

        try { new Function('root', code)(root); } catch (e) { console.error(e); }
      };
    `
  },
  typescript: {
    name: "TypeScript",
    cdns: [BABEL_CDN],
    babelPresets: ["typescript", "env"],
    logic: `
      window.__RUN_MODE__ = (code, root) => {
        root.innerHTML = '';
        try {
          const transpiled = Babel.transform(code, { presets: ['env', 'typescript'], filename: 'script.ts' }).code;
          new Function('root', transpiled)(root);
        } catch (e) { console.error(e); }
      };
    `
  },
  p5play: {
    name: "p5.js + p5.play",
    cdns: P5PLAY_CDNS,
    styles: P5_RUNTIME_STYLES,
    logic: `
      let instance = null;
      window.__RUN_MODE__ = (code, root) => {
        if (instance) instance.remove();
        root.innerHTML = '';
        window.setup = window.draw = null;
        const observer = new MutationObserver(m => {
          m.forEach(mutation => mutation.addedNodes.forEach(node => {
            if (node.tagName === 'CANVAS' && node.classList.contains('p5Canvas')) root.appendChild(node);
          }));
        });
        observer.observe(document.body, { childList: true });
        try {
          // Game Lab semantics: the canvas and p5 globals exist BEFORE student
          // code runs, so top-level statements like createSprite() work.
          // p5's redraw() looks up window.draw each frame, so a draw() defined
          // by the eval below is picked up even though the instance already exists.
          instance = new p5();
          window.createCanvas(400, 400);
          window.eval(code);
          if (typeof window.setup === 'function') window.setup();
        } catch (e) { console.error(e); }
      };
    `
  },
  p5: {
    name: "p5.js",
    cdns: [P5_CDN],
    styles: P5_RUNTIME_STYLES,
    logic: `
      let instance = null;
      window.__RUN_MODE__ = (code, root) => {
        if (instance) instance.remove();
        root.innerHTML = '';
        window.setup = window.draw = null;
        const observer = new MutationObserver(m => {
          m.forEach(mutation => mutation.addedNodes.forEach(node => {
            if (node.tagName === 'CANVAS' && node.classList.contains('p5Canvas')) root.appendChild(node);
          }));
        });
        observer.observe(document.body, { childList: true });
        try { window.eval(code); instance = new p5(); } catch (e) { console.error(e); }
      };
    `
  },
  "p5-ts": {
    name: "p5.js TS",
    cdns: [P5_CDN, BABEL_CDN],
    babelPresets: ["typescript", "env"],
    styles: P5_RUNTIME_STYLES,
    logic: `
      let instance = null;
      window.__RUN_MODE__ = (code, root) => {
        if (instance) instance.remove();
        root.innerHTML = '';
        window.setup = window.draw = null;
        const observer = new MutationObserver(m => {
          m.forEach(mutation => mutation.addedNodes.forEach(node => {
            if (node.tagName === 'CANVAS' && node.classList.contains('p5Canvas')) root.appendChild(node);
          }));
        });
        observer.observe(document.body, { childList: true });
        try {
          const transpiled = Babel.transform(code, { 
            presets: ['env', 'typescript'], 
            filename: 'sketch.ts' 
          }).code;
          window.eval(transpiled); 
          instance = new p5(); 
        } catch (e) { console.error(e); }
      };
    `
  },
  react: {
    name: "React",
    cdns: REACT_CDNS,
    babelPresets: ["react", "env"],
    logic: `
      let rootInstance = null;
      const originalCreateRoot = window.ReactDOM.createRoot;
      window.ReactDOM.createRoot = (c, o) => {
        const r = originalCreateRoot.call(window.ReactDOM, c, o);
        if (c.id === 'root') rootInstance = r;
        return r;
      };
      window.__RUN_MODE__ = (code, root) => {
        if (rootInstance) { try { rootInstance.unmount(); } catch(e){} rootInstance = null; }
        root.innerHTML = '';
        try {
          const compiled = Babel.transform(code, { presets: ['react', 'env'], filename: 'App.js' }).code;
          eval(compiled);
        } catch (e) { console.error(e); }
      };
    `
  },
  "react-ts": {
    name: "React TS",
    cdns: REACT_CDNS,
    babelPresets: ["react", "typescript", "env"],
    logic: `
      let rootInstance = null;
      const originalCreateRoot = window.ReactDOM.createRoot;
      window.ReactDOM.createRoot = (c, o) => {
        const r = originalCreateRoot.call(window.ReactDOM, c, o);
        if (c.id === 'root') rootInstance = r;
        return r;
      };
      window.__RUN_MODE__ = (code, root) => {
        if (rootInstance) { try { rootInstance.unmount(); } catch(e){} rootInstance = null; }
        root.innerHTML = '';
        try {
          const compiled = Babel.transform(code, { presets: ['react', 'typescript', 'env'], filename: 'App.tsx' }).code;
          eval(compiled);
        } catch (e) { console.error(e); }
      };
    `
  },
  express: {
    name: "Express",
    mocks: EXPRESS_MOCK_SETUP,
    showPlaceholder: false,
    logic: `
      window.__MODULE_REGISTRY__['express'] = window.express;
      window.__RUN_MODE__ = (code, root) => {
        root.innerHTML = '';
        if (window.appInstance) window.appInstance.routes = { GET: {} };
        try { eval(code); } catch (e) { console.error(e); }
      };
    `
  },
  "express-ts": {
    name: "Express TS",
    cdns: [BABEL_CDN],
    mocks: EXPRESS_MOCK_SETUP,
    showPlaceholder: false,
    logic: `
      window.__MODULE_REGISTRY__['express'] = window.express;
      window.__RUN_MODE__ = (code, root) => {
        root.innerHTML = '';
        if (window.appInstance) window.appInstance.routes = { GET: {} };
        try {
          var exports = {};
          var module = { exports: exports };
          const transpiled = Babel.transform(code, {
            presets: [['env', { modules: 'commonjs' }], 'typescript'],
            filename: 'server.ts',
            sourceType: 'module'
          }).code;
          new Function('module', 'exports', transpiled)(module, exports);
        } catch (e) { console.error(e); }
      };
    `
  },
  hono: {
    name: "Hono",
    // Added BABEL_CDN to JS mode to support 'export default' transpilation
    cdns: [HONO_CDN, BABEL_CDN],
    mocks: HONO_MOCK_SETUP,
    showPlaceholder: false,
    logic: `
      window.__RUN_MODE__ = (code, root) => {
        root.innerHTML = '';
        const run = () => {
          if (!window.Hono || !window.Babel) {
            setTimeout(run, 50);
            return;
          }
          
          if (window.__setupHonoMock) window.__setupHonoMock(window.Hono);
          
          // Reset previous instance
          window.appInstance = null;

          try {
            // Setup CommonJS shim to capture exports
            var exports = {};
            var module = { exports: exports };
            
            // Transpile to handle 'export default'
            const transpiled = Babel.transform(code, {
                presets: [['env', { modules: 'commonjs' }]],
                filename: 'index.js',
                sourceType: 'module'
            }).code;

            // Execute code
            // We use 'call' to provide the 'this' context if needed, but mostly rely on scope
            new Function('module', 'exports', transpiled)(module, exports);

            // Check for exports
            const exportedApp = module.exports.default || module.exports;
            
            // If the user exported a Hono app, start it automatically
            if (exportedApp && typeof exportedApp.fetch === 'function') {
                window.__startHonoServer(exportedApp);
            }

          } catch (e) { console.error(e); }
        };
        run();
      };
    `
  },
  "hono-ts": {
    name: "Hono TS",
    cdns: [HONO_CDN, BABEL_CDN],
    mocks: HONO_MOCK_SETUP,
    showPlaceholder: false,
    logic: `
      window.__RUN_MODE__ = (code, root) => {
        root.innerHTML = '';
        const run = () => {
          if (!window.Hono || !window.Babel) {
            setTimeout(run, 50);
            return;
          }
          
          if (window.__setupHonoMock) window.__setupHonoMock(window.Hono);

          // Reset previous instance
          window.appInstance = null;

          try {
            // Setup CommonJS shim to capture exports
            var exports = {};
            var module = { exports: exports };

            const transpiled = Babel.transform(code, {
              presets: [['env', { modules: 'commonjs' }], 'typescript'],
              filename: 'server.ts',
              sourceType: 'module'
            }).code;
            
            new Function('module', 'exports', transpiled)(module, exports);

            // Check for exports
            const exportedApp = module.exports.default || module.exports;
            
            // If the user exported a Hono app, start it automatically
            if (exportedApp && typeof exportedApp.fetch === 'function') {
                window.__startHonoServer(exportedApp);
            }

          } catch (e) { console.error(e); }
        };
        run();
      };
    `
  },
  "node-js": {
    name: "Node JS",
    showPlaceholder: false,
    headless: true,
    logic: `
      window.__RUN_MODE__ = (code, root) => {
        root.innerHTML = '<div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; opacity:0.3;">\u{1F4BB} Console Environment</div>';
        try { new Function('document', 'window', 'root', code)(null, null, null); } catch (e) { console.error(e); }
      };
    `
  },
  "node-ts": {
    name: "Node TS",
    cdns: [BABEL_CDN],
    showPlaceholder: false,
    headless: true,
    logic: `
      window.__RUN_MODE__ = (code, root) => {
        root.innerHTML = '<div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; opacity:0.3;">\u{1F4BB} TS Console Environment</div>';
        try {
          const transpiled = Babel.transform(code, { presets: ['env', 'typescript'], filename: 'index.ts' }).code;
          new Function('document', 'window', 'root', transpiled)(null, null, null);
        } catch (e) { console.error(e); }
      };
    `
  }
};
var getSandboxHtml = (mode = "dom", isPredictionMode = false) => {
  const recipe = ENV_RECIPES[mode] || ENV_RECIPES.dom;
  return BASE_HTML_WRAPPER({
    cdns: recipe.cdns,
    mocks: recipe.mocks,
    styles: recipe.styles,
    logic: recipe.logic || "",
    showPlaceholder: isPredictionMode ? false : recipe.showPlaceholder
  });
};
var executeCodeInSandbox = (iframeContentWindow, code, options) => {
  const message = options === void 0 ? { type: "EXECUTE", code } : { type: "EXECUTE", code, payload: options };
  iframeContentWindow.postMessage(message, "*");
};

// components/PreviewContainer.tsx
import { jsx as jsx2, jsxs } from "react/jsx-runtime";
var PreviewContainer = ({
  themeMode,
  isReady,
  children,
  overlayMessage
}) => {
  return /* @__PURE__ */ jsxs("div", { className: `w-full h-full rounded-md overflow-hidden shadow-inner relative border transition-colors duration-300 ${themeMode === "dark" ? "bg-[#1a1a1a] border-gray-700" : "bg-white border-gray-200"}`, children: [
    children,
    !isReady && /* @__PURE__ */ jsx2("div", { className: "absolute inset-0 flex items-center justify-center pointer-events-none bg-black/5", children: /* @__PURE__ */ jsx2("p", { className: "text-gray-400 font-medium", children: overlayMessage || "Click 'Run Code' to execute" }) })
  ] });
};

// components/Console.tsx
import React2 from "react";
import { Terminal, Ban } from "lucide-react";

// components/Button.tsx
import { jsx as jsx3, jsxs as jsxs2 } from "react/jsx-runtime";
var Button = ({
  children,
  variant = "primary",
  icon,
  className = "",
  ...props
}) => {
  const baseStyles = "flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2";
  const variants = {
    primary: "bg-[hsl(var(--primary))] hover:opacity-90 text-[hsl(var(--primary-foreground))] focus:ring-[hsl(var(--ring))]",
    secondary: "bg-gray-700 hover:bg-gray-600 text-white focus:ring-gray-500",
    ghost: "bg-transparent hover:bg-black/10 dark:hover:bg-white/10 text-inherit focus:ring-gray-500"
  };
  return /* @__PURE__ */ jsxs2(
    "button",
    {
      className: `${baseStyles} ${variants[variant]} ${className}`,
      ...props,
      children: [
        icon && /* @__PURE__ */ jsx3("span", { className: "w-4 h-4", children: icon }),
        children
      ]
    }
  );
};

// components/Console.tsx
import { jsx as jsx4, jsxs as jsxs3 } from "react/jsx-runtime";
var Console = React2.memo(function Console2({
  logs,
  onClear,
  themeMode,
  className = ""
}) {
  return /* @__PURE__ */ jsxs3("div", { className: `flex flex-col h-full w-full overflow-hidden ${className} ${themeMode === "dark" ? "bg-[#1e1e1e]" : "bg-gray-50"}`, children: [
    /* @__PURE__ */ jsxs3("div", { className: `flex items-center justify-between px-3 py-1 shrink-0 border-b ${themeMode === "dark" ? "border-white/10 bg-[#252526]" : "border-gray-200 bg-gray-100"}`, children: [
      /* @__PURE__ */ jsxs3("div", { className: "flex items-center gap-2 text-xs font-semibold opacity-70", children: [
        /* @__PURE__ */ jsx4(Terminal, { className: "w-3 h-3" }),
        /* @__PURE__ */ jsxs3("span", { children: [
          "Console (",
          logs.length,
          ")"
        ] })
      ] }),
      /* @__PURE__ */ jsx4(Button, { variant: "ghost", onClick: onClear, className: "!p-1 h-6 w-6", title: "Clear Console", children: /* @__PURE__ */ jsx4(Ban, { className: "w-3 h-3" }) })
    ] }),
    /* @__PURE__ */ jsxs3(
      "div",
      {
        className: `flex-1 overflow-y-auto p-2 font-mono text-xs space-y-1 ${themeMode === "dark" ? "text-gray-300" : "text-gray-700"}`,
        children: [
          logs.length === 0 && /* @__PURE__ */ jsx4("div", { className: "h-full flex flex-col items-center justify-center opacity-30 select-none", children: /* @__PURE__ */ jsx4("span", { className: "italic", children: "No output" }) }),
          logs.map((log, i) => /* @__PURE__ */ jsxs3("div", { className: `
            border-b border-transparent hover:bg-black/5 dark:hover:bg-white/5 px-1 py-0.5 break-all whitespace-pre
            ${log.type === "error" ? "text-red-500 bg-red-500/5" : ""}
            ${log.type === "warn" ? "text-yellow-500 bg-yellow-500/5" : ""}
          `, children: [
            /* @__PURE__ */ jsx4("span", { className: "opacity-50 mr-2 select-none", children: ">" }),
            log.content
          ] }, i))
        ]
      }
    )
  ] });
});

// components/OutputFrame.tsx
import { GripHorizontal } from "lucide-react";
import { jsx as jsx5, jsxs as jsxs4 } from "react/jsx-runtime";
var MAX_CONSOLE_LOGS = 500;
var appendLog = (prev, entry) => prev.length >= MAX_CONSOLE_LOGS ? [...prev.slice(-(MAX_CONSOLE_LOGS - 1)), entry] : [...prev, entry];
var OutputFrame = ({
  runTrigger,
  code,
  themeMode,
  environmentMode,
  fixtureHtml,
  fixtureCss,
  isBlurred = false,
  isPredictionMode = false,
  debugMode = false
}) => {
  const iframeRef = useRef(null);
  const containerRef = useRef(null);
  const channelRef = useRef(null);
  const executionRef = useRef({ code, environmentMode, fixtureHtml, fixtureCss, debugMode });
  const [logs, setLogs] = useState([]);
  const [consoleHeight, setConsoleHeight] = useState(150);
  const [isDragging, setIsDragging] = useState(false);
  const isHeadless = environmentMode === "node-js" || environmentMode === "node-ts";
  const isHtmlMode = environmentMode === "html" || environmentMode === "html-css";
  const addSystemLog = useCallback((msg, type = "log") => {
    setLogs((prev) => appendLog(prev, {
      type,
      content: `[System] ${msg}`,
      timestamp: Date.now()
    }));
  }, []);
  const sandboxHtml = useMemo2(
    () => getSandboxHtml(environmentMode, isPredictionMode),
    [environmentMode, isPredictionMode]
  );
  useEffect(() => {
    executionRef.current = { code, environmentMode, fixtureHtml, fixtureCss, debugMode };
  }, [code, environmentMode, fixtureHtml, fixtureCss, debugMode]);
  const handleKernelMessage = useCallback((data) => {
    if (!data || typeof data !== "object") return;
    const { type, payload } = data;
    if (type === "CONSOLE_LOG" || type === "RUNTIME_ERROR" || type === "CONSOLE_WARN") {
      setLogs((prev) => appendLog(prev, {
        type: type === "RUNTIME_ERROR" ? "error" : type === "CONSOLE_WARN" ? "warn" : "log",
        content: payload,
        timestamp: Date.now()
      }));
    } else if (type === "READY_SIGNAL" && debugMode) {
      addSystemLog("Sandbox Iframe Ready Signal Received via MessageChannel.");
    }
  }, [debugMode, addSystemLog]);
  const kernelMessageRef = useRef(handleKernelMessage);
  useEffect(() => {
    kernelMessageRef.current = handleKernelMessage;
  }, [handleKernelMessage]);
  useEffect(() => () => {
    channelRef.current?.port1.close();
    channelRef.current = null;
  }, []);
  useEffect(() => {
    if (runTrigger > 0) {
      const execution = executionRef.current;
      setLogs([]);
      if (execution.debugMode) addSystemLog("Attempting to execute code...");
      if (iframeRef.current?.contentWindow) {
        const hasDomFixture = execution.environmentMode === "dom" && (execution.fixtureHtml !== void 0 || execution.fixtureCss !== void 0);
        if (hasDomFixture) {
          executeCodeInSandbox(iframeRef.current.contentWindow, execution.code, {
            fixtureHtml: execution.fixtureHtml,
            fixtureCss: execution.fixtureCss
          });
        } else {
          executeCodeInSandbox(iframeRef.current.contentWindow, execution.code);
        }
        if (execution.debugMode) addSystemLog("EXECUTE message dispatched.");
      } else if (execution.debugMode) {
        addSystemLog("FAILED: iframe.contentWindow is null.", "error");
      }
    }
  }, [runTrigger, addSystemLog]);
  useEffect(() => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ type: "THEME", mode: themeMode }, "*");
    }
  }, [themeMode]);
  useEffect(() => {
    if (!isHtmlMode) return;
    const timer = setTimeout(() => {
      if (iframeRef.current?.contentWindow) {
        executeCodeInSandbox(iframeRef.current.contentWindow, code);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [code, isHtmlMode]);
  const handleIframeLoad = () => {
    if (debugMode) addSystemLog('Iframe "onLoad" event fired.');
    if (!iframeRef.current?.contentWindow) return;
    channelRef.current?.port1.close();
    const channel = new MessageChannel();
    channelRef.current = channel;
    channel.port1.onmessage = (event) => kernelMessageRef.current(event.data);
    iframeRef.current.contentWindow.postMessage({ type: "INIT_PORT" }, "*", [channel.port2]);
    iframeRef.current.contentWindow.postMessage({ type: "THEME", mode: themeMode }, "*");
    if (isHtmlMode) executeCodeInSandbox(iframeRef.current.contentWindow, code);
    if (debugMode) addSystemLog("Channel Ports initialized.");
  };
  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleMouseMove = useCallback((e) => {
    if (!isDragging || !containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const relativeY = e.clientY - containerRect.top;
    const newHeight = containerRect.height - relativeY;
    setConsoleHeight(Math.max(30, Math.min(containerRect.height * 0.8, newHeight)));
  }, [isDragging]);
  const handleMouseUp = useCallback(() => setIsDragging(false), []);
  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "row-resize";
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);
  return /* @__PURE__ */ jsx5(
    PreviewContainer,
    {
      themeMode,
      isReady: isHtmlMode || runTrigger > 0,
      overlayMessage: isBlurred ? "Make your Prediction" : void 0,
      children: /* @__PURE__ */ jsxs4("div", { ref: containerRef, className: "w-full h-full flex flex-col relative", children: [
        !isHeadless && /* @__PURE__ */ jsx5("div", { className: "flex-1 min-h-0 relative", children: /* @__PURE__ */ jsx5(
          "iframe",
          {
            ref: iframeRef,
            srcDoc: sandboxHtml,
            title: "Code Output",
            sandbox: SANDBOX_ATTRIBUTES,
            className: `w-full h-full border-none ${isDragging ? "pointer-events-none" : ""}`,
            onLoad: handleIframeLoad
          },
          `${environmentMode}-${isPredictionMode}`
        ) }),
        !isHeadless && !isHtmlMode && /* @__PURE__ */ jsx5(
          "div",
          {
            onMouseDown: handleMouseDown,
            className: `h-3 shrink-0 flex items-center justify-center cursor-row-resize z-10 hover:bg-blue-500 hover:text-white transition-colors ${themeMode === "dark" ? "bg-[#252526] text-gray-600 border-t border-b border-black/20" : "bg-gray-100 text-gray-400 border-t border-b border-gray-200"}`,
            children: /* @__PURE__ */ jsx5(GripHorizontal, { className: "w-3 h-3" })
          }
        ),
        !isHtmlMode && /* @__PURE__ */ jsx5("div", { style: { height: isHeadless ? "100%" : consoleHeight }, className: "shrink-0 min-h-0", children: /* @__PURE__ */ jsx5(Console, { logs, onClear: () => setLogs([]), themeMode }) }),
        isHeadless && /* @__PURE__ */ jsx5(
          "iframe",
          {
            ref: iframeRef,
            srcDoc: sandboxHtml,
            title: "Headless Execution",
            sandbox: SANDBOX_ATTRIBUTES,
            className: "hidden",
            onLoad: handleIframeLoad
          },
          `headless-${environmentMode}`
        )
      ] })
    }
  );
};

// components/ServerOutput.tsx
import { useEffect as useEffect2, useRef as useRef2, useState as useState2, useCallback as useCallback2, useMemo as useMemo3 } from "react";
import { Server, Clock, AlertCircle, GripHorizontal as GripHorizontal2 } from "lucide-react";
import { jsx as jsx6, jsxs as jsxs5 } from "react/jsx-runtime";
var MAX_CONSOLE_LOGS2 = 500;
var appendLog2 = (prev, entry) => prev.length >= MAX_CONSOLE_LOGS2 ? [...prev.slice(-(MAX_CONSOLE_LOGS2 - 1)), entry] : [...prev, entry];
var ServerOutput = ({
  runTrigger,
  code,
  themeMode,
  environmentMode,
  isBlurred = false,
  debugMode = false,
  onTriggerRun
}) => {
  const iframeRef = useRef2(null);
  const containerRef = useRef2(null);
  const channelRef = useRef2(null);
  const [logs, setLogs] = useState2([]);
  const [route, setRoute] = useState2("/");
  const [method] = useState2("GET");
  const [response, setResponse] = useState2(null);
  const [pendingRequest, setPendingRequest] = useState2(null);
  const [isLoading, setIsLoading] = useState2(false);
  const [serverReady, setServerReady] = useState2(false);
  const [runtimeError, setRuntimeError] = useState2(null);
  const startupTimeoutRef = useRef2(null);
  const requestTimeoutRef = useRef2(null);
  const [consoleHeight, setConsoleHeight] = useState2(150);
  const [isDragging, setIsDragging] = useState2(false);
  const addSystemLog = useCallback2((msg) => {
    setLogs((prev) => appendLog2(prev, { type: "log", content: `[System] ${msg}`, timestamp: Date.now() }));
  }, []);
  const clearConsole = useCallback2(() => setLogs([]), []);
  const sendSimulatedRequest = useCallback2((reqMethod, reqUrl) => {
    if (!channelRef.current) return;
    const requestPayload = {
      type: "SIMULATE_REQUEST",
      payload: { method: reqMethod, url: reqUrl }
    };
    if (debugMode) addSystemLog(`Sending Request: ${reqMethod} ${reqUrl}`);
    channelRef.current.port1.postMessage(requestPayload);
  }, [debugMode, addSystemLog]);
  const handleSandboxMessage = useCallback2((data) => {
    if (!data || typeof data !== "object") return;
    const { type, payload } = data;
    switch (type) {
      case "SERVER_READY":
        setServerReady(true);
        setRuntimeError(null);
        addSystemLog("Server signaled ready.");
        setPendingRequest((prev) => {
          if (prev) {
            sendSimulatedRequest(prev.method, prev.url);
            return null;
          }
          return null;
        });
        break;
      case "REQUEST_COMPLETE":
        setResponse(payload);
        setIsLoading(false);
        if (debugMode) addSystemLog(`Request Success: Status ${payload.status}`);
        break;
      case "RUNTIME_ERROR":
        setRuntimeError(payload);
        setIsLoading(false);
        setPendingRequest(null);
        setLogs((prev) => appendLog2(prev, { type: "error", content: payload, timestamp: Date.now() }));
        setServerReady(false);
        break;
      case "CONSOLE_LOG":
      case "CONSOLE_WARN":
        setLogs((prev) => appendLog2(prev, {
          type: type === "CONSOLE_WARN" ? "warn" : "log",
          content: payload,
          timestamp: Date.now()
        }));
        break;
      case "CONSOLE_CLEAR":
        clearConsole();
        break;
      case "READY_SIGNAL":
        if (debugMode) addSystemLog("Sandbox established MessageChannel port.");
        break;
    }
  }, [debugMode, addSystemLog, clearConsole, sendSimulatedRequest]);
  const sandboxMessageRef = useRef2(handleSandboxMessage);
  useEffect2(() => {
    sandboxMessageRef.current = handleSandboxMessage;
  }, [handleSandboxMessage]);
  useEffect2(() => () => {
    channelRef.current?.port1.close();
    channelRef.current = null;
  }, []);
  useEffect2(() => {
    const globalListener = (event) => {
      if (event.source !== iframeRef.current?.contentWindow) return;
      if (event.data && typeof event.data === "object" && event.data.type) {
        sandboxMessageRef.current(event.data);
      }
    };
    window.addEventListener("message", globalListener);
    return () => window.removeEventListener("message", globalListener);
  }, []);
  const sandboxHtml = useMemo3(() => {
    return getSandboxHtml(environmentMode);
  }, [environmentMode]);
  useEffect2(() => {
    if (runTrigger > 0 && iframeRef.current?.contentWindow) {
      setServerReady(false);
      setResponse(null);
      setRuntimeError(null);
      setLogs([]);
      setPendingRequest((prev) => {
        if (!prev) {
          setIsLoading(true);
          return { method, url: route };
        }
        return prev;
      });
      if (debugMode) addSystemLog("Executing server code...");
      executeCodeInSandbox(iframeRef.current.contentWindow, code);
    }
  }, [runTrigger, code, debugMode, addSystemLog, method, route]);
  useEffect2(() => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ type: "THEME", mode: themeMode }, "*");
    }
  }, [themeMode]);
  const handleIframeLoad = () => {
    if (debugMode) addSystemLog("Server Iframe loaded.");
    if (!iframeRef.current?.contentWindow) return;
    channelRef.current?.port1.close();
    const channel = new MessageChannel();
    channelRef.current = channel;
    channel.port1.onmessage = (event) => sandboxMessageRef.current(event.data);
    iframeRef.current.contentWindow.postMessage({ type: "INIT_PORT" }, "*", [channel.port2]);
    iframeRef.current.contentWindow.postMessage({ type: "THEME", mode: themeMode }, "*");
  };
  const handleSendClick = () => {
    setIsLoading(true);
    setResponse(null);
    setRuntimeError(null);
    setPendingRequest({ method, url: route });
    if (onTriggerRun) {
      onTriggerRun();
    } else {
      console.warn("ServerOutput: onTriggerRun prop missing");
    }
  };
  useEffect2(() => {
    if (!isLoading || !pendingRequest || serverReady || runtimeError) {
      if (startupTimeoutRef.current) {
        window.clearTimeout(startupTimeoutRef.current);
        startupTimeoutRef.current = null;
      }
      return;
    }
    startupTimeoutRef.current = window.setTimeout(() => {
      setIsLoading(false);
      setPendingRequest(null);
      setServerReady(false);
      setRuntimeError("Server startup timed out. For Express, ensure your code calls app.listen(...). For Hono, export default app (or call app.fire/app.listen).");
      addSystemLog("Server startup timed out while waiting for SERVER_READY.");
    }, 5e3);
    return () => {
      if (startupTimeoutRef.current) {
        window.clearTimeout(startupTimeoutRef.current);
        startupTimeoutRef.current = null;
      }
    };
  }, [isLoading, pendingRequest, serverReady, runtimeError, addSystemLog]);
  useEffect2(() => {
    if (!isLoading || pendingRequest || runtimeError) {
      if (requestTimeoutRef.current) {
        window.clearTimeout(requestTimeoutRef.current);
        requestTimeoutRef.current = null;
      }
      return;
    }
    requestTimeoutRef.current = window.setTimeout(() => {
      setIsLoading(false);
      setRuntimeError("Request timed out. Check that your route handler sends a response: res.send()/res.json() for Express, or return a Response for Hono.");
      addSystemLog("Request timed out while waiting for REQUEST_COMPLETE.");
    }, 1e4);
    return () => {
      if (requestTimeoutRef.current) {
        window.clearTimeout(requestTimeoutRef.current);
        requestTimeoutRef.current = null;
      }
    };
  }, [isLoading, pendingRequest, runtimeError, addSystemLog]);
  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleMouseMove = useCallback2((e) => {
    if (!isDragging || !containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const relativeY = e.clientY - containerRect.top;
    const newHeight = containerRect.height - relativeY;
    setConsoleHeight(Math.max(30, Math.min(containerRect.height * 0.8, newHeight)));
  }, [isDragging]);
  const handleMouseUp = useCallback2(() => setIsDragging(false), []);
  useEffect2(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);
  const isReady = runTrigger > 0;
  return /* @__PURE__ */ jsxs5("div", { className: "flex flex-col h-full w-full gap-2", children: [
    /* @__PURE__ */ jsxs5("div", { className: `flex items-center gap-2 p-2 rounded-md border transition-colors ${themeMode === "dark" ? "bg-[#252526] border-white/10" : "bg-white border-gray-200"}`, children: [
      /* @__PURE__ */ jsx6("div", { className: `px-3 py-1.5 rounded text-xs font-bold tracking-wider ${themeMode === "dark" ? "bg-blue-900/50 text-blue-400" : "bg-blue-100 text-blue-700"}`, children: method }),
      /* @__PURE__ */ jsx6(
        "input",
        {
          type: "text",
          value: route,
          onChange: (e) => setRoute(e.target.value),
          placeholder: "/api/inventory",
          className: `flex-1 bg-transparent border-none outline-none text-sm font-mono ${themeMode === "dark" ? "text-white placeholder-gray-600" : "text-gray-800 placeholder-gray-400"}`,
          onKeyDown: (e) => e.key === "Enter" && handleSendClick()
        }
      ),
      /* @__PURE__ */ jsx6(
        Button,
        {
          onClick: handleSendClick,
          disabled: isLoading || isBlurred,
          className: "!py-1 !px-3 h-8 text-xs",
          title: "Restart Server & Send Request",
          children: isLoading ? pendingRequest ? "Starting..." : "Sending..." : "Send"
        }
      )
    ] }),
    /* @__PURE__ */ jsx6(PreviewContainer, { themeMode, isReady, overlayMessage: isBlurred ? "Make your Prediction" : void 0, children: /* @__PURE__ */ jsxs5("div", { ref: containerRef, className: "flex flex-col h-full relative", children: [
      isLoading && /* @__PURE__ */ jsxs5("div", { className: "absolute top-2 right-2 z-10 flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-xs shadow-lg backdrop-blur-md", children: [
        /* @__PURE__ */ jsx6(Clock, { className: "w-3 h-3 animate-pulse" }),
        /* @__PURE__ */ jsx6("span", { children: pendingRequest ? "Starting Server..." : "Processing..." })
      ] }),
      /* @__PURE__ */ jsx6("div", { className: `flex-1 overflow-auto p-4 font-mono text-sm ${themeMode === "dark" ? "bg-[#1e1e1e]" : "bg-gray-50"}`, children: runtimeError ? /* @__PURE__ */ jsxs5("div", { className: "p-4 border border-red-500/20 rounded bg-red-500/5 text-red-400", children: [
        /* @__PURE__ */ jsxs5("div", { className: "flex items-center gap-2 text-red-500 font-bold mb-2", children: [
          /* @__PURE__ */ jsx6(AlertCircle, { className: "w-4 h-4" }),
          /* @__PURE__ */ jsx6("span", { children: "Runtime Error" })
        ] }),
        /* @__PURE__ */ jsx6("pre", { className: "whitespace-pre-wrap break-all", children: runtimeError })
      ] }) : response ? /* @__PURE__ */ jsxs5("div", { className: "animate-in fade-in slide-in-from-top-2 duration-300", children: [
        /* @__PURE__ */ jsx6("div", { className: "flex items-center justify-between mb-4 pb-2 border-b border-dashed border-gray-500/20", children: /* @__PURE__ */ jsxs5("span", { className: `font-bold ${response.status < 300 ? "text-green-500" : "text-red-500"}`, children: [
          response.status,
          " ",
          response.status === 200 ? "OK" : ""
        ] }) }),
        /* @__PURE__ */ jsx6("pre", { className: `${themeMode === "dark" ? "text-blue-300" : "text-blue-700"}`, children: JSON.stringify(response.data, null, 2) })
      ] }) : /* @__PURE__ */ jsxs5("div", { className: "h-full flex flex-col items-center justify-center opacity-20", children: [
        /* @__PURE__ */ jsx6(Server, { className: "w-12 h-12 mb-2" }),
        /* @__PURE__ */ jsx6("p", { children: "Server Standby" })
      ] }) }),
      /* @__PURE__ */ jsx6("div", { onMouseDown: handleMouseDown, className: `h-3 shrink-0 flex items-center justify-center cursor-row-resize ${themeMode === "dark" ? "bg-[#252526] text-gray-600 border-t border-b border-black/20" : "bg-gray-100 text-gray-400 border-t border-b border-gray-200"}`, children: /* @__PURE__ */ jsx6(GripHorizontal2, { className: "w-3 h-3" }) }),
      /* @__PURE__ */ jsx6("div", { style: { height: consoleHeight }, className: "shrink-0 min-h-0", children: /* @__PURE__ */ jsx6(Console, { logs, onClear: clearConsole, themeMode }) }),
      /* @__PURE__ */ jsx6(
        "iframe",
        {
          ref: iframeRef,
          srcDoc: sandboxHtml,
          title: "Server Execution",
          sandbox: SANDBOX_ATTRIBUTES,
          className: "hidden",
          onLoad: handleIframeLoad
        },
        `server-${environmentMode}`
      )
    ] }) })
  ] });
};

// runtime/fileBundle.ts
var serializeFileBundle = (files) => JSON.stringify({ __csFiles__: 1, files });
var parseFileBundle = (code) => {
  try {
    const parsed = JSON.parse(code);
    if (parsed && parsed.__csFiles__ === 1 && parsed.files) {
      return {
        "index.html": String(parsed.files["index.html"] ?? ""),
        "style.css": String(parsed.files["style.css"] ?? "")
      };
    }
  } catch {
  }
  return { "index.html": code, "style.css": "" };
};

// components/CodingEnvironment.tsx
import { jsx as jsx7, jsxs as jsxs6 } from "react/jsx-runtime";
var HTML_CSS_FILES = ["index.html", "style.css"];
var getDisplayFilename = (mode) => mode === "html" ? "index.html" : `${mode}.script`;
var CodingEnvironment = ({
  code,
  onChange,
  onRun,
  isRunning,
  runTrigger,
  themeMode,
  environmentMode,
  fixtureHtml,
  fixtureCss,
  sessionId,
  predictionPrompt,
  debugMode = false
}) => {
  const [predictionAnswer, setPredictionAnswer] = useState3("");
  const [isPredictionLocked, setIsPredictionLocked] = useState3(false);
  const [layout, setLayout] = useState3("horizontal");
  const [editorRatio, setEditorRatio] = useState3(0.5);
  const [isDragging, setIsDragging] = useState3(false);
  const containerRef = useRef3(null);
  const isPredictionFulfilled = !predictionPrompt || predictionAnswer.trim().length > 0;
  const isHtmlCssMode = environmentMode === "html-css";
  const hasDomFixtures = environmentMode === "dom" && (fixtureHtml !== void 0 || fixtureCss !== void 0);
  const visibleFiles = useMemo4(() => {
    if (isHtmlCssMode) return HTML_CSS_FILES;
    if (!hasDomFixtures) return ["script.js"];
    return [
      "script.js",
      ...fixtureHtml !== void 0 ? ["index.html"] : [],
      ...fixtureCss !== void 0 ? ["style.css"] : []
    ];
  }, [isHtmlCssMode, hasDomFixtures, fixtureHtml, fixtureCss]);
  const isTabbedMode = visibleFiles.length > 1;
  const [activeFile, setActiveFile] = useState3(
    environmentMode === "html-css" ? "index.html" : "script.js"
  );
  const selectedFile = visibleFiles.includes(activeFile) ? activeFile : visibleFiles[0];
  const files = useMemo4(
    () => isHtmlCssMode ? parseFileBundle(code) : null,
    [isHtmlCssMode, code]
  );
  useEffect3(() => {
    if (!visibleFiles.includes(activeFile)) setActiveFile(visibleFiles[0]);
  }, [activeFile, visibleFiles]);
  const editorCode = isHtmlCssMode && files ? files[selectedFile] : hasDomFixtures && selectedFile === "index.html" ? fixtureHtml ?? "" : hasDomFixtures && selectedFile === "style.css" ? fixtureCss ?? "" : code;
  const handleEditorChange = (value) => {
    const next = value || "";
    if (isHtmlCssMode && files) {
      onChange(serializeFileBundle({ ...files, [selectedFile]: next }));
    } else if (!hasDomFixtures || selectedFile === "script.js") {
      onChange(next);
    }
  };
  const handleRunClick = () => {
    if (predictionPrompt) setIsPredictionLocked(true);
    onRun();
  };
  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleMouseMove = useCallback3((e) => {
    if (!isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const newRatio = layout === "horizontal" ? (e.clientX - rect.left) / rect.width : (e.clientY - rect.top) / rect.height;
    setEditorRatio(Math.max(0.2, Math.min(0.8, newRatio)));
  }, [isDragging, layout]);
  const handleMouseUp = useCallback3(() => setIsDragging(false), []);
  useEffect3(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);
  const isServerMode = environmentMode.startsWith("express") || environmentMode.startsWith("hono");
  return /* @__PURE__ */ jsxs6("div", { className: `flex-1 flex flex-col overflow-hidden ${themeMode === "dark" ? "bg-[#1e1e1e]" : "bg-white"}`, children: [
    predictionPrompt && /* @__PURE__ */ jsx7("div", { className: `p-4 border-b flex gap-4 ${themeMode === "dark" ? "bg-[#252526] border-white/10" : "bg-blue-50 border-blue-100"}`, children: /* @__PURE__ */ jsxs6("div", { className: "flex-1", children: [
      /* @__PURE__ */ jsx7("h3", { className: "text-xs font-bold uppercase tracking-wider text-purple-500 mb-2", children: "Knowledge Check" }),
      /* @__PURE__ */ jsx7("div", { className: "text-sm opacity-80 mb-3", children: predictionPrompt }),
      /* @__PURE__ */ jsx7(
        "textarea",
        {
          value: predictionAnswer,
          onChange: (e) => setPredictionAnswer(e.target.value),
          disabled: isPredictionLocked,
          placeholder: "What will happen when the code runs?",
          className: `w-full p-2 text-sm rounded border focus:ring-1 focus:ring-purple-500 outline-none transition-all ${themeMode === "dark" ? "bg-black/20 border-white/10 text-white" : "bg-white border-gray-200"}`
        }
      )
    ] }) }),
    /* @__PURE__ */ jsxs6("div", { className: `h-12 px-4 border-b flex items-center justify-between ${themeMode === "dark" ? "bg-[#1e1e1e] border-white/10 text-gray-400" : "bg-white border-gray-100"}`, children: [
      /* @__PURE__ */ jsxs6("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx7(FileCode, { className: "w-4 h-4 text-blue-500" }),
        isTabbedMode ? /* @__PURE__ */ jsx7("div", { className: "flex items-center gap-1", children: visibleFiles.map((file) => {
          const isFixtureFile = hasDomFixtures && file !== "script.js";
          return /* @__PURE__ */ jsxs6(
            "button",
            {
              onClick: () => setActiveFile(file),
              title: isFixtureFile ? "Fixed fixture" : void 0,
              className: `px-2 py-1 rounded text-xs font-mono font-medium transition-colors ${selectedFile === file ? themeMode === "dark" ? "bg-white/10 text-blue-400" : "bg-blue-50 text-blue-600" : "opacity-50 hover:opacity-80"}`,
              children: [
                file,
                isFixtureFile && /* @__PURE__ */ jsx7(Lock, { "aria-hidden": "true", className: "ml-1 inline h-3 w-3" })
              ]
            },
            file
          );
        }) }) : /* @__PURE__ */ jsx7("span", { className: "text-xs font-mono font-medium hidden sm:inline", children: getDisplayFilename(environmentMode) })
      ] }),
      /* @__PURE__ */ jsxs6("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsxs6("div", { className: "flex bg-black/5 dark:bg-white/5 p-0.5 rounded-lg border border-black/5 dark:border-white/5", children: [
          /* @__PURE__ */ jsxs6(
            "button",
            {
              onClick: () => setLayout("horizontal"),
              title: "Split View (Side by Side)",
              className: `flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-tight transition-all ${layout === "horizontal" ? "bg-white dark:bg-gray-700 shadow-sm text-blue-500" : "opacity-40 hover:opacity-60"}`,
              children: [
                /* @__PURE__ */ jsx7(Columns, { size: 12 }),
                /* @__PURE__ */ jsx7("span", { className: "hidden md:inline", children: "Split" })
              ]
            }
          ),
          /* @__PURE__ */ jsxs6(
            "button",
            {
              onClick: () => setLayout("vertical"),
              title: "Vertical View (Stacked)",
              className: `flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-tight transition-all ${layout === "vertical" ? "bg-white dark:bg-gray-700 shadow-sm text-blue-500" : "opacity-40 hover:opacity-60"}`,
              children: [
                /* @__PURE__ */ jsx7(Rows, { size: 12 }),
                /* @__PURE__ */ jsx7("span", { className: "hidden md:inline", children: "Stacked" })
              ]
            }
          )
        ] }),
        !isServerMode && /* @__PURE__ */ jsx7(
          Button,
          {
            onClick: handleRunClick,
            disabled: isRunning || !isPredictionFulfilled,
            variant: "primary",
            className: "h-8 !px-5 text-xs font-bold shadow-lg shadow-blue-500/20",
            icon: isRunning ? /* @__PURE__ */ jsx7(CheckCircle2, { className: "animate-pulse", size: 14 }) : /* @__PURE__ */ jsx7(Play, { size: 14 }),
            children: isRunning ? "RUNNING..." : "RUN CODE"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs6("div", { ref: containerRef, className: `flex-1 flex overflow-hidden ${layout === "horizontal" ? "flex-row" : "flex-col"}`, children: [
      /* @__PURE__ */ jsx7("div", { style: { [layout === "horizontal" ? "width" : "height"]: `${editorRatio * 100}%` }, className: "relative flex flex-col min-w-0 min-h-0", children: /* @__PURE__ */ jsx7(
        CodeEditor,
        {
          code: editorCode,
          onChange: handleEditorChange,
          themeMode,
          environmentMode,
          sessionId,
          activeFile: isTabbedMode ? selectedFile : void 0,
          readOnly: !!predictionPrompt && isPredictionLocked || hasDomFixtures && selectedFile !== "script.js"
        }
      ) }),
      /* @__PURE__ */ jsx7(
        "div",
        {
          onMouseDown: handleMouseDown,
          className: `flex items-center justify-center shrink-0 hover:bg-blue-500/50 transition-colors z-10 ${layout === "horizontal" ? "w-1.5 cursor-col-resize" : "h-1.5 cursor-row-resize"} ${themeMode === "dark" ? "bg-black/40" : "bg-gray-100"}`,
          children: layout === "horizontal" ? /* @__PURE__ */ jsx7(GripVertical, { size: 10, className: "opacity-20" }) : /* @__PURE__ */ jsx7(GripHorizontal3, { size: 10, className: "opacity-20" })
        }
      ),
      /* @__PURE__ */ jsx7("div", { style: { [layout === "horizontal" ? "width" : "height"]: `${(1 - editorRatio) * 100}%` }, className: `relative flex flex-col min-w-0 min-h-0 ${isDragging ? "pointer-events-none" : ""}`, children: /* @__PURE__ */ jsx7("div", { className: "flex-1 p-2 md:p-3 overflow-hidden", children: isServerMode ? /* @__PURE__ */ jsx7(
        ServerOutput,
        {
          runTrigger,
          code,
          themeMode,
          environmentMode,
          isBlurred: !isPredictionFulfilled,
          debugMode,
          onTriggerRun: handleRunClick
        }
      ) : /* @__PURE__ */ jsx7(
        OutputFrame,
        {
          runTrigger,
          code,
          themeMode,
          environmentMode,
          fixtureHtml: environmentMode === "dom" ? fixtureHtml : void 0,
          fixtureCss: environmentMode === "dom" ? fixtureCss : void 0,
          isBlurred: !isPredictionFulfilled,
          isPredictionMode: !!predictionPrompt,
          debugMode
        }
      ) }) })
    ] })
  ] });
};

// components/CodeShoebox.tsx
import { jsx as jsx8 } from "react/jsx-runtime";
var CodeShoebox = ({
  code,
  onCodeChange,
  environmentMode,
  fixtureHtml,
  fixtureCss,
  theme,
  themeMode,
  sessionId = 0,
  prediction_prompt,
  debugMode = false
}) => {
  const [runTrigger, setRunTrigger] = useState4(0);
  const [isRunning, setIsRunning] = useState4(false);
  useEffect4(() => {
    setRunTrigger(0);
    setIsRunning(false);
  }, [sessionId]);
  const handleRun = () => {
    setIsRunning(true);
    setRunTrigger((prev) => prev + 1);
    setTimeout(() => {
      setIsRunning(false);
    }, 500);
  };
  const themeStyles = useMemo5(() => {
    const colors = themeMode === "dark" ? theme.dark : theme.light;
    const defaultBg = themeMode === "dark" ? "220 13% 18%" : "0 0% 98%";
    const defaultFg = themeMode === "dark" ? "0 0% 95%" : "220 13% 18%";
    return {
      "--primary": colors.primary,
      "--primary-foreground": colors.primaryForeground,
      "--ring": colors.ring,
      "--sidebar-primary": colors.sidebarPrimary,
      "--sidebar-primary-foreground": colors.sidebarPrimaryForeground,
      "--sidebar-ring": colors.sidebarRing,
      "--background": colors.background || defaultBg,
      "--foreground": colors.foreground || defaultFg
    };
  }, [themeMode, theme]);
  return /* @__PURE__ */ jsx8(
    "div",
    {
      className: "flex flex-col h-full w-full transition-colors duration-300 bg-[hsl(var(--background))] text-[hsl(var(--foreground))]",
      style: themeStyles,
      children: /* @__PURE__ */ jsx8(
        CodingEnvironment,
        {
          sessionId,
          code,
          onChange: onCodeChange,
          onRun: handleRun,
          isRunning,
          runTrigger,
          themeMode,
          environmentMode,
          fixtureHtml,
          fixtureCss,
          predictionPrompt: prediction_prompt,
          debugMode
        },
        sessionId
      )
    }
  );
};

// hooks/useSandboxState.ts
import { useState as useState5, useEffect as useEffect5, useCallback as useCallback4 } from "react";

// theme.ts
var baseTheme = {
  name: "Base (Indigo)",
  light: {
    primary: "239 84% 67%",
    primaryForeground: "0 0% 100%",
    ring: "239 84% 67%",
    sidebarPrimary: "239 84% 67%",
    sidebarPrimaryForeground: "0 0% 100%",
    sidebarRing: "239 84% 67%"
  },
  dark: {
    primary: "239 84% 67%",
    primaryForeground: "0 0% 100%",
    ring: "239 84% 67%",
    sidebarPrimary: "239 84% 67%",
    sidebarPrimaryForeground: "0 0% 100%",
    sidebarRing: "239 84% 67%"
  }
};
var borisTheme = {
  name: "Boris",
  light: {
    primary: "211 43% 30%",
    primaryForeground: "0 0% 100%",
    ring: "211 43% 30%",
    sidebarPrimary: "211 43% 30%",
    sidebarPrimaryForeground: "0 0% 100%",
    sidebarRing: "211 43% 30%",
    background: "40 33% 95%",
    foreground: "15 24% 20%",
    card: "0 0% 100%",
    cardForeground: "15 24% 20%",
    muted: "40 20% 90%",
    mutedForeground: "24 26% 44%",
    border: "15 24% 20%",
    input: "0 0% 100%"
  },
  dark: {
    primary: "211 50% 45%",
    primaryForeground: "0 0% 100%",
    ring: "211 50% 45%",
    sidebarPrimary: "211 50% 45%",
    sidebarPrimaryForeground: "0 0% 100%",
    sidebarRing: "211 50% 45%",
    background: "15 24% 12%",
    foreground: "40 33% 95%",
    card: "15 24% 16%",
    cardForeground: "40 33% 95%",
    muted: "15 20% 20%",
    mutedForeground: "24 26% 60%",
    border: "24 26% 30%",
    input: "15 24% 20%"
  }
};
var modernLabTheme = {
  name: "Modern Lab",
  light: {
    primary: "217 91% 60%",
    primaryForeground: "0 0% 100%",
    ring: "217 91% 60%",
    sidebarPrimary: "217 91% 60%",
    sidebarPrimaryForeground: "0 0% 100%",
    sidebarRing: "217 91% 60%",
    tagBackground: "34 47% 85%",
    tagForeground: "16 20% 29%"
  },
  dark: {
    primary: "217 91% 60%",
    primaryForeground: "0 0% 100%",
    ring: "217 91% 60%",
    sidebarPrimary: "217 91% 60%",
    sidebarPrimaryForeground: "0 0% 100%",
    sidebarRing: "217 91% 60%",
    tagBackground: "16 20% 25%",
    tagForeground: "34 47% 85%"
  }
};
var themes = [baseTheme, borisTheme, modernLabTheme];

// constants.ts
var HTML_STARTER_CODE = `<!DOCTYPE html>
<html>
<head>
  <title>My First Page</title>
  <style>
    body {
      font-family: sans-serif;
      margin: 2rem;
    }
    h1 { color: #6366f1; }
    .highlight {
      background: #fef08a;
      padding: 0 4px;
    }
  </style>
</head>
<body>
  <h1>Hello, HTML!</h1>
  <p>This is a <span class="highlight">real
     web page</span>. Edit it and press Run.</p>
  <a href="https://developer.mozilla.org">
    Learn more at MDN</a>
</body>
</html>
`;
var HTML_CSS_STARTER_CODE = serializeFileBundle({
  "index.html": `<!DOCTYPE html>
<html>
<head>
  <title>Two Files</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <h1>Hello, style.css!</h1>
  <p>The styles for this page live in the <strong>style.css</strong> tab.</p>
</body>
</html>
`,
  "style.css": `body {
  font-family: sans-serif;
  margin: 2rem;
}

h1 {
  color: #6366f1;
}

strong {
  background: #fef08a;
  padding: 0 4px;
}
`
});
var STARTER_CODE = `// Welcome to your coding sandbox!
// You can use standard JavaScript here.
// 'root' is a reference to the main container div.

// Example 1: Manipulate the DOM
const heading = document.createElement('h1');
heading.innerText = 'Hello, Sandbox!';
heading.style.color = '#3b82f6';
root.appendChild(heading);

// Example 2: Add some interactivity
const button = document.createElement('button');
button.innerText = 'Click Me';
button.style.marginTop = '10px';
button.style.padding = '8px 16px';
button.style.cursor = 'pointer';

button.onclick = () => {
    console.log('Button clicked! Interaction detected at ' + new Date().toLocaleTimeString());
};

root.appendChild(button);

// Example 3: Console logging
console.log('Code loaded successfully.');
`;
var TYPESCRIPT_STARTER_CODE = [
  "// Welcome to TypeScript!",
  "// The browser will transpile this code before running it.",
  "",
  "interface User {",
  "  id: number;",
  "  name: string;",
  "  role: 'admin' | 'user';",
  "}",
  "",
  "const currentUser: User = {",
  "  id: 42,",
  '  name: "Sandbox Developer",',
  '  role: "admin"',
  "};",
  "",
  "// 'root' is available in the global scope",
  "const displayUser = (user: User) => {",
  "  const card = document.createElement('div');",
  "  Object.assign(card.style, {",
  "    padding: '20px',",
  "    border: '1px solid #ccc',",
  "    borderRadius: '8px',",
  "    fontFamily: 'monospace'",
  "  });",
  "",
  "  card.innerHTML = `",
  "    <h3>${user.name}</h3>",
  "    <p>ID: ${user.id}</p>",
  '    <p>Role: <span style="color: blue">${user.role}</span></p>',
  "  `;",
  "  ",
  "  root.appendChild(card);",
  "};",
  "",
  "displayUser(currentUser);",
  'console.log("TypeScript execution complete");'
].join("\n");
var P5_STARTER_CODE = `// Welcome to p5.js Creative Coding!
// The console below will capture your logs.

function setup() {
  createCanvas(400, 400);
  background(220);
  console.log("p5.js setup complete!");
}

function draw() {
  // Move mouse to draw
  if (mouseIsPressed) {
    fill(0);
  } else {
    fill(255);
  }
  
  // Draw an ellipse at mouse position
  ellipse(mouseX, mouseY, 20, 20);
}
`;
var P5_TS_STARTER_CODE = `/**
 * p5.js + TypeScript
 * Using interfaces and types for creative coding!
 */

interface Particle {
  x: number;
  y: number;
  size: number;
  color: string;
}

const particles: Particle[] = [];

// Global scope p5 functions
(window as any).setup = () => {
  createCanvas(400, 400);
  background(20);
  console.log("Typed p5 setup complete");
};

(window as any).draw = () => {
  background(20, 20);
  
  if (mouseIsPressed) {
    const p: Particle = {
      x: mouseX,
      y: mouseY,
      size: random(10, 30),
      color: \`hsl(\${frameCount % 360}, 70%, 60%)\`
    };
    particles.push(p);
  }

  // Draw typed particles
  particles.forEach((p, i) => {
    noStroke();
    fill(p.color);
    circle(p.x, p.y, p.size);
    p.size *= 0.95; // Shrink
    if (p.size < 0.5) particles.splice(i, 1);
  });
};
`;
var REACT_STARTER_CODE = `import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div style={{ fontFamily: 'sans-serif', textAlign: 'center', padding: 20 }}>
      <h2>React Counter</h2>
      <p style={{ fontSize: '2rem', margin: '10px 0' }}>{count}</p>
      <button 
        style={{ padding: '8px 16px', cursor: 'pointer', fontSize: '1rem' }}
        onClick={() => setCount(count + 1)}
      >
        Increment
      </button>
    </div>
  );
}

const root = createRoot(document.getElementById('root'));
root.render(<Counter />);
`;
var REACT_TS_STARTER_CODE = `import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';

interface CounterProps {
  start?: number;
}

const Counter: React.FC<CounterProps> = ({ start = 0 }) => {
  const [count, setCount] = useState<number>(start);

  return (
    <div style={{ fontFamily: 'sans-serif', textAlign: 'center', padding: 20 }}>
      <h2>React + TypeScript</h2>
      <p style={{ fontSize: '2rem', margin: '10px 0' }}>{count}</p>
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <button 
          onClick={() => setCount(c => c - 1)}
          style={{ padding: '8px 16px', cursor: 'pointer' }}
        >
          -
        </button>
        <button 
          onClick={() => setCount(c => c + 1)}
          style={{ padding: '8px 16px', cursor: 'pointer' }}
        >
          +
        </button>
      </div>
    </div>
  );
};

// Ensure root exists
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<Counter start={10} />);
}
`;
var EXPRESS_STARTER_CODE = [
  "// Welcome to the Express.js Simulator!",
  "// We've mocked 'express' so you can write server-side code in the browser.",
  "",
  "const app = express();",
  "const port = 3000;",
  "",
  "// Database simulation",
  "const users = [",
  "  { id: 1, name: 'Alice', role: 'engineer' },",
  "  { id: 2, name: 'Bob', role: 'designer' }",
  "];",
  "",
  "// Define your routes below",
  "app.get('/', (req, res) => {",
  "  res.json({ message: 'Welcome to the mock API!' });",
  "});",
  "",
  "app.get('/users', (req, res) => {",
  "  res.json(users);",
  "});",
  "",
  "app.get('/users/:id', (req, res) => {",
  "  const id = parseInt(req.params.id);",
  "  const user = users.find(u => u.id === id);",
  "  ",
  "  if (user) {",
  "    res.json(user);",
  "  } else {",
  "    res.status(404).json({ error: 'User not found' });",
  "  }",
  "});",
  "",
  "// Start the server",
  "app.listen(port, () => {",
  "  console.log(`Mock server listening on port ${port}`);",
  "});"
].join("\n");
var EXPRESS_TS_STARTER_CODE = [
  "// Express + TypeScript Simulator",
  "import express, { Request, Response } from 'express';",
  "",
  "const app = express();",
  "const port = 3000;",
  "",
  "interface Product {",
  "  id: number;",
  "  name: string;",
  "  stock: number;",
  "}",
  "",
  "const inventory: Product[] = [",
  '  { id: 101, name: "Laptop", stock: 5 },',
  '  { id: 102, name: "Mouse", stock: 12 }',
  "];",
  "",
  "app.get('/', (req: Request, res: Response) => {",
  '  res.json({ status: "system_nominal", timestamp: Date.now() });',
  "});",
  "",
  "app.get('/products', (req: Request, res: Response) => {",
  "  res.json(inventory);",
  "});",
  "",
  "app.get('/products/:id', (req: Request, res: Response) => {",
  "  const id = parseInt(req.params.id);",
  "  const item = inventory.find(p => p.id === id);",
  "  ",
  "  if (item) {",
  "    res.json(item);",
  "  } else {",
  '    res.status(404).json({ error: "Product not found" });',
  "  }",
  "});",
  "",
  "app.listen(port, () => {",
  "  console.log(`TS Server initialized on port ${port}`);",
  "});"
].join("\n");
var HONO_STARTER_CODE = [
  "// Modern Server Simulation using Hono!",
  "// Hono is built on web standards like Request and Response.",
  "",
  "const app = new Hono();",
  "",
  "app.get('/', (c) => {",
  "  return c.text('Hono says hello!');",
  "});",
  "",
  "app.get('/api/hello', (c) => {",
  "  return c.json({",
  "    message: 'Hono is lightweight and fast!',",
  "    runtime: 'Browser Sandbox'",
  "  });",
  "});",
  "",
  "// Try sending a GET request to /user/123",
  "app.get('/user/:id', (c) => {",
  "  const id = c.req.param('id');",
  "  return c.json({ userId: id, status: 'active' });",
  "});",
  "",
  "// Standard Export for Modern Runtimes (Cloudflare, Bun, etc)",
  "export default app;"
].join("\n");
var HONO_TS_STARTER_CODE = [
  "// Hono + TypeScript",
  "import { Hono } from 'hono';",
  "",
  "const app = new Hono();",
  "",
  "interface Profile {",
  "  username: string;",
  "  bio: string;",
  "}",
  "",
  "const profile: Profile = {",
  '  username: "shoebox_dev",',
  '  bio: "Simulating the future of web frameworks in a tab."',
  "};",
  "",
  "app.get('/', (c) => c.text('Hono TS Environment Ready'));",
  "",
  "app.get('/profile', (c) => {",
  "  return c.json(profile);",
  "});",
  "",
  "export default app;"
].join("\n");
var NODE_JS_STARTER_CODE = `/**
 * Logic & Algorithms: The Reducer Pattern
 * 
 * Scenario: Track Meet Analysis
 * Goal: Sum up the total miles where the pace was under 7:00 min/mile.
 */

const trackMeets = [
  { event: "High School Invitational", miles: 3.1, pacePerMile: 6.45 },
  { event: "City Championship", miles: 3.1, pacePerMile: 7.10 },
  { event: "District Finals", miles: 3.1, pacePerMile: 6.55 },
  { event: "State Meet", miles: 3.1, pacePerMile: 6.50 },
  { event: "Morning Training Run", miles: 5.0, pacePerMile: 8.30 },
  { event: "Speed Workout", miles: 4.0, pacePerMile: 6.58 }
];

console.log("Analyzing Track Meet Data...");
console.table(trackMeets);

// Use reduce to filter and sum in one pass
const eliteMiles = trackMeets.reduce((total, meet) => {
  if (meet.pacePerMile < 7.0) {
    console.log(\`\u2705 Included: \${meet.event} (\${meet.miles} miles @ \${meet.pacePerMile})\`);
    return total + meet.miles;
  }
  return total;
}, 0);

console.log("\\n--- Results ---");
console.log(\`Total "Elite" Miles (Under 7:00 pace): \${eliteMiles.toFixed(1)} miles\`);
`;
var NODE_TS_STARTER_CODE = `/**
 * Pure TypeScript Console Environment
 * Focus on types and logic without DOM distraction.
 */

interface Task {
  id: number;
  title: string;
  completed: boolean;
}

class TodoList {
  private tasks: Task[] = [];

  addTask(title: string): void {
    const newTask: Task = {
      id: this.tasks.length + 1,
      title,
      completed: false
    };
    this.tasks.push(newTask);
    console.log(\`Added task: "\${title}"\`);
  }

  showTasks(): void {
    console.log("--- Current Todo List ---");
    console.table(this.tasks);
  }
}

const myTodos = new TodoList();
myTodos.addTask("Learn TypeScript Types");
myTodos.addTask("Master the Console");
myTodos.showTasks();
`;

// hooks/useSandboxState.ts
var VALID_MODES = [
  "html",
  "html-css",
  "dom",
  "typescript",
  "p5",
  "p5-ts",
  "react",
  "react-ts",
  "express",
  "express-ts",
  "hono",
  "hono-ts",
  "node-js",
  "node-ts"
];
var getStarterCode = (mode) => {
  switch (mode) {
    case "html":
      return HTML_STARTER_CODE;
    case "html-css":
      return HTML_CSS_STARTER_CODE;
    case "p5":
      return P5_STARTER_CODE;
    case "p5-ts":
      return P5_TS_STARTER_CODE;
    case "react":
      return REACT_STARTER_CODE;
    case "typescript":
      return TYPESCRIPT_STARTER_CODE;
    case "react-ts":
      return REACT_TS_STARTER_CODE;
    case "express":
      return EXPRESS_STARTER_CODE;
    case "express-ts":
      return EXPRESS_TS_STARTER_CODE;
    case "hono":
      return HONO_STARTER_CODE;
    case "hono-ts":
      return HONO_TS_STARTER_CODE;
    case "node-js":
      return NODE_JS_STARTER_CODE;
    case "node-ts":
      return NODE_TS_STARTER_CODE;
    default:
      return STARTER_CODE;
  }
};
var useSandboxState = (persistenceKey, initialCodeOverride, defaultMode = "dom") => {
  const STORAGE_PREFIX = persistenceKey ? `cs_${persistenceKey}` : "";
  const getStorageKey = useCallback4((key) => `${STORAGE_PREFIX}_${key}`, [STORAGE_PREFIX]);
  const loadState = (keySuffix, fallback, validValues) => {
    if (!persistenceKey || typeof window === "undefined") return fallback;
    try {
      const saved = localStorage.getItem(getStorageKey(keySuffix));
      if (!saved) return fallback;
      if (validValues && !validValues.includes(saved)) return fallback;
      return saved;
    } catch {
      return fallback;
    }
  };
  const loadCode = useCallback4((mode) => {
    const fallback = initialCodeOverride ?? getStarterCode(mode);
    if (!persistenceKey || typeof window === "undefined") return fallback;
    try {
      const saved = localStorage.getItem(getStorageKey(`code_${mode}`));
      return saved || fallback;
    } catch {
      return fallback;
    }
  }, [persistenceKey, getStorageKey, initialCodeOverride]);
  const [environmentMode, setEnvironmentMode] = useState5(() => loadState("env_mode", defaultMode, VALID_MODES));
  const [themeMode, setThemeMode] = useState5(() => loadState("theme_mode", "dark", ["light", "dark"]));
  const [activeThemeName, setActiveThemeName] = useState5(() => loadState("theme_name", themes[0].name, themes.map((t) => t.name)));
  const [code, setCode] = useState5(() => loadCode(environmentMode));
  const [sessionId, setSessionId] = useState5(() => Math.floor(Math.random() * 1e6));
  useEffect5(() => {
    if (!persistenceKey) return;
    localStorage.setItem(getStorageKey("env_mode"), environmentMode);
    localStorage.setItem(getStorageKey("theme_mode"), themeMode);
    localStorage.setItem(getStorageKey("theme_name"), activeThemeName);
    localStorage.setItem(getStorageKey(`code_${environmentMode}`), code);
  }, [environmentMode, themeMode, activeThemeName, code, persistenceKey, getStorageKey]);
  const switchMode = useCallback4((newMode) => {
    if (newMode === environmentMode) return;
    setEnvironmentMode(newMode);
    setCode(loadCode(newMode));
    setSessionId((prev) => prev + 1);
  }, [environmentMode, loadCode]);
  const resetCode = useCallback4(() => {
    const starter = initialCodeOverride ?? getStarterCode(environmentMode);
    setCode(starter);
    setSessionId((prev) => prev + 1);
  }, [environmentMode, initialCodeOverride]);
  return {
    environmentMode,
    themeMode,
    activeThemeName,
    code,
    sessionId,
    setEnvironmentMode: switchMode,
    setThemeMode,
    setActiveThemeName,
    setCode,
    resetCode
  };
};

// hooks/useAutoKey.ts
import { useMemo as useMemo6 } from "react";
var useAutoKey = (identifier, initialCode = "", prefix = "auto") => {
  const key = useMemo6(() => {
    if (typeof window === "undefined") {
      return `${prefix}_server`;
    }
    const path = window.location.pathname;
    const normalizedId = identifier.trim().replace(/\s+/g, " ");
    const normalizedCode = initialCode.trim();
    const input = `${path}::${normalizedId}::${normalizedCode}`;
    let hash = 5381;
    for (let i = 0; i < input.length; i++) {
      hash = (hash << 5) + hash + input.charCodeAt(i);
      hash = hash | 0;
    }
    const hashString = (hash >>> 0).toString(36);
    return `${prefix}_${hashString}`;
  }, [identifier, initialCode, prefix]);
  return key;
};
export {
  CodeShoebox,
  baseTheme,
  borisTheme,
  modernLabTheme,
  themes,
  useAutoKey,
  useSandboxState
};
