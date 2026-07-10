"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// export.ts
var export_exports = {};
__export(export_exports, {
  CodeShoebox: () => CodeShoebox,
  baseTheme: () => baseTheme,
  borisTheme: () => borisTheme,
  modernLabTheme: () => modernLabTheme,
  parseHtmlCssFiles: () => parseHtmlCssFiles,
  serializeHtmlCssFiles: () => serializeHtmlCssFiles,
  themes: () => themes,
  useAutoKey: () => useAutoKey,
  useSandboxState: () => useSandboxState
});
module.exports = __toCommonJS(export_exports);

// components/CodeShoebox.tsx
var import_react6 = require("react");

// components/CodingEnvironment.tsx
var import_react5 = require("react");
var import_lucide_react4 = require("lucide-react");

// components/CodeEditor.tsx
var import_react = require("react");
var import_react2 = __toESM(require("@monaco-editor/react"), 1);

// utils/htmlCssFiles.ts
var HTML_CSS_CODE_VERSION = "codeshoebox/html-css/v1";
var EMPTY_FILES = {
  html: "",
  css: ""
};
var serializeHtmlCssFiles = (files) => {
  const bundle = {
    version: HTML_CSS_CODE_VERSION,
    html: files.html,
    css: files.css
  };
  return JSON.stringify(bundle, null, 2);
};
var parseHtmlCssFiles = (code) => {
  if (!code.trim()) return EMPTY_FILES;
  try {
    const parsed = JSON.parse(code);
    if (parsed && parsed.version === HTML_CSS_CODE_VERSION && typeof parsed.html === "string" && typeof parsed.css === "string") {
      return {
        html: parsed.html,
        css: parsed.css
      };
    }
  } catch {
  }
  const styleMatch = code.match(/<style\b[^>]*>([\s\S]*?)<\/style>/i);
  if (!styleMatch) {
    return {
      html: code,
      css: ""
    };
  }
  return {
    html: code.replace(styleMatch[0], "").trim(),
    css: styleMatch[1].trim()
  };
};

// components/CodeEditor.tsx
var import_jsx_runtime = require("react/jsx-runtime");
var EDITOR_FONT_FAMILY = 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';
var CodeEditor = ({
  code,
  onChange,
  themeMode,
  environmentMode,
  sessionId,
  readOnly = false
}) => {
  const [activeHtmlCssFile, setActiveHtmlCssFile] = (0, import_react.useState)("html");
  const isHtmlCssMode = environmentMode === "html-css";
  const htmlCssFiles = (0, import_react.useMemo)(() => parseHtmlCssFiles(code), [code]);
  const editorValue = isHtmlCssMode ? htmlCssFiles[activeHtmlCssFile] : code;
  const modelPath = (0, import_react.useMemo)(() => {
    if (environmentMode === "html-css") {
      const fileName = activeHtmlCssFile === "html" ? "index.html" : "styles.css";
      return `sandbox-html-css-${sessionId}/${fileName}`;
    }
    const basePath = `sandbox-${environmentMode}-${sessionId}`;
    switch (environmentMode) {
      case "typescript":
      case "express-ts":
      case "hono-ts":
      case "p5-ts":
      case "node-ts":
        return `${basePath}.ts`;
      case "react-ts":
        return `${basePath}.tsx`;
      case "react":
        return `${basePath}.jsx`;
      case "p5":
        return `${basePath}.js`;
      default:
        return `${basePath}.js`;
    }
  }, [sessionId, environmentMode, activeHtmlCssFile]);
  const language = (0, import_react.useMemo)(() => {
    if (environmentMode === "html-css") {
      return activeHtmlCssFile === "html" ? "html" : "css";
    }
    const tsModes = ["typescript", "react-ts", "express-ts", "hono-ts", "node-ts", "p5-ts"];
    if (tsModes.includes(environmentMode)) return "typescript";
    return "javascript";
  }, [environmentMode, activeHtmlCssFile]);
  const handleChange = (value) => {
    if (!isHtmlCssMode) {
      onChange(value);
      return;
    }
    onChange(serializeHtmlCssFiles({
      ...htmlCssFiles,
      [activeHtmlCssFile]: value || ""
    }));
  };
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
                declare module 'react' { var x: any; export = x; }
                declare module 'react-dom/client' { var x: any; export = x; }
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
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "monaco-editor-container h-full w-full overflow-hidden flex flex-col", children: [
    isHtmlCssMode && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: `h-10 shrink-0 flex items-end gap-1 px-3 pt-2 border-b ${themeMode === "dark" ? "bg-[#252526] border-white/10" : "bg-gray-50 border-gray-200"}`, children: [
      { id: "html", label: "index.html" },
      { id: "css", label: "styles.css" }
    ].map((file) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "button",
      {
        type: "button",
        onClick: () => setActiveHtmlCssFile(file.id),
        disabled: readOnly,
        className: `h-8 px-3 text-xs font-mono border border-b-0 rounded-t-md transition-colors ${activeHtmlCssFile === file.id ? themeMode === "dark" ? "bg-[#1e1e1e] border-white/10 text-white" : "bg-white border-gray-200 text-gray-900" : themeMode === "dark" ? "bg-transparent border-transparent text-gray-400 hover:text-gray-200" : "bg-transparent border-transparent text-gray-500 hover:text-gray-800"}`,
        children: file.label
      },
      file.id
    )) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "flex-1 min-h-0", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_react2.default,
      {
        height: "100%",
        path: modelPath,
        language,
        theme: themeMode === "dark" ? "vs-dark" : "light",
        value: editorValue,
        onChange: handleChange,
        onMount: handleEditorDidMount,
        loading: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-full w-full flex items-center justify-center text-sm opacity-50", children: "Loading Editor..." }),
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
    ) })
  ] });
};

// components/OutputFrame.tsx
var import_react3 = require("react");

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

    // Intercept standard logs
    ['log', 'error', 'warn', 'info'].forEach(method => {
        const original = console[method];
        console[method] = function(...args) {
            original.apply(console, args);
            const content = args.map(arg => {
                if (typeof arg === 'object') {
                    try { return JSON.stringify(arg, null, 2); } catch(e) { return String(arg); }
                }
                return String(arg);
            }).join(' ');
            sendPayload(method === 'error' ? 'RUNTIME_ERROR' : (method === 'warn' ? 'CONSOLE_WARN' : 'CONSOLE_LOG'), content);
        };
    });

    console.log("[Kernel] Sandbox started. Initializing environment...");

    window.onerror = (msg, src, line) => sendPayload('RUNTIME_ERROR', \`Error: \${msg} (Line \${line})\`);

    window.addEventListener('message', (event) => {
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
            window.__RUN_MODE__(code, root);
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
                            handler(req, res);
                        } catch (e) {
                            console.error(e);
                            resolve({ status: 500, data: { error: e.message } });
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
            const response = await appInstance._handleRequest(method, url);
            const completeMsg = { type: 'REQUEST_COMPLETE', payload: response };
            
            if (window.messagePort) {
                window.messagePort.postMessage(completeMsg);
            } else {
                window.parent.postMessage(completeMsg, '*');
            }
        }
    };

    // Listen on the main window for initial requests (fallback)
    window.addEventListener('message', requestHandler);
    
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

    window.addEventListener('message', requestHandler);
    
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
var BABEL_CDN = '<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>';
var REACT_CDNS = [
  '<script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>',
  '<script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>',
  BABEL_CDN
];
var P5_CDN = '<script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.min.js"></script>';
var HONO_CDN = '<script type="module">import { Hono } from "https://esm.sh/hono@4.1.0"; window.Hono = Hono;</script>';
var ENV_RECIPES = {
  dom: {
    name: "DOM",
    logic: `
      window.__RUN_MODE__ = (code, root) => {
        root.innerHTML = '';
        try { new Function('root', code)(root); } catch (e) { console.error(e); }
      };
    `
  },
  "html-css": {
    name: "HTML + CSS",
    styles: `
      #root {
        display: block;
        align-items: initial;
      }
    `,
    logic: `
      const HTML_CSS_CODE_VERSION = "${HTML_CSS_CODE_VERSION}";

      const parseHtmlCssFiles = (code) => {
        try {
          const parsed = JSON.parse(code);
          if (
            parsed &&
            parsed.version === HTML_CSS_CODE_VERSION &&
            typeof parsed.html === 'string' &&
            typeof parsed.css === 'string'
          ) {
            return { html: parsed.html, css: parsed.css };
          }
        } catch (e) {}

        const styleMatch = code.match(/<style\\b[^>]*>([\\s\\S]*?)<\\/style>/i);
        if (!styleMatch) return { html: code, css: '' };

        return {
          html: code.replace(styleMatch[0], '').trim(),
          css: styleMatch[1].trim()
        };
      };

      const sanitizeElement = (element) => {
        Array.from(element.attributes || []).forEach(attr => {
          const name = attr.name.toLowerCase();
          const value = attr.value.trim().toLowerCase();
          if (name.startsWith('on') || name === 'srcdoc' || value.startsWith('javascript:')) {
            element.removeAttribute(attr.name);
          }
        });
      };

      const sanitizeTree = (node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          sanitizeElement(node);
          node.querySelectorAll('*').forEach(sanitizeElement);
        }
      };

      window.__RUN_MODE__ = (code, root) => {
        root.innerHTML = '';
        try {
          const files = parseHtmlCssFiles(code);
          const parsed = new DOMParser().parseFromString(files.html, 'text/html');
          const scriptCount = parsed.querySelectorAll('script').length;
          const fragment = document.createDocumentFragment();

          parsed.querySelectorAll('script').forEach(script => script.remove());

          if (files.css.trim()) {
            const cssStyle = document.createElement('style');
            cssStyle.textContent = files.css;
            fragment.appendChild(cssStyle);
          }

          parsed.querySelectorAll('style').forEach(style => {
            const safeStyle = document.createElement('style');
            safeStyle.textContent = style.textContent || '';
            fragment.appendChild(safeStyle);
            style.remove();
          });

          Array.from(parsed.body.childNodes).forEach(node => {
            const safeNode = document.importNode(node, true);
            sanitizeTree(safeNode);
            fragment.appendChild(safeNode);
          });

          root.appendChild(fragment);

          if (scriptCount > 0) {
            console.warn('Script tags are ignored in html-css mode.');
          }
        } catch (e) { console.error(e); }
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
  p5: {
    name: "p5.js",
    cdns: [P5_CDN],
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
        try { eval(code); instance = new p5(); } catch (e) { console.error(e); }
      };
    `
  },
  "p5-ts": {
    name: "p5.js TS",
    cdns: [P5_CDN, BABEL_CDN],
    babelPresets: ["typescript", "env"],
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
          eval(transpiled); 
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
          const transpiled = Babel.transform(code, { presets: ['env', 'typescript'], filename: 'server.ts' }).code;
          eval(transpiled);
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
                presets: ['env'], 
                filename: 'index.js' 
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

            const transpiled = Babel.transform(code, { presets: ['env', 'typescript'], filename: 'server.ts' }).code;
            
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
var executeCodeInSandbox = (iframeContentWindow, code) => {
  iframeContentWindow.postMessage({ type: "EXECUTE", code }, "*");
};

// components/PreviewContainer.tsx
var import_jsx_runtime2 = require("react/jsx-runtime");
var PreviewContainer = ({
  themeMode,
  isReady,
  children,
  overlayMessage
}) => {
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: `w-full h-full rounded-md overflow-hidden shadow-inner relative border transition-colors duration-300 ${themeMode === "dark" ? "bg-[#1a1a1a] border-gray-700" : "bg-white border-gray-200"}`, children: [
    children,
    !isReady && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "absolute inset-0 flex items-center justify-center pointer-events-none bg-black/5", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { className: "text-gray-400 font-medium", children: overlayMessage || "Click 'Run Code' to execute" }) })
  ] });
};

// components/Console.tsx
var import_lucide_react = require("lucide-react");

// components/Button.tsx
var import_jsx_runtime3 = require("react/jsx-runtime");
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
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
    "button",
    {
      className: `${baseStyles} ${variants[variant]} ${className}`,
      ...props,
      children: [
        icon && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "w-4 h-4", children: icon }),
        children
      ]
    }
  );
};

// components/Console.tsx
var import_jsx_runtime4 = require("react/jsx-runtime");
var Console = ({
  logs,
  onClear,
  themeMode,
  className = ""
}) => {
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: `flex flex-col h-full w-full overflow-hidden ${className} ${themeMode === "dark" ? "bg-[#1e1e1e]" : "bg-gray-50"}`, children: [
    /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: `flex items-center justify-between px-3 py-1 shrink-0 border-b ${themeMode === "dark" ? "border-white/10 bg-[#252526]" : "border-gray-200 bg-gray-100"}`, children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "flex items-center gap-2 text-xs font-semibold opacity-70", children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_lucide_react.Terminal, { className: "w-3 h-3" }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { children: [
          "Console (",
          logs.length,
          ")"
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Button, { variant: "ghost", onClick: onClear, className: "!p-1 h-6 w-6", title: "Clear Console", children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_lucide_react.Ban, { className: "w-3 h-3" }) })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
      "div",
      {
        className: `flex-1 overflow-y-auto p-2 font-mono text-xs space-y-1 ${themeMode === "dark" ? "text-gray-300" : "text-gray-700"}`,
        children: [
          logs.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "h-full flex flex-col items-center justify-center opacity-30 select-none", children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "italic", children: "No output" }) }),
          logs.map((log, i) => /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: `
            border-b border-transparent hover:bg-black/5 dark:hover:bg-white/5 px-1 py-0.5 break-all whitespace-pre
            ${log.type === "error" ? "text-red-500 bg-red-500/5" : ""}
            ${log.type === "warn" ? "text-yellow-500 bg-yellow-500/5" : ""}
          `, children: [
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "opacity-50 mr-2 select-none", children: ">" }),
            log.content
          ] }, i))
        ]
      }
    )
  ] });
};

// components/OutputFrame.tsx
var import_lucide_react2 = require("lucide-react");
var import_jsx_runtime5 = require("react/jsx-runtime");
var OutputFrame = ({
  runTrigger,
  code,
  themeMode,
  environmentMode,
  isBlurred = false,
  isPredictionMode = false,
  debugMode = false
}) => {
  const iframeRef = (0, import_react3.useRef)(null);
  const containerRef = (0, import_react3.useRef)(null);
  const channelRef = (0, import_react3.useRef)(null);
  const [logs, setLogs] = (0, import_react3.useState)([]);
  const [consoleHeight, setConsoleHeight] = (0, import_react3.useState)(150);
  const [isDragging, setIsDragging] = (0, import_react3.useState)(false);
  const isHeadless = environmentMode === "node-js" || environmentMode === "node-ts";
  const showConsole = environmentMode !== "html-css";
  const addSystemLog = (0, import_react3.useCallback)((msg, type = "log") => {
    setLogs((prev) => [...prev, {
      type,
      content: `[System] ${msg}`,
      timestamp: Date.now()
    }]);
  }, []);
  const sandboxHtml = (0, import_react3.useMemo)(() => {
    if (debugMode) addSystemLog(`Generating Sandbox HTML for mode: ${environmentMode}`);
    return getSandboxHtml(environmentMode, isPredictionMode);
  }, [environmentMode, isPredictionMode, debugMode, addSystemLog]);
  (0, import_react3.useEffect)(() => {
    channelRef.current = new MessageChannel();
    channelRef.current.port1.onmessage = (event) => {
      const { type, payload } = event.data;
      if (type === "CONSOLE_LOG" || type === "RUNTIME_ERROR" || type === "CONSOLE_WARN") {
        setLogs((prev) => [...prev, {
          type: type === "RUNTIME_ERROR" ? "error" : type === "CONSOLE_WARN" ? "warn" : "log",
          content: payload,
          timestamp: Date.now()
        }]);
      } else if (type === "READY_SIGNAL" && debugMode) {
        addSystemLog("Sandbox Iframe Ready Signal Received via MessageChannel.");
      }
    };
    return () => {
      if (channelRef.current) {
        channelRef.current.port1.close();
      }
    };
  }, [debugMode, addSystemLog]);
  (0, import_react3.useEffect)(() => {
    if (runTrigger > 0) {
      setLogs([]);
      if (debugMode) addSystemLog("Attempting to execute code...");
      if (iframeRef.current?.contentWindow) {
        executeCodeInSandbox(iframeRef.current.contentWindow, code);
        if (debugMode) addSystemLog("EXECUTE message dispatched.");
      } else if (debugMode) {
        addSystemLog("FAILED: iframe.contentWindow is null.", "error");
      }
    }
  }, [runTrigger, code, debugMode, addSystemLog]);
  (0, import_react3.useEffect)(() => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ type: "THEME", mode: themeMode }, "*");
    }
  }, [themeMode]);
  const handleIframeLoad = () => {
    if (debugMode) addSystemLog('Iframe "onLoad" event fired.');
    if (iframeRef.current?.contentWindow && channelRef.current) {
      iframeRef.current.contentWindow.postMessage({ type: "INIT_PORT" }, "*", [channelRef.current.port2]);
      iframeRef.current.contentWindow.postMessage({ type: "THEME", mode: themeMode }, "*");
      if (debugMode) addSystemLog("Channel Ports initialized.");
    }
  };
  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleMouseMove = (0, import_react3.useCallback)((e) => {
    if (!isDragging || !containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const relativeY = e.clientY - containerRect.top;
    const newHeight = containerRect.height - relativeY;
    setConsoleHeight(Math.max(30, Math.min(containerRect.height * 0.8, newHeight)));
  }, [isDragging]);
  const handleMouseUp = (0, import_react3.useCallback)(() => setIsDragging(false), []);
  (0, import_react3.useEffect)(() => {
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
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
    PreviewContainer,
    {
      themeMode,
      isReady: runTrigger > 0,
      overlayMessage: isBlurred ? "Make your Prediction" : void 0,
      children: /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { ref: containerRef, className: "w-full h-full flex flex-col relative", children: [
        !isHeadless && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "flex-1 min-h-0 relative", children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
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
        !isHeadless && showConsole && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
          "div",
          {
            onMouseDown: handleMouseDown,
            className: `h-3 shrink-0 flex items-center justify-center cursor-row-resize z-10 hover:bg-blue-500 hover:text-white transition-colors ${themeMode === "dark" ? "bg-[#252526] text-gray-600 border-t border-b border-black/20" : "bg-gray-100 text-gray-400 border-t border-b border-gray-200"}`,
            children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(import_lucide_react2.GripHorizontal, { className: "w-3 h-3" })
          }
        ),
        showConsole && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { style: { height: isHeadless ? "100%" : consoleHeight }, className: "shrink-0 min-h-0", children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Console, { logs, onClear: () => setLogs([]), themeMode }) }),
        isHeadless && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
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
var import_react4 = require("react");
var import_lucide_react3 = require("lucide-react");
var import_jsx_runtime6 = require("react/jsx-runtime");
var ServerOutput = ({
  runTrigger,
  code,
  themeMode,
  environmentMode,
  isBlurred = false,
  debugMode = false,
  onTriggerRun
}) => {
  const iframeRef = (0, import_react4.useRef)(null);
  const containerRef = (0, import_react4.useRef)(null);
  const channelRef = (0, import_react4.useRef)(null);
  const [logs, setLogs] = (0, import_react4.useState)([]);
  const [route, setRoute] = (0, import_react4.useState)("/");
  const [method, setMethod] = (0, import_react4.useState)("GET");
  const [response, setResponse] = (0, import_react4.useState)(null);
  const [pendingRequest, setPendingRequest] = (0, import_react4.useState)(null);
  const [isLoading, setIsLoading] = (0, import_react4.useState)(false);
  const [serverReady, setServerReady] = (0, import_react4.useState)(false);
  const [runtimeError, setRuntimeError] = (0, import_react4.useState)(null);
  const [consoleHeight, setConsoleHeight] = (0, import_react4.useState)(150);
  const [isDragging, setIsDragging] = (0, import_react4.useState)(false);
  const addSystemLog = (0, import_react4.useCallback)((msg) => {
    setLogs((prev) => [...prev, { type: "log", content: `[System] ${msg}`, timestamp: Date.now() }]);
  }, []);
  const clearConsole = (0, import_react4.useCallback)(() => setLogs([]), []);
  const sendSimulatedRequest = (0, import_react4.useCallback)((reqMethod, reqUrl) => {
    if (!channelRef.current) return;
    const requestPayload = {
      type: "SIMULATE_REQUEST",
      payload: { method: reqMethod, url: reqUrl }
    };
    if (debugMode) addSystemLog(`Sending Request: ${reqMethod} ${reqUrl}`);
    channelRef.current.port1.postMessage(requestPayload);
  }, [debugMode, addSystemLog]);
  const handleSandboxMessage = (0, import_react4.useCallback)((data) => {
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
        setLogs((prev) => [...prev, { type: "error", content: payload, timestamp: Date.now() }]);
        setServerReady(false);
        break;
      case "CONSOLE_LOG":
      case "CONSOLE_WARN":
        setLogs((prev) => [...prev, {
          type: type === "CONSOLE_WARN" ? "warn" : "log",
          content: payload,
          timestamp: Date.now()
        }]);
        break;
      case "CONSOLE_CLEAR":
        clearConsole();
        break;
      case "READY_SIGNAL":
        if (debugMode) addSystemLog("Sandbox established MessageChannel port.");
        break;
    }
  }, [debugMode, addSystemLog, clearConsole, sendSimulatedRequest]);
  (0, import_react4.useEffect)(() => {
    const channel = new MessageChannel();
    channelRef.current = channel;
    channel.port1.onmessage = (event) => {
      handleSandboxMessage(event.data);
    };
    return () => {
      channel.port1.close();
      channelRef.current = null;
    };
  }, [handleSandboxMessage]);
  (0, import_react4.useEffect)(() => {
    const globalListener = (event) => {
      if (event.data && typeof event.data === "object" && event.data.type) {
        handleSandboxMessage(event.data);
      }
    };
    window.addEventListener("message", globalListener);
    return () => window.removeEventListener("message", globalListener);
  }, [handleSandboxMessage]);
  const sandboxHtml = (0, import_react4.useMemo)(() => {
    return getSandboxHtml(environmentMode);
  }, [environmentMode]);
  (0, import_react4.useEffect)(() => {
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
  (0, import_react4.useEffect)(() => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ type: "THEME", mode: themeMode }, "*");
    }
  }, [themeMode]);
  const handleIframeLoad = () => {
    if (debugMode) addSystemLog("Server Iframe loaded.");
    if (iframeRef.current?.contentWindow && channelRef.current) {
      iframeRef.current.contentWindow.postMessage({ type: "INIT_PORT" }, "*", [channelRef.current.port2]);
      iframeRef.current.contentWindow.postMessage({ type: "THEME", mode: themeMode }, "*");
    }
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
  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleMouseMove = (0, import_react4.useCallback)((e) => {
    if (!isDragging || !containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const relativeY = e.clientY - containerRect.top;
    const newHeight = containerRect.height - relativeY;
    setConsoleHeight(Math.max(30, Math.min(containerRect.height * 0.8, newHeight)));
  }, [isDragging]);
  const handleMouseUp = (0, import_react4.useCallback)(() => setIsDragging(false), []);
  (0, import_react4.useEffect)(() => {
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
  return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "flex flex-col h-full w-full gap-2", children: [
    /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: `flex items-center gap-2 p-2 rounded-md border transition-colors ${themeMode === "dark" ? "bg-[#252526] border-white/10" : "bg-white border-gray-200"}`, children: [
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { className: `px-3 py-1.5 rounded text-xs font-bold tracking-wider ${themeMode === "dark" ? "bg-blue-900/50 text-blue-400" : "bg-blue-100 text-blue-700"}`, children: method }),
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
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
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
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
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(PreviewContainer, { themeMode, isReady, overlayMessage: isBlurred ? "Make your Prediction" : void 0, children: /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { ref: containerRef, className: "flex flex-col h-full relative", children: [
      isLoading && /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "absolute top-2 right-2 z-10 flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-xs shadow-lg backdrop-blur-md", children: [
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(import_lucide_react3.Clock, { className: "w-3 h-3 animate-pulse" }),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { children: pendingRequest ? "Starting Server..." : "Processing..." })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { className: `flex-1 overflow-auto p-4 font-mono text-sm ${themeMode === "dark" ? "bg-[#1e1e1e]" : "bg-gray-50"}`, children: runtimeError ? /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "p-4 border border-red-500/20 rounded bg-red-500/5 text-red-400", children: [
        /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "flex items-center gap-2 text-red-500 font-bold mb-2", children: [
          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(import_lucide_react3.AlertCircle, { className: "w-4 h-4" }),
          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { children: "Runtime Error" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("pre", { className: "whitespace-pre-wrap break-all", children: runtimeError })
      ] }) : response ? /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "animate-in fade-in slide-in-from-top-2 duration-300", children: [
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { className: "flex items-center justify-between mb-4 pb-2 border-b border-dashed border-gray-500/20", children: /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("span", { className: `font-bold ${response.status < 300 ? "text-green-500" : "text-red-500"}`, children: [
          response.status,
          " ",
          response.status === 200 ? "OK" : ""
        ] }) }),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("pre", { className: `${themeMode === "dark" ? "text-blue-300" : "text-blue-700"}`, children: JSON.stringify(response.data, null, 2) })
      ] }) : /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "h-full flex flex-col items-center justify-center opacity-20", children: [
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(import_lucide_react3.Server, { className: "w-12 h-12 mb-2" }),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("p", { children: "Server Standby" })
      ] }) }),
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { onMouseDown: handleMouseDown, className: `h-3 shrink-0 flex items-center justify-center cursor-row-resize ${themeMode === "dark" ? "bg-[#252526] text-gray-600 border-t border-b border-black/20" : "bg-gray-100 text-gray-400 border-t border-b border-gray-200"}`, children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(import_lucide_react3.GripHorizontal, { className: "w-3 h-3" }) }),
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { style: { height: consoleHeight }, className: "shrink-0 min-h-0", children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(Console, { logs, onClear: clearConsole, themeMode }) }),
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
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

// docs.ts
var P5_DOCS = [
  {
    title: "Structure",
    items: [
      { name: "setup()", desc: "Called once when the program starts. Use it to define initial environment properties." },
      { name: "draw()", desc: "Called directly after setup(), the draw() function continuously executes the lines of code contained inside its block." }
    ]
  },
  {
    title: "Canvas & Color",
    items: [
      { name: "createCanvas(w, h)", desc: "Creates the canvas element in the document.", example: "createCanvas(400, 400);" },
      { name: "background(color)", desc: "Sets the color used for the background of the canvas.", example: "background(220);" },
      { name: "fill(color)", desc: "Sets the color used to fill shapes.", example: "fill(255, 0, 0);" },
      { name: "noFill()", desc: "Disables filling geometry." },
      { name: "stroke(color)", desc: "Sets the color used to draw lines and borders around shapes." },
      { name: "noStroke()", desc: "Disables drawing the stroke (outline)." }
    ]
  },
  {
    title: "Shapes",
    items: [
      { name: "rect(x, y, w, h)", desc: "Draws a rectangle to the screen.", example: "rect(30, 20, 55, 55);" },
      { name: "ellipse(x, y, w, h)", desc: "Draws an ellipse (oval) to the screen.", example: "ellipse(56, 46, 55, 55);" },
      { name: "circle(x, y, d)", desc: "Draws a circle to the screen." },
      { name: "line(x1, y1, x2, y2)", desc: "Draws a line (a direct path between two points) to the screen." },
      { name: "point(x, y)", desc: "Draws a point, a single coordinate in space." },
      { name: "triangle(x1, y1, x2, y2, x3, y3)", desc: "A triangle is a plane created by connecting three points." }
    ]
  },
  {
    title: "Input",
    items: [
      { name: "mouseX", desc: "System variable containing the current horizontal position of the mouse." },
      { name: "mouseY", desc: "System variable containing the current vertical position of the mouse." },
      { name: "mouseIsPressed", desc: "Boolean variable that is true if the mouse is being pressed." },
      { name: "keyIsPressed", desc: "Boolean variable that is true if any key is pressed." }
    ]
  }
];
var getDocsForMode = (mode) => {
  if (mode === "p5") return P5_DOCS;
  return null;
};

// components/CodingEnvironment.tsx
var import_jsx_runtime7 = require("react/jsx-runtime");
var CodingEnvironment = ({
  code,
  onChange,
  onRun,
  isRunning,
  runTrigger,
  themeMode,
  environmentMode,
  sessionId,
  predictionPrompt,
  debugMode = false
}) => {
  const [isHelpOpen, setIsHelpOpen] = (0, import_react5.useState)(false);
  const [predictionAnswer, setPredictionAnswer] = (0, import_react5.useState)("");
  const [isPredictionLocked, setIsPredictionLocked] = (0, import_react5.useState)(false);
  const [layout, setLayout] = (0, import_react5.useState)("horizontal");
  const [editorRatio, setEditorRatio] = (0, import_react5.useState)(0.5);
  const [isDragging, setIsDragging] = (0, import_react5.useState)(false);
  const containerRef = (0, import_react5.useRef)(null);
  const hasDocs = !!getDocsForMode(environmentMode);
  const isPredictionFulfilled = !predictionPrompt || predictionAnswer.trim().length > 0;
  const editorLabel = environmentMode === "html-css" ? "HTML + CSS" : `${environmentMode}.script`;
  const handleRunClick = () => {
    if (predictionPrompt) setIsPredictionLocked(true);
    onRun();
  };
  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleMouseMove = (0, import_react5.useCallback)((e) => {
    if (!isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const newRatio = layout === "horizontal" ? (e.clientX - rect.left) / rect.width : (e.clientY - rect.top) / rect.height;
    setEditorRatio(Math.max(0.2, Math.min(0.8, newRatio)));
  }, [isDragging, layout]);
  (0, import_react5.useEffect)(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", () => setIsDragging(false));
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", () => setIsDragging(false));
    };
  }, [isDragging, handleMouseMove]);
  const isServerMode = environmentMode.startsWith("express") || environmentMode.startsWith("hono");
  return /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: `flex-1 flex flex-col overflow-hidden ${themeMode === "dark" ? "bg-[#1e1e1e]" : "bg-white"}`, children: [
    predictionPrompt && /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: `p-4 border-b flex gap-4 ${themeMode === "dark" ? "bg-[#252526] border-white/10" : "bg-blue-50 border-blue-100"}`, children: /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "flex-1", children: [
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("h3", { className: "text-xs font-bold uppercase tracking-wider text-purple-500 mb-2", children: "Knowledge Check" }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "text-sm opacity-80 mb-3", children: predictionPrompt }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
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
    /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: `h-12 px-4 border-b flex items-center justify-between ${themeMode === "dark" ? "bg-[#1e1e1e] border-white/10 text-gray-400" : "bg-white border-gray-100"}`, children: [
      /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_lucide_react4.FileCode, { className: "w-4 h-4 text-blue-500" }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { className: "text-xs font-mono font-medium hidden sm:inline", children: editorLabel })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "flex bg-black/5 dark:bg-white/5 p-0.5 rounded-lg border border-black/5 dark:border-white/5", children: [
          /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(
            "button",
            {
              onClick: () => setLayout("horizontal"),
              title: "Split View (Side by Side)",
              className: `flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-tight transition-all ${layout === "horizontal" ? "bg-white dark:bg-gray-700 shadow-sm text-blue-500" : "opacity-40 hover:opacity-60"}`,
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_lucide_react4.Columns, { size: 12 }),
                /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { className: "hidden md:inline", children: "Split" })
              ]
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(
            "button",
            {
              onClick: () => setLayout("vertical"),
              title: "Vertical View (Stacked)",
              className: `flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-tight transition-all ${layout === "vertical" ? "bg-white dark:bg-gray-700 shadow-sm text-blue-500" : "opacity-40 hover:opacity-60"}`,
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_lucide_react4.Rows, { size: 12 }),
                /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { className: "hidden md:inline", children: "Stacked" })
              ]
            }
          )
        ] }),
        !isServerMode && /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
          Button,
          {
            onClick: handleRunClick,
            disabled: isRunning || !isPredictionFulfilled,
            variant: "primary",
            className: "h-8 !px-5 text-xs font-bold shadow-lg shadow-blue-500/20",
            icon: isRunning ? /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_lucide_react4.CheckCircle2, { className: "animate-pulse", size: 14 }) : /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_lucide_react4.Play, { size: 14 }),
            children: isRunning ? "RUNNING..." : "RUN CODE"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { ref: containerRef, className: `flex-1 flex overflow-hidden ${layout === "horizontal" ? "flex-row" : "flex-col"}`, children: [
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { style: { [layout === "horizontal" ? "width" : "height"]: `${editorRatio * 100}%` }, className: "relative flex flex-col min-w-0 min-h-0", children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
        CodeEditor,
        {
          code,
          onChange: (val) => onChange(val || ""),
          themeMode,
          environmentMode,
          sessionId,
          readOnly: !!predictionPrompt && isPredictionLocked
        }
      ) }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
        "div",
        {
          onMouseDown: handleMouseDown,
          className: `flex items-center justify-center shrink-0 hover:bg-blue-500/50 transition-colors z-10 ${layout === "horizontal" ? "w-1.5 cursor-col-resize" : "h-1.5 cursor-row-resize"} ${themeMode === "dark" ? "bg-black/40" : "bg-gray-100"}`,
          children: layout === "horizontal" ? /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_lucide_react4.GripVertical, { size: 10, className: "opacity-20" }) : /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_lucide_react4.GripHorizontal, { size: 10, className: "opacity-20" })
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { style: { [layout === "horizontal" ? "width" : "height"]: `${(1 - editorRatio) * 100}%` }, className: `relative flex flex-col min-w-0 min-h-0 ${isDragging ? "pointer-events-none" : ""}`, children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "flex-1 p-2 md:p-3 overflow-hidden", children: isServerMode ? /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
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
      ) : /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(OutputFrame, { runTrigger, code, themeMode, environmentMode, isBlurred: !isPredictionFulfilled, isPredictionMode: !!predictionPrompt, debugMode }) }) })
    ] })
  ] });
};

// components/CodeShoebox.tsx
var import_jsx_runtime8 = require("react/jsx-runtime");
var CodeShoebox = ({
  code,
  onCodeChange,
  environmentMode,
  theme,
  themeMode,
  sessionId = 0,
  prediction_prompt,
  debugMode = false
}) => {
  const [runTrigger, setRunTrigger] = (0, import_react6.useState)(0);
  const [isRunning, setIsRunning] = (0, import_react6.useState)(false);
  (0, import_react6.useEffect)(() => {
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
  const themeStyles = (0, import_react6.useMemo)(() => {
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
  return /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
    "div",
    {
      className: "flex flex-col h-full w-full transition-colors duration-300 bg-[hsl(var(--background))] text-[hsl(var(--foreground))]",
      style: themeStyles,
      children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
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
          predictionPrompt: prediction_prompt,
          debugMode
        },
        sessionId
      )
    }
  );
};

// hooks/useSandboxState.ts
var import_react7 = require("react");

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
var HTML_CSS_STARTER_CODE = serializeHtmlCssFiles({
  html: `<main class="gallery-card">
  <figure>
    <img src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80" alt="A laptop on a desk">
    <figcaption>Workspace photo</figcaption>
  </figure>
</main>`,
  css: `body {
  background: #f6f7fb;
}

.gallery-card {
  max-width: 560px;
  margin: 0 auto;
}

figure {
  margin: 0;
  border: 1px solid #d8dee9;
  border-radius: 8px;
  overflow: hidden;
  background: white;
  box-shadow: 0 12px 28px rgba(31, 41, 55, 0.16);
}

img {
  width: 100%;
  height: 180px;
  object-fit: cover;
  display: block;
}

figcaption {
  padding: 12px 16px;
  font: 600 15px system-ui, sans-serif;
  color: #253044;
}`
});
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
var getStarterCode = (mode) => {
  switch (mode) {
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
  const getStorageKey = (0, import_react7.useCallback)((key) => `${STORAGE_PREFIX}_${key}`, [STORAGE_PREFIX]);
  const loadState = (keySuffix, fallback) => {
    if (!persistenceKey || typeof window === "undefined") return fallback;
    try {
      const saved = localStorage.getItem(getStorageKey(keySuffix));
      return saved || fallback;
    } catch {
      return fallback;
    }
  };
  const loadCode = (0, import_react7.useCallback)((mode) => {
    const fallback = initialCodeOverride ?? getStarterCode(mode);
    if (!persistenceKey || typeof window === "undefined") return fallback;
    try {
      const saved = localStorage.getItem(getStorageKey(`code_${mode}`));
      return saved || fallback;
    } catch {
      return fallback;
    }
  }, [persistenceKey, getStorageKey, initialCodeOverride]);
  const [environmentMode, setEnvironmentMode] = (0, import_react7.useState)(() => loadState("env_mode", defaultMode));
  const [themeMode, setThemeMode] = (0, import_react7.useState)(() => loadState("theme_mode", "dark"));
  const [activeThemeName, setActiveThemeName] = (0, import_react7.useState)(() => loadState("theme_name", themes[0].name));
  const [code, setCode] = (0, import_react7.useState)(() => loadCode(environmentMode));
  const [sessionId, setSessionId] = (0, import_react7.useState)(() => Math.floor(Math.random() * 1e6));
  (0, import_react7.useEffect)(() => {
    if (!persistenceKey) return;
    localStorage.setItem(getStorageKey("env_mode"), environmentMode);
    localStorage.setItem(getStorageKey("theme_mode"), themeMode);
    localStorage.setItem(getStorageKey("theme_name"), activeThemeName);
    localStorage.setItem(getStorageKey(`code_${environmentMode}`), code);
  }, [environmentMode, themeMode, activeThemeName, code, persistenceKey, getStorageKey]);
  const switchMode = (0, import_react7.useCallback)((newMode) => {
    if (newMode === environmentMode) return;
    setEnvironmentMode(newMode);
    setCode(loadCode(newMode));
    setSessionId((prev) => prev + 1);
  }, [environmentMode, loadCode]);
  const resetCode = (0, import_react7.useCallback)(() => {
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
var import_react8 = require("react");
var useAutoKey = (identifier, initialCode = "", prefix = "auto") => {
  const key = (0, import_react8.useMemo)(() => {
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  CodeShoebox,
  baseTheme,
  borisTheme,
  modernLabTheme,
  parseHtmlCssFiles,
  serializeHtmlCssFiles,
  themes,
  useAutoKey,
  useSandboxState
});
