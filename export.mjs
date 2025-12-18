// components/CodeShoebox.tsx
import { useState as useState4, useMemo as useMemo2, useEffect as useEffect4 } from "react";

// components/CodingEnvironment.tsx
import { useState as useState3, useEffect as useEffect3, useRef as useRef3, useCallback as useCallback3 } from "react";
import {
  Play,
  CheckCircle2,
  FileCode,
  Book,
  Brain,
  Lock,
  Columns,
  Rows,
  GripVertical,
  GripHorizontal as GripHorizontal3,
  Maximize2,
  Minimize2
} from "lucide-react";

// components/CodeEditor.tsx
import { useMemo } from "react";
import Editor from "@monaco-editor/react";
import { jsx } from "react/jsx-runtime";
var CodeEditor = ({
  code,
  onChange,
  themeMode,
  environmentMode,
  sessionId,
  readOnly = false
}) => {
  const modelPath = useMemo(() => {
    const basePath = `sandbox-${environmentMode}-${sessionId}`;
    switch (environmentMode) {
      case "typescript":
      case "express-ts":
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
  }, [sessionId, environmentMode]);
  const language = useMemo(() => {
    const tsModes = ["typescript", "react-ts", "express-ts", "node-ts"];
    if (tsModes.includes(environmentMode)) return "typescript";
    return "javascript";
  }, [environmentMode]);
  const handleEditorDidMount = (editor, monaco) => {
    editor.focus();
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
        fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
        fixedOverflowWidgets: true,
        renderValidationDecorations: "on",
        // Improve styling consistency
        lineHeight: 24
      }
    },
    modelPath
  ) });
};

// components/OutputFrame.tsx
import { useEffect, useRef, useState, useCallback } from "react";

// runtime/templates/common.ts
var BASE_STYLES = `
    html, body {
        height: 100%;
        margin: 0;
        padding: 0;
        overflow: hidden; /* Prevent body scroll, handle in #root */
    }

    body { 
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        color: #333;
        background: #fff;
        transition: background-color 0.3s, color 0.3s;
        
        /* Flex layout */
        display: flex;
        flex-direction: column;
    }
    
    /* Dark mode class toggled by JS */
    body.dark { background: #1a1a1a; color: #ddd; }
    
    #root {
        flex: 1; /* Take all remaining space */
        overflow: auto; /* Internal scrolling */
        padding: 1rem;
        position: relative;
        width: 100%;
        box-sizing: border-box;
        
        /* Center content (like p5 canvas) but allow block flow for DOM mode */
        display: flex;
        flex-direction: column;
        align-items: center;
    }
    
    /* Ensure immediate children of root (like divs created by user) behave normally */
    #root > * {
        max-width: 100%;
        flex-shrink: 0; /* Prevent squishing */
    }

    /* p5 canvas styling */
    canvas {
        display: block;
        margin-bottom: 1rem;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        border-radius: 4px;
    }
`;
var CONSOLE_INTERCEPTOR = `
    // --- Console Capture System ---
    
    let messagePort = null;

    function formatMessage(msg) {
        if (msg instanceof Error) {
            return msg.toString();
        }
        if (typeof msg === 'object' && msg !== null) {
            try {
                return JSON.stringify(msg, null, 2);
            } catch (e) {
                return '[Circular Object]';
            }
        }
        return String(msg);
    }

    function logToScreen(msg, type = 'log') {
        const textContent = formatMessage(msg);

        // Notify parent via established port (preferred for isolation) or global postMessage
        const payload = { 
            type: type === 'error' ? 'RUNTIME_ERROR' : (type === 'warn' ? 'CONSOLE_WARN' : 'CONSOLE_LOG'),
            payload: textContent
        };

        if (messagePort) {
            messagePort.postMessage(payload);
        } else {
            window.parent.postMessage(payload, '*');
        }
    }

    const originalLog = console.log;
    console.log = function(...args) {
        originalLog.apply(console, args);
        args.forEach(arg => logToScreen(arg, 'log'));
    };

    const originalError = console.error;
    console.error = function(...args) {
        originalError.apply(console, args);
        args.forEach(arg => logToScreen(arg, 'error'));
    };
    
    const originalWarn = console.warn;
    console.warn = function(...args) {
        originalWarn.apply(console, args);
        args.forEach(arg => logToScreen(arg, 'warn'));
    };

    // Support console.table specifically for array/object data visualization
    const originalTable = console.table;
    console.table = function(data) {
        originalTable.apply(console, [data]);
        logToScreen(data, 'log'); // We just log the JSON for now
    };

    window.onerror = function(message, source, lineno, colno, error) {
        logToScreen(\`Error: \${message} (Line \${lineno})\`, 'error');
        return true;
    };

    window.addEventListener('unhandledrejection', function(event) {
        logToScreen(\`Async Error: \${event.reason}\`, 'error');
    });

    // Listen for port initialization
    window.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'INIT_PORT' && event.ports[0]) {
            messagePort = event.ports[0];
            // If the server simulator sent this, it might expect a ready signal on the port
            if (window.serverReadySignal) {
                messagePort.postMessage({ type: 'SERVER_READY' });
            }
        }
    });
`;
var BASE_HTML_WRAPPER = (headContent, scriptContent, showPlaceholder = true) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sandbox</title>
    <style>${BASE_STYLES}</style>
    ${headContent}
</head>
<body>
    <div id="root">
        <!-- User output goes here -->
        ${showPlaceholder ? '<p id="placeholder" style="color: #666; font-style: italic; align-self: flex-start;">Output will appear here...</p>' : ""}
    </div>

    <script>
        ${CONSOLE_INTERCEPTOR}

        window.addEventListener('message', (event) => {
            const { type, code, mode } = event.data;

            if (type === 'EXECUTE') {
                const root = document.getElementById('root');
                const placeholder = document.getElementById('placeholder');
                if (placeholder) placeholder.style.display = 'none';
                
                // Clear root
                // Note: We don't clear the parent console here, that's handled by the React component
                
                // Invoke specific runner logic
                if (window.runMode) {
                    window.runMode(code, root);
                }
            }
            
            if (type === 'THEME') {
                if (mode === 'dark') {
                    document.body.classList.add('dark');
                } else {
                    document.body.classList.remove('dark');
                }
            }
        });
        
        ${scriptContent}
    </script>
</body>
</html>
`;

// runtime/templates/dom.ts
var DOM_EXECUTION_LOGIC = `
    window.runMode = function(code, root) {
        // Standard DOM Mode
        root.innerHTML = ''; 
        try {
            const userFunction = new Function('root', code);
            userFunction(root);
        } catch (err) {
            console.error(err);
        }
    };
`;
var generateDomHtml = (showPlaceholder = true) => {
  return BASE_HTML_WRAPPER("", DOM_EXECUTION_LOGIC, showPlaceholder);
};

// runtime/templates/p5.ts
var P5_CDN = '<script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.min.js"></script>';
var P5_EXECUTION_LOGIC = `
    let currentP5Instance = null;
    let canvasObserver = null;

    window.runMode = function(code, root) {
        // p5.js Mode
        
        // 1. Clean up previous instance and observers
        if (currentP5Instance) {
            currentP5Instance.remove();
            currentP5Instance = null;
        }
        if (canvasObserver) {
            canvasObserver.disconnect();
            canvasObserver = null;
        }

        // Clean root content (e.g. from previous runs)
        root.innerHTML = '';
        
        // 2. Clean global scope so we don't have stale functions
        window.setup = null;
        window.draw = null;

        try {
            // Setup Observer to move the canvas into #root when it appears.
            // p5 appends to body by default in global mode.
            canvasObserver = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    mutation.addedNodes.forEach((node) => {
                        // Check for p5 canvas
                        if (node.tagName === 'CANVAS' && node.classList.contains('p5Canvas')) {
                            // Move it to root
                            root.appendChild(node);
                        }
                    });
                });
            });
            
            canvasObserver.observe(document.body, { childList: true });

            // 3. Execute user code in global scope
            window.eval(code);

            // 4. Instantiate p5
            currentP5Instance = new p5();

            // 5. Immediate check in case setup() was synchronous and observer missed it
            const existingCanvas = document.querySelector('body > canvas.p5Canvas');
            if (existingCanvas) {
                root.appendChild(existingCanvas);
            }
            
        } catch (err) {
            console.error(err);
        }
    };
`;
var generateP5Html = (showPlaceholder = true) => {
  return BASE_HTML_WRAPPER(P5_CDN, P5_EXECUTION_LOGIC, showPlaceholder);
};

// runtime/templates/react.ts
var REACT_CDNS = `
<script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
<script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
`;
var REACT_EXECUTION_LOGIC = `
    // 1. Shim 'require' to support standard imports transpiled by Babel
    window.require = function(module) {
        if (module === 'react') return window.React;
        if (module === 'react-dom') return window.ReactDOM;
        if (module === 'react-dom/client') return window.ReactDOM;
        throw new Error('Module not found: ' + module);
    };

    // 2. Patch createRoot to track the root instance for cleanup
    //    (React 18 warns if you createRoot on an existing root container)
    const originalCreateRoot = window.ReactDOM.createRoot;
    window.ReactDOM.createRoot = function(container, options) {
        const root = originalCreateRoot.call(window.ReactDOM, container, options);
        if (container.id === 'root') {
            window.__APP_ROOT__ = root;
        }
        return root;
    };

    window.runMode = function(code, rootElement) {
        // React Mode
        
        // 1. Cleanup previous React Root
        if (window.__APP_ROOT__) {
            try {
                window.__APP_ROOT__.unmount();
            } catch(e) { console.warn('Failed to unmount previous root', e); }
            window.__APP_ROOT__ = null;
        }

        // 2. Clear DOM (safely)
        rootElement.innerHTML = '';
        
        try {
            // 3. Transpile code
            //    We use 'env' to transpile imports to 'require' calls (CommonJS),
            //    which our shim handles.
            const compiled = Babel.transform(code, {
                presets: ['react', 'env'],
                filename: 'user_code.js'
            }).code;

            // 4. Execute
            //    We wrap in a function to isolate scope slightly, though imports 
            //    usually end up as var declarations at top level.
            (function() {
                eval(compiled);
            })();
            
        } catch (err) {
            console.error(err);
        }
    };
`;
var generateReactHtml = (showPlaceholder = true) => {
  return BASE_HTML_WRAPPER(REACT_CDNS, REACT_EXECUTION_LOGIC, showPlaceholder);
};

// runtime/templates/typescript.ts
var BABEL_CDN = '<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>';
var TS_EXECUTION_LOGIC = `
    window.runMode = function(code, root) {
        // TypeScript Mode
        root.innerHTML = ''; 
        
        try {
            // Transpile TypeScript to JavaScript
            const transpiled = Babel.transform(code, {
                presets: ['env', 'typescript'],
                filename: 'script.ts'
            }).code;

            // Execute the transpiled code
            // Wrap in a function that receives 'root' to match DOM mode behavior
            const userFunction = new Function('root', transpiled);
            userFunction(root);
        } catch (err) {
            console.error(err);
        }
    };
`;
var generateTsHtml = (showPlaceholder = true) => {
  return BASE_HTML_WRAPPER(BABEL_CDN, TS_EXECUTION_LOGIC, showPlaceholder);
};

// runtime/templates/react-ts.ts
var REACT_TS_CDNS = `
<script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
<script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
`;
var REACT_TS_EXECUTION_LOGIC = `
    // 1. Shim 'require'
    window.require = function(module) {
        if (module === 'react') return window.React;
        if (module === 'react-dom') return window.ReactDOM;
        if (module === 'react-dom/client') return window.ReactDOM;
        throw new Error('Module not found: ' + module);
    };

    // 2. Patch createRoot for cleanup
    const originalCreateRoot = window.ReactDOM.createRoot;
    window.ReactDOM.createRoot = function(container, options) {
        const root = originalCreateRoot.call(window.ReactDOM, container, options);
        if (container.id === 'root') {
            window.__APP_ROOT__ = root;
        }
        return root;
    };

    window.runMode = function(code, rootElement) {
        // React + TypeScript Mode
        
        if (window.__APP_ROOT__) {
            try { window.__APP_ROOT__.unmount(); } catch(e) {}
            window.__APP_ROOT__ = null;
        }

        rootElement.innerHTML = '';
        
        try {
            // Transpile with 'typescript' preset
            const compiled = Babel.transform(code, {
                presets: ['react', 'env', 'typescript'],
                filename: 'App.tsx'
            }).code;

            (function() {
                eval(compiled);
            })();
            
        } catch (err) {
            console.error(err);
        }
    };
`;
var generateReactTsHtml = (showPlaceholder = true) => {
  return BASE_HTML_WRAPPER(REACT_TS_CDNS, REACT_TS_EXECUTION_LOGIC, showPlaceholder);
};

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
            
            // Signal ready via port if available, else global
            const readyMsg = { type: 'SERVER_READY' };
            if (window.messagePort) {
                window.messagePort.postMessage(readyMsg);
            } else {
                window.parent.postMessage(readyMsg, '*');
                // Flag for async port initialization
                window.serverReadySignal = true;
            }
        }

        async _handleRequest(method, url) {
            console.log(\`Incoming Request: \${method} \${url}\`);
            
            const methodRoutes = this.routes[method] || {};
            
            for (const routeRegex in methodRoutes) {
                const match = new RegExp(\`^\${routeRegex}$\`).exec(url);
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

                    const req = { method, url, params, query: {} };

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

            return { status: 404, data: { error: \`Cannot \${method} \${url}\` } };
        }
    }

    const appInstance = new MockApp();
    window.express = function() { return appInstance; };
    window.appInstance = appInstance;

    // Listen on the private port primarily
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

    window.addEventListener('message', requestHandler);
    
    // Also listen on the port once initialized
    const checkPortInterval = setInterval(() => {
        if (window.messagePort) {
            window.messagePort.addEventListener('message', requestHandler);
            window.messagePort.start();
            clearInterval(checkPortInterval);
        }
    }, 50);
`;
var EXPRESS_JS_RUNNER = `
    window.runMode = function(code, root) {
        root.innerHTML = '';
        if (window.appInstance) {
            window.appInstance.routes = { GET: {} };
        }
        try {
            window.eval(code);
        } catch (err) {
            console.error(err);
        }
    };
`;
var generateExpressHtml = (showPlaceholder = true) => {
  const script = EXPRESS_MOCK_SETUP + EXPRESS_JS_RUNNER;
  return BASE_HTML_WRAPPER("", script, false);
};

// runtime/templates/express-ts.ts
var BABEL_CDN2 = '<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>';
var EXPRESS_TS_RUNNER = `
    // 1. Shim 'require' to support standard imports transpiled by Babel
    window.require = function(module) {
        if (module === 'express') {
            // In TS/ESM: import express from 'express'; express() -> app
            // Babel 'env' preset might treat default export as module.default depending on config,
            // or just module() if it's commonjs interop.
            // Our window.express is the function.
            // Let's ensure common default import patterns work.
            const exp = window.express;
            exp.default = exp;
            return exp;
        }
        throw new Error('Module not found: ' + module);
    };

    window.runMode = function(code, root) {
        // Express TS Mode
        root.innerHTML = '';
        
        // Reset routes on re-run
        if (window.appInstance) {
             window.appInstance.routes = { GET: {} };
        }

        try {
             // Transpile with 'typescript' and 'env' presets
             // 'env' will convert import/export to require/module.exports (CommonJS)
             const transpiled = Babel.transform(code, {
                presets: ['env', 'typescript'],
                filename: 'server.ts'
            }).code;

            // Execute in an IIFE
            (function() {
                eval(transpiled);
            })();
        } catch (err) {
            console.error(err);
        }
    };
`;
var generateExpressTsHtml = (showPlaceholder = false) => {
  const script = EXPRESS_MOCK_SETUP + EXPRESS_TS_RUNNER;
  return BASE_HTML_WRAPPER(BABEL_CDN2, script, false);
};

// runtime/templates/headless.ts
var BABEL_CDN3 = '<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>';
var HEADLESS_RUNNER = (isTypescript) => `
    window.runMode = function(code, root) {
        // Clear previous state if any
        root.innerHTML = '<div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; opacity:0.3; text-align:center; font-family:sans-serif; padding:2rem;">' +
                         '<div style="font-size:3rem; margin-bottom:1rem;">\u{1F4BB}</div>' +
                         '<div>Console Environment Active</div>' +
                         '<div style="font-size:0.8rem; margin-top:0.5rem;">The output is displayed in the console below.</div>' +
                         '</div>';

        try {
            let executableCode = code;

            if (${isTypescript}) {
                // Transpile TS
                executableCode = Babel.transform(code, {
                    presets: ['env', 'typescript'],
                    filename: 'index.ts'
                }).code;
            }

            /**
             * We wrap in a function to shadow globals like 'document' and 'window'
             * with null to reinforce that this is a console-only environment.
             */
            const headlessWrapper = new Function('document', 'window', 'root', executableCode);
            headlessWrapper(null, null, null);
            
        } catch (err) {
            console.error(err);
        }
    };
`;
var generateHeadlessJsHtml = () => {
  return BASE_HTML_WRAPPER("", HEADLESS_RUNNER(false), false);
};
var generateHeadlessTsHtml = () => {
  return BASE_HTML_WRAPPER(BABEL_CDN3, HEADLESS_RUNNER(true), false);
};

// runtime/runner.ts
var SANDBOX_ATTRIBUTES = "allow-scripts allow-modals allow-forms";
var createSandboxUrl = (mode = "dom", isPredictionMode = false) => {
  let html = "";
  const showPlaceholder = !isPredictionMode;
  switch (mode) {
    case "p5":
      html = generateP5Html(showPlaceholder);
      break;
    case "react":
      html = generateReactHtml(showPlaceholder);
      break;
    case "typescript":
      html = generateTsHtml(showPlaceholder);
      break;
    case "react-ts":
      html = generateReactTsHtml(showPlaceholder);
      break;
    case "express":
      html = generateExpressHtml(showPlaceholder);
      break;
    case "express-ts":
      html = generateExpressTsHtml(showPlaceholder);
      break;
    case "node-js":
      html = generateHeadlessJsHtml();
      break;
    case "node-ts":
      html = generateHeadlessTsHtml();
      break;
    default:
      html = generateDomHtml(showPlaceholder);
  }
  const blob = new Blob([html], { type: "text/html" });
  return URL.createObjectURL(blob);
};
var executeCodeInSandbox = (iframeContentWindow, code) => {
  iframeContentWindow.postMessage({ type: "EXECUTE", code }, "*");
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
var Console = ({
  logs,
  onClear,
  themeMode,
  className = ""
}) => {
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
            border-b border-transparent hover:bg-black/5 dark:hover:bg-white/5 px-1 py-0.5 break-all whitespace-pre-wrap
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
};

// components/OutputFrame.tsx
import { GripHorizontal } from "lucide-react";
import { jsx as jsx5, jsxs as jsxs4 } from "react/jsx-runtime";
var OutputFrame = ({
  runTrigger,
  code,
  themeMode,
  environmentMode,
  isBlurred = false,
  isPredictionMode = false
}) => {
  const iframeRef = useRef(null);
  const containerRef = useRef(null);
  const channelRef = useRef(null);
  const [sandboxSrc, setSandboxSrc] = useState("");
  const [logs, setLogs] = useState([]);
  const [consoleHeight, setConsoleHeight] = useState(150);
  const [isDragging, setIsDragging] = useState(false);
  const isHeadless = environmentMode === "node-js" || environmentMode === "node-ts";
  useEffect(() => {
    channelRef.current = new MessageChannel();
    channelRef.current.port1.onmessage = (event) => {
      const { type, payload } = event.data;
      if (type === "CONSOLE_LOG" || type === "RUNTIME_ERROR" || type === "CONSOLE_WARN") {
        setLogs((prev) => [...prev, {
          type: type === "RUNTIME_ERROR" ? "error" : type === "CONSOLE_WARN" ? "warn" : "log",
          content: payload,
          timestamp: Date.now()
        }]);
      }
    };
    return () => {
      if (channelRef.current) {
        channelRef.current.port1.close();
      }
    };
  }, []);
  useEffect(() => {
    const url = createSandboxUrl(environmentMode, isPredictionMode);
    setSandboxSrc(url);
    return () => URL.revokeObjectURL(url);
  }, [environmentMode, isPredictionMode]);
  useEffect(() => {
    if (runTrigger > 0) {
      setLogs([]);
      if (iframeRef.current?.contentWindow) {
        executeCodeInSandbox(iframeRef.current.contentWindow, code);
      }
    }
  }, [runTrigger, code]);
  useEffect(() => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ type: "THEME", mode: themeMode }, "*");
    }
  }, [themeMode]);
  const handleIframeLoad = () => {
    if (iframeRef.current?.contentWindow && channelRef.current) {
      iframeRef.current.contentWindow.postMessage({ type: "INIT_PORT" }, "*", [channelRef.current.port2]);
      iframeRef.current.contentWindow.postMessage({ type: "THEME", mode: themeMode }, "*");
    }
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
    const clampedHeight = Math.max(30, Math.min(containerRect.height * 0.8, newHeight));
    setConsoleHeight(clampedHeight);
  }, [isDragging]);
  const handleMouseUp = useCallback(() => setIsDragging(false), []);
  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "row-resize";
      document.body.style.userSelect = "none";
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
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
      isReady: runTrigger > 0,
      overlayMessage: isBlurred ? "Make your Prediction" : void 0,
      children: /* @__PURE__ */ jsxs4("div", { ref: containerRef, className: "w-full h-full flex flex-col relative", children: [
        !isHeadless && /* @__PURE__ */ jsx5("div", { className: "flex-1 min-h-0 relative", children: /* @__PURE__ */ jsx5(
          "iframe",
          {
            ref: iframeRef,
            src: sandboxSrc,
            title: "Code Output",
            sandbox: SANDBOX_ATTRIBUTES,
            className: `w-full h-full border-none ${isDragging ? "pointer-events-none" : ""}`,
            onLoad: handleIframeLoad
          }
        ) }),
        !isHeadless && /* @__PURE__ */ jsx5(
          "div",
          {
            onMouseDown: handleMouseDown,
            className: `
                  h-3 shrink-0 flex items-center justify-center cursor-row-resize z-10 hover:bg-blue-500 hover:text-white transition-colors
                  ${themeMode === "dark" ? "bg-[#252526] text-gray-600 border-t border-b border-black/20" : "bg-gray-100 text-gray-400 border-t border-b border-gray-200"}
                  ${isDragging ? "!bg-blue-600 !text-white" : ""}
              `,
            children: /* @__PURE__ */ jsx5(GripHorizontal, { className: "w-3 h-3" })
          }
        ),
        /* @__PURE__ */ jsx5("div", { style: { height: isHeadless ? "100%" : consoleHeight }, className: "shrink-0 min-h-0", children: /* @__PURE__ */ jsx5(Console, { logs, onClear: () => setLogs([]), themeMode }) }),
        isHeadless && /* @__PURE__ */ jsx5(
          "iframe",
          {
            ref: iframeRef,
            src: sandboxSrc,
            title: "Headless Execution",
            sandbox: SANDBOX_ATTRIBUTES,
            className: "hidden",
            onLoad: handleIframeLoad
          }
        )
      ] })
    }
  );
};

// components/ServerOutput.tsx
import { useEffect as useEffect2, useRef as useRef2, useState as useState2, useCallback as useCallback2 } from "react";
import { Server, Clock, AlertCircle, GripHorizontal as GripHorizontal2 } from "lucide-react";
import { jsx as jsx6, jsxs as jsxs5 } from "react/jsx-runtime";
var ServerOutput = ({
  runTrigger,
  code,
  themeMode,
  environmentMode,
  isBlurred = false
}) => {
  const iframeRef = useRef2(null);
  const containerRef = useRef2(null);
  const channelRef = useRef2(null);
  const [sandboxSrc, setSandboxSrc] = useState2("");
  const [logs, setLogs] = useState2([]);
  const [route, setRoute] = useState2("/");
  const [method, setMethod] = useState2("GET");
  const [response, setResponse] = useState2(null);
  const [isLoading, setIsLoading] = useState2(false);
  const [serverReady, setServerReady] = useState2(false);
  const [runtimeError, setRuntimeError] = useState2(null);
  const [consoleHeight, setConsoleHeight] = useState2(150);
  const [isDragging, setIsDragging] = useState2(false);
  useEffect2(() => {
    channelRef.current = new MessageChannel();
    channelRef.current.port1.onmessage = (event) => {
      const { type, payload } = event.data;
      if (type === "SERVER_READY") {
        setServerReady(true);
        setRuntimeError(null);
        setLogs((prev) => [...prev, { type: "log", content: "[System] Server listening...", timestamp: Date.now() }]);
      } else if (type === "REQUEST_COMPLETE") {
        setResponse(payload);
        setIsLoading(false);
      } else if (type === "RUNTIME_ERROR") {
        setRuntimeError(payload);
        setIsLoading(false);
        setLogs((prev) => [...prev, { type: "error", content: payload, timestamp: Date.now() }]);
        if (!serverReady) setServerReady(false);
      } else if (type === "CONSOLE_LOG" || type === "CONSOLE_WARN") {
        setLogs((prev) => [...prev, {
          type: type === "CONSOLE_WARN" ? "warn" : "log",
          content: payload,
          timestamp: Date.now()
        }]);
      }
    };
    return () => {
      if (channelRef.current) channelRef.current.port1.close();
    };
  }, []);
  useEffect2(() => {
    const url = createSandboxUrl(environmentMode);
    setSandboxSrc(url);
    return () => URL.revokeObjectURL(url);
  }, [environmentMode]);
  useEffect2(() => {
    if (runTrigger > 0 && iframeRef.current?.contentWindow) {
      setServerReady(false);
      setResponse(null);
      setRuntimeError(null);
      setLogs([]);
      executeCodeInSandbox(iframeRef.current.contentWindow, code);
    }
  }, [runTrigger, code]);
  useEffect2(() => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ type: "THEME", mode: themeMode }, "*");
    }
  }, [themeMode]);
  const handleIframeLoad = () => {
    if (iframeRef.current?.contentWindow && channelRef.current) {
      iframeRef.current.contentWindow.postMessage({ type: "INIT_PORT" }, "*", [channelRef.current.port2]);
      iframeRef.current.contentWindow.postMessage({ type: "THEME", mode: themeMode }, "*");
    }
  };
  const sendRequest = () => {
    if (!serverReady || !channelRef.current) return;
    setIsLoading(true);
    setResponse(null);
    setRuntimeError(null);
    channelRef.current.port1.postMessage({
      type: "SIMULATE_REQUEST",
      payload: { method, url: route }
    });
  };
  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleMouseMove = useCallback2((e) => {
    if (!isDragging || !containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const relativeY = e.clientY - containerRect.top;
    const newHeight = containerRect.height - relativeY;
    const clampedHeight = Math.max(30, Math.min(containerRect.height * 0.8, newHeight));
    setConsoleHeight(clampedHeight);
  }, [isDragging]);
  const handleMouseUp = useCallback2(() => setIsDragging(false), []);
  useEffect2(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "row-resize";
      document.body.style.userSelect = "none";
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
      /* @__PURE__ */ jsx6("div", { className: `px-3 py-1.5 rounded text-xs font-bold tracking-wider ${themeMode === "dark" ? "bg-blue-900/50 text-blue-400" : "bg-blue-100 text-blue-700"}`, children: "GET" }),
      /* @__PURE__ */ jsx6("input", { type: "text", value: route, onChange: (e) => setRoute(e.target.value), placeholder: "/api/users", className: `flex-1 bg-transparent border-none outline-none text-sm font-mono ${themeMode === "dark" ? "text-white placeholder-gray-600" : "text-gray-800 placeholder-gray-400"}` }),
      /* @__PURE__ */ jsx6(Button, { onClick: sendRequest, disabled: !isReady || isLoading || !serverReady || !!runtimeError, className: "!py-1 !px-3 h-8 text-xs", children: isLoading ? "Sending..." : "Send" })
    ] }),
    /* @__PURE__ */ jsx6(PreviewContainer, { themeMode, isReady, overlayMessage: isBlurred ? "Make your Prediction" : void 0, children: /* @__PURE__ */ jsxs5("div", { ref: containerRef, className: "flex flex-col h-full relative", children: [
      isReady && !serverReady && !runtimeError && !isBlurred && /* @__PURE__ */ jsxs5("div", { className: "absolute top-2 right-2 z-10 flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-xs", children: [
        /* @__PURE__ */ jsx6(Clock, { className: "w-3 h-3 animate-pulse" }),
        /* @__PURE__ */ jsx6("span", { children: "Starting Server..." })
      ] }),
      /* @__PURE__ */ jsx6("div", { className: `flex-1 overflow-auto p-4 font-mono text-sm ${themeMode === "dark" ? "bg-[#1e1e1e]" : "bg-gray-50"}`, children: runtimeError ? /* @__PURE__ */ jsxs5("div", { className: "p-4 border border-red-500/20 rounded bg-red-500/5 text-red-400", children: [
        /* @__PURE__ */ jsxs5("div", { className: "flex items-center gap-2 text-red-500 font-bold mb-2", children: [
          /* @__PURE__ */ jsx6(AlertCircle, { className: "w-4 h-4" }),
          /* @__PURE__ */ jsx6("span", { children: "Runtime Error" })
        ] }),
        /* @__PURE__ */ jsx6("pre", { className: "whitespace-pre-wrap break-all", children: runtimeError })
      ] }) : response ? /* @__PURE__ */ jsxs5("div", { children: [
        /* @__PURE__ */ jsx6("div", { className: "flex items-center justify-between mb-4 pb-2 border-b border-dashed border-gray-500/20", children: /* @__PURE__ */ jsx6("span", { className: `font-bold ${response.status < 300 ? "text-green-500" : "text-red-500"}`, children: response.status }) }),
        /* @__PURE__ */ jsx6("pre", { className: `${themeMode === "dark" ? "text-blue-300" : "text-blue-700"}`, children: JSON.stringify(response.data, null, 2) })
      ] }) : /* @__PURE__ */ jsxs5("div", { className: "h-full flex flex-col items-center justify-center opacity-20", children: [
        /* @__PURE__ */ jsx6(Server, { className: "w-12 h-12 mb-2" }),
        /* @__PURE__ */ jsx6("p", { children: "Ready" })
      ] }) }),
      /* @__PURE__ */ jsx6("div", { onMouseDown: handleMouseDown, className: `h-3 shrink-0 flex items-center justify-center cursor-row-resize ${themeMode === "dark" ? "bg-[#252526] text-gray-600 border-t border-b border-black/20" : "bg-gray-100 text-gray-400 border-t border-b border-gray-200"}`, children: /* @__PURE__ */ jsx6(GripHorizontal2, { className: "w-3 h-3" }) }),
      /* @__PURE__ */ jsx6("div", { style: { height: consoleHeight }, className: "shrink-0 min-h-0", children: /* @__PURE__ */ jsx6(Console, { logs, onClear: () => setLogs([]), themeMode }) }),
      /* @__PURE__ */ jsx6("iframe", { ref: iframeRef, src: sandboxSrc, title: "Server Execution", sandbox: SANDBOX_ATTRIBUTES, className: "hidden", onLoad: handleIframeLoad })
    ] }) })
  ] });
};

// components/HelpSidebar.tsx
import { X, BookOpen } from "lucide-react";

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

// components/HelpSidebar.tsx
import { jsx as jsx7, jsxs as jsxs6 } from "react/jsx-runtime";
var HelpSidebar = ({
  isOpen,
  onClose,
  themeMode,
  environmentMode
}) => {
  const docs = getDocsForMode(environmentMode);
  if (!isOpen) return null;
  return /* @__PURE__ */ jsxs6(
    "aside",
    {
      className: `
        flex flex-col border-l w-full md:w-80 shrink-0 h-full overflow-hidden transition-colors duration-300
        ${themeMode === "dark" ? "bg-[#1e1e1e] border-white/10" : "bg-gray-50 border-gray-200"}
      `,
      children: [
        /* @__PURE__ */ jsxs6("div", { className: `
        flex items-center justify-between px-4 h-12 shrink-0 border-b
        ${themeMode === "dark" ? "border-white/10 bg-[#252526]" : "border-gray-200 bg-white"}
      `, children: [
          /* @__PURE__ */ jsxs6("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx7(BookOpen, { className: `w-4 h-4 ${themeMode === "dark" ? "text-blue-400" : "text-blue-600"}` }),
            /* @__PURE__ */ jsx7("h2", { className: "font-semibold text-sm", children: "Documentation" })
          ] }),
          /* @__PURE__ */ jsx7(Button, { variant: "ghost", onClick: onClose, className: "!p-1 h-8 w-8", children: /* @__PURE__ */ jsx7(X, { className: "w-4 h-4" }) })
        ] }),
        /* @__PURE__ */ jsx7("div", { className: "flex-1 overflow-y-auto p-4 space-y-6", children: docs ? docs.map((section, idx) => /* @__PURE__ */ jsxs6("div", { children: [
          /* @__PURE__ */ jsx7("h3", { className: `
                text-xs font-bold uppercase tracking-wider mb-3
                ${themeMode === "dark" ? "text-gray-500" : "text-gray-500"}
              `, children: section.title }),
          /* @__PURE__ */ jsx7("div", { className: "space-y-3", children: section.items.map((item, i) => /* @__PURE__ */ jsxs6("div", { className: `
                    p-3 rounded-md text-sm
                    ${themeMode === "dark" ? "bg-black/20 hover:bg-black/40" : "bg-white shadow-sm border border-gray-100"}
                  `, children: [
            /* @__PURE__ */ jsx7("code", { className: `
                      font-mono text-xs block mb-1
                      ${themeMode === "dark" ? "text-blue-300" : "text-blue-700"}
                    `, children: item.name }),
            /* @__PURE__ */ jsx7("p", { className: `
                      leading-relaxed text-xs opacity-90
                      ${themeMode === "dark" ? "text-gray-300" : "text-gray-600"}
                    `, children: item.desc }),
            item.example && /* @__PURE__ */ jsx7("div", { className: `
                        mt-2 p-2 rounded text-xs font-mono overflow-x-auto whitespace-pre
                        ${themeMode === "dark" ? "bg-black/30 text-gray-400" : "bg-gray-50 text-gray-600"}
                      `, children: item.example })
          ] }, i)) })
        ] }, idx)) : /* @__PURE__ */ jsx7("div", { className: "text-center py-8 opacity-60 text-sm", children: /* @__PURE__ */ jsx7("p", { children: "No documentation available for this mode." }) }) })
      ]
    }
  );
};

// components/CodingEnvironment.tsx
import { jsx as jsx8, jsxs as jsxs7 } from "react/jsx-runtime";
var CodingEnvironment = ({
  code,
  onChange,
  onRun,
  isRunning,
  runTrigger,
  themeMode,
  environmentMode,
  sessionId,
  predictionPrompt
}) => {
  const [isHelpOpen, setIsHelpOpen] = useState3(false);
  const [predictionAnswer, setPredictionAnswer] = useState3("");
  const [isPredictionLocked, setIsPredictionLocked] = useState3(false);
  const [layout, setLayout] = useState3("horizontal");
  const [isFullscreen, setIsFullscreen] = useState3(false);
  const containerRef = useRef3(null);
  const fullscreenContainerRef = useRef3(null);
  const [editorRatio, setEditorRatio] = useState3(0.5);
  const [isDragging, setIsDragging] = useState3(false);
  const hasDocs = !!getDocsForMode(environmentMode);
  const hasPredictionTask = predictionPrompt !== void 0 && predictionPrompt !== null && predictionPrompt !== "";
  const isPredictionFulfilled = !hasPredictionTask || predictionAnswer.trim().length > 0;
  useEffect3(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);
  const toggleFullscreen = () => {
    if (!fullscreenContainerRef.current) return;
    if (!document.fullscreenElement) {
      fullscreenContainerRef.current.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };
  useEffect3(() => {
    setPredictionAnswer("");
    setIsPredictionLocked(false);
  }, [sessionId]);
  useEffect3(() => {
    if (!hasDocs) setIsHelpOpen(false);
  }, [environmentMode, hasDocs]);
  const handleRunClick = () => {
    if (hasPredictionTask) {
      setIsPredictionLocked(true);
    }
    onRun();
  };
  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleMouseMove = useCallback3((e) => {
    if (!isDragging || !containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    let newRatio = 0.5;
    if (layout === "horizontal") {
      const relativeX = e.clientX - containerRect.left;
      newRatio = relativeX / containerRect.width;
    } else {
      const relativeY = e.clientY - containerRect.top;
      newRatio = relativeY / containerRect.height;
    }
    newRatio = Math.max(0.1, Math.min(0.9, newRatio));
    setEditorRatio(newRatio);
  }, [isDragging, layout]);
  const handleMouseUp = useCallback3(() => {
    setIsDragging(false);
  }, []);
  useEffect3(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      document.body.style.userSelect = "none";
      document.body.style.cursor = layout === "horizontal" ? "col-resize" : "row-resize";
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };
  }, [isDragging, handleMouseMove, handleMouseUp, layout]);
  let fileName = "script.js";
  switch (environmentMode) {
    case "p5":
      fileName = "sketch.js";
      break;
    case "react":
      fileName = "App.jsx";
      break;
    case "typescript":
      fileName = "script.ts";
      break;
    case "react-ts":
      fileName = "App.tsx";
      break;
    case "express":
      fileName = "server.js";
      break;
    case "express-ts":
      fileName = "server.ts";
      break;
    case "node-js":
      fileName = "index.js";
      break;
    case "node-ts":
      fileName = "index.ts";
      break;
    default:
      fileName = "script.js";
  }
  const isServerMode = environmentMode === "express" || environmentMode === "express-ts";
  return /* @__PURE__ */ jsxs7(
    "div",
    {
      ref: fullscreenContainerRef,
      className: `flex-1 overflow-hidden flex flex-col relative ${themeMode === "dark" ? "bg-[#1e1e1e]" : "bg-white"}`,
      children: [
        hasPredictionTask && /* @__PURE__ */ jsx8("div", { className: `
          shrink-0 border-b p-4 flex flex-col gap-3 transition-colors duration-300
          ${themeMode === "dark" ? "bg-[#252526] border-white/10" : "bg-blue-50/50 border-blue-100"}
        `, children: /* @__PURE__ */ jsxs7("div", { className: "flex items-start gap-3", children: [
          /* @__PURE__ */ jsx8("div", { className: `p-2 rounded-lg shrink-0 ${themeMode === "dark" ? "bg-purple-500/20 text-purple-400" : "bg-purple-100 text-purple-700"}`, children: /* @__PURE__ */ jsx8(Brain, { className: "w-5 h-5" }) }),
          /* @__PURE__ */ jsxs7("div", { className: "flex-1 space-y-2", children: [
            /* @__PURE__ */ jsxs7("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxs7("div", { className: "flex-1", children: [
                /* @__PURE__ */ jsx8("h3", { className: `text-sm font-bold uppercase tracking-wide mb-1 ${themeMode === "dark" ? "text-purple-400" : "text-purple-700"}`, children: "Predict" }),
                /* @__PURE__ */ jsx8("div", { className: `text-sm leading-relaxed ${themeMode === "dark" ? "text-gray-300" : "text-gray-800"}`, children: predictionPrompt })
              ] }),
              isPredictionLocked && /* @__PURE__ */ jsxs7("div", { className: `flex items-center gap-1 text-xs font-medium px-2 py-1 rounded border ml-4 ${themeMode === "dark" ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-green-100 text-green-700 border-green-200"}`, children: [
                /* @__PURE__ */ jsx8(Lock, { className: "w-3 h-3" }),
                "Locked"
              ] })
            ] }),
            /* @__PURE__ */ jsx8(
              "textarea",
              {
                value: predictionAnswer,
                onChange: (e) => setPredictionAnswer(e.target.value),
                placeholder: "Type your prediction here...",
                disabled: isPredictionLocked,
                className: `
                    w-full min-h-[60px] p-3 rounded-md text-sm outline-none border focus:ring-2 transition-all resize-y
                    disabled:opacity-60 disabled:cursor-not-allowed
                    ${themeMode === "dark" ? "bg-black/20 border-white/10 text-gray-200 placeholder-gray-500 focus:border-purple-500/50 focus:ring-purple-500/20 disabled:bg-black/40" : "bg-white border-gray-300 text-gray-800 placeholder-gray-400 focus:border-purple-500 focus:ring-purple-200 disabled:bg-gray-50"}
                  `
              }
            )
          ] })
        ] }) }),
        /* @__PURE__ */ jsxs7("div", { className: `h-12 shrink-0 border-b flex items-center justify-between px-4 transition-colors duration-300 ${themeMode === "dark" ? "bg-[#1e1e1e] border-white/10" : "bg-white border-gray-200"}`, children: [
          /* @__PURE__ */ jsxs7("div", { className: `flex items-center gap-2 transition-colors ${themeMode === "dark" ? "text-gray-400" : "text-gray-600"}`, children: [
            /* @__PURE__ */ jsx8(FileCode, { className: "w-4 h-4" }),
            /* @__PURE__ */ jsx8("span", { className: "text-sm font-mono opacity-80", children: fileName }),
            hasPredictionTask && /* @__PURE__ */ jsx8("span", { className: "ml-2 text-xs px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-500 border border-orange-500/20", children: "Read Only" })
          ] }),
          /* @__PURE__ */ jsxs7("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxs7("div", { className: "flex items-center gap-1 bg-black/5 dark:bg-white/5 rounded-md p-0.5", children: [
              /* @__PURE__ */ jsx8(
                "button",
                {
                  onClick: () => setLayout("horizontal"),
                  className: `p-1.5 rounded ${layout === "horizontal" ? themeMode === "dark" ? "bg-gray-700 text-white shadow-sm" : "bg-white text-black shadow-sm" : "opacity-50 hover:opacity-100"}`,
                  title: "Split Screen (Side by Side)",
                  children: /* @__PURE__ */ jsx8(Columns, { className: "w-3.5 h-3.5" })
                }
              ),
              /* @__PURE__ */ jsx8(
                "button",
                {
                  onClick: () => setLayout("vertical"),
                  className: `p-1.5 rounded ${layout === "vertical" ? themeMode === "dark" ? "bg-gray-700 text-white shadow-sm" : "bg-white text-black shadow-sm" : "opacity-50 hover:opacity-100"}`,
                  title: "Vertical Split (Stacked)",
                  children: /* @__PURE__ */ jsx8(Rows, { className: "w-3.5 h-3.5" })
                }
              ),
              /* @__PURE__ */ jsx8("div", { className: `w-px h-3 mx-0.5 ${themeMode === "dark" ? "bg-white/10" : "bg-black/10"}` }),
              /* @__PURE__ */ jsx8(
                "button",
                {
                  onClick: toggleFullscreen,
                  className: `p-1.5 rounded opacity-50 hover:opacity-100 transition-opacity ${isFullscreen ? themeMode === "dark" ? "bg-blue-500/20 text-blue-400" : "bg-blue-50 text-blue-600" : ""}`,
                  title: isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen",
                  children: isFullscreen ? /* @__PURE__ */ jsx8(Minimize2, { className: "w-3.5 h-3.5" }) : /* @__PURE__ */ jsx8(Maximize2, { className: "w-3.5 h-3.5" })
                }
              )
            ] }),
            /* @__PURE__ */ jsx8("div", { className: `h-4 w-px mx-1 ${themeMode === "dark" ? "bg-white/10" : "bg-gray-200"}` }),
            hasDocs && /* @__PURE__ */ jsxs7(
              Button,
              {
                variant: "ghost",
                onClick: () => setIsHelpOpen(!isHelpOpen),
                className: `!px-2 ${isHelpOpen ? "bg-blue-500/10 text-blue-500" : ""}`,
                title: "Toggle Documentation",
                children: [
                  /* @__PURE__ */ jsx8(Book, { className: "w-4 h-4" }),
                  /* @__PURE__ */ jsx8("span", { className: "hidden sm:inline text-xs ml-2", children: "Help" })
                ]
              }
            ),
            /* @__PURE__ */ jsx8(
              Button,
              {
                onClick: handleRunClick,
                disabled: isRunning || !isPredictionFulfilled,
                className: `h-8 px-4 text-sm font-semibold shadow-sm transition-all duration-300 ${!isPredictionFulfilled ? "opacity-50 cursor-not-allowed grayscale" : ""}`,
                icon: isRunning ? /* @__PURE__ */ jsx8(CheckCircle2, { className: "w-3.5 h-3.5 animate-pulse" }) : /* @__PURE__ */ jsx8(Play, { className: "w-3.5 h-3.5 fill-current" }),
                children: isRunning ? "Running..." : "Run Code"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs7("div", { className: "flex-1 flex overflow-hidden", children: [
          /* @__PURE__ */ jsxs7(
            "div",
            {
              ref: containerRef,
              className: `flex-1 flex overflow-hidden min-w-0 ${layout === "horizontal" ? "flex-row" : "flex-col"}`,
              children: [
                /* @__PURE__ */ jsx8(
                  "section",
                  {
                    style: {
                      [layout === "horizontal" ? "width" : "height"]: `${editorRatio * 100}%`
                    },
                    className: `
             flex flex-col relative group transition-colors duration-300 min-w-0
             ${themeMode === "dark" ? "border-gray-800" : "border-gray-200"}
            `,
                    children: /* @__PURE__ */ jsx8(
                      CodeEditor,
                      {
                        code,
                        onChange: (val) => onChange(val || ""),
                        themeMode,
                        environmentMode,
                        sessionId,
                        readOnly: hasPredictionTask
                      }
                    )
                  }
                ),
                /* @__PURE__ */ jsx8(
                  "div",
                  {
                    onMouseDown: handleMouseDown,
                    className: `
                z-20 flex items-center justify-center shrink-0 hover:bg-blue-500 hover:text-white transition-colors
                ${themeMode === "dark" ? "bg-[#1e1e1e] text-gray-600 border-black/20" : "bg-gray-100 text-gray-400 border-white"}
                ${isDragging ? "!bg-blue-600 !text-white" : ""}
                ${layout === "horizontal" ? "w-3 h-full cursor-col-resize border-l border-r" : "h-3 w-full cursor-row-resize border-t border-b"}
            `,
                    children: layout === "horizontal" ? /* @__PURE__ */ jsx8(GripVertical, { className: "w-3 h-3" }) : /* @__PURE__ */ jsx8(GripHorizontal3, { className: "w-3 h-3" })
                  }
                ),
                /* @__PURE__ */ jsx8(
                  "section",
                  {
                    style: {
                      [layout === "horizontal" ? "width" : "height"]: `${(1 - editorRatio) * 100}%`
                    },
                    className: `
                flex flex-col relative transition-colors duration-300 min-w-0 
                ${themeMode === "dark" ? "bg-gray-800" : "bg-gray-100"}
                ${isDragging ? "pointer-events-none" : ""} /* Prevent iframe stealing mouse events */
            `,
                    children: /* @__PURE__ */ jsx8("div", { className: "flex-1 p-2 md:p-4 h-full overflow-hidden", children: isServerMode ? /* @__PURE__ */ jsx8(
                      ServerOutput,
                      {
                        runTrigger,
                        code,
                        themeMode,
                        environmentMode,
                        isBlurred: !isPredictionFulfilled
                      }
                    ) : /* @__PURE__ */ jsx8(
                      OutputFrame,
                      {
                        runTrigger,
                        code,
                        themeMode,
                        environmentMode,
                        isBlurred: !isPredictionFulfilled,
                        isPredictionMode: hasPredictionTask
                      }
                    ) })
                  }
                )
              ]
            }
          ),
          hasDocs && isHelpOpen && /* @__PURE__ */ jsx8(
            HelpSidebar,
            {
              isOpen: isHelpOpen,
              onClose: () => setIsHelpOpen(false),
              themeMode,
              environmentMode
            }
          )
        ] })
      ]
    }
  );
};

// components/CodeShoebox.tsx
import { jsx as jsx9 } from "react/jsx-runtime";
var CodeShoebox = ({
  code,
  onCodeChange,
  environmentMode,
  theme,
  themeMode,
  sessionId = 0,
  prediction_prompt
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
  const themeStyles = useMemo2(() => {
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
      // Use theme specific background if available, else default
      "--background": colors.background || defaultBg,
      "--foreground": colors.foreground || defaultFg
    };
  }, [themeMode, theme]);
  return /* @__PURE__ */ jsx9(
    "div",
    {
      className: "flex flex-col h-full w-full transition-colors duration-300 bg-[hsl(var(--background))] text-[hsl(var(--foreground))]",
      style: themeStyles,
      children: /* @__PURE__ */ jsx9(
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
          predictionPrompt: prediction_prompt
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
    alert('Button clicked! Securely.');
    console.log('Button interaction detected at ' + new Date().toLocaleTimeString());
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
    case "p5":
      return P5_STARTER_CODE;
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
    case "node-js":
      return NODE_JS_STARTER_CODE;
    case "node-ts":
      return NODE_TS_STARTER_CODE;
    default:
      return STARTER_CODE;
  }
};
var useSandboxState = (persistenceKey) => {
  const STORAGE_PREFIX = persistenceKey ? `cs_${persistenceKey}` : "";
  const getStorageKey = useCallback4((key) => `${STORAGE_PREFIX}_${key}`, [STORAGE_PREFIX]);
  const loadSavedMode = () => {
    if (typeof persistenceKey !== "string" || typeof window === "undefined") return "dom";
    try {
      const saved = localStorage.getItem(getStorageKey("env_mode"));
      return saved || "dom";
    } catch {
      return "dom";
    }
  };
  const loadSavedThemeMode = () => {
    if (typeof persistenceKey !== "string" || typeof window === "undefined") return "dark";
    try {
      const saved = localStorage.getItem(getStorageKey("theme_mode"));
      return saved || "dark";
    } catch {
      return "dark";
    }
  };
  const loadSavedThemeName = () => {
    if (typeof persistenceKey !== "string" || typeof window === "undefined") return themes[0].name;
    try {
      return localStorage.getItem(getStorageKey("theme_name")) || themes[0].name;
    } catch {
      return themes[0].name;
    }
  };
  const loadSavedCode = useCallback4((mode) => {
    const starter = getStarterCode(mode);
    if (typeof persistenceKey !== "string" || typeof window === "undefined") return starter;
    try {
      const key = getStorageKey(`code_${mode}`);
      const saved = localStorage.getItem(key);
      return typeof saved === "string" ? saved : starter;
    } catch {
      return starter;
    }
  }, [persistenceKey, getStorageKey]);
  const [environmentMode, setEnvironmentMode] = useState5(loadSavedMode);
  const [themeMode, setThemeMode] = useState5(loadSavedThemeMode);
  const [activeThemeName, setActiveThemeName] = useState5(loadSavedThemeName);
  const [code, setCode] = useState5(() => {
    return loadSavedCode(environmentMode);
  });
  const [sessionId, setSessionId] = useState5(0);
  useEffect5(() => {
    if (typeof persistenceKey !== "string") return;
    localStorage.setItem(getStorageKey("env_mode"), environmentMode);
  }, [environmentMode, persistenceKey, getStorageKey]);
  useEffect5(() => {
    if (typeof persistenceKey !== "string") return;
    const key = getStorageKey(`code_${environmentMode}`);
    localStorage.setItem(key, code);
  }, [code, environmentMode, persistenceKey, getStorageKey]);
  useEffect5(() => {
    if (typeof persistenceKey !== "string") return;
    localStorage.setItem(getStorageKey("theme_mode"), themeMode);
  }, [themeMode, persistenceKey, getStorageKey]);
  useEffect5(() => {
    if (typeof persistenceKey !== "string") return;
    localStorage.setItem(getStorageKey("theme_name"), activeThemeName);
  }, [activeThemeName, persistenceKey, getStorageKey]);
  const switchMode = useCallback4((newMode) => {
    if (newMode === environmentMode) return;
    const savedCode = loadSavedCode(newMode);
    setEnvironmentMode(newMode);
    setCode(savedCode);
    setSessionId((prev) => prev + 1);
  }, [environmentMode, loadSavedCode]);
  const resetCode = useCallback4(() => {
    const starter = getStarterCode(environmentMode);
    setCode(starter);
    setSessionId((prev) => prev + 1);
  }, [environmentMode]);
  return {
    environmentMode,
    themeMode,
    activeThemeName,
    code,
    sessionId,
    // Actions
    setEnvironmentMode: switchMode,
    setThemeMode,
    setActiveThemeName,
    setCode,
    resetCode
  };
};

// hooks/useAutoKey.ts
import { useMemo as useMemo3 } from "react";
var useAutoKey = (identifier, initialCode = "", prefix = "auto") => {
  const key = useMemo3(() => {
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
