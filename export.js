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
  themes: () => themes,
  useAutoKey: () => useAutoKey,
  useSandboxState: () => useSandboxState
});
module.exports = __toCommonJS(export_exports);

// components/CodeShoebox.tsx
var import_react7 = require("react");

// components/CodingEnvironment.tsx
var import_react6 = require("react");
var import_lucide_react3 = require("lucide-react");

// components/CodeEditor.tsx
var import_react = require("react");
var import_react2 = __toESM(require("@monaco-editor/react"));
var import_jsx_runtime = require("react/jsx-runtime");
var CodeEditor = ({
  code,
  onChange,
  themeMode,
  environmentMode,
  sessionId,
  readOnly = false
}) => {
  const modelPath = (0, import_react.useMemo)(() => {
    const basePath = `sandbox-${environmentMode}-${sessionId}`;
    switch (environmentMode) {
      case "typescript":
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
  const language = (0, import_react.useMemo)(() => {
    if (environmentMode === "typescript" || environmentMode === "react-ts") return "typescript";
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
        noLib: false
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
    }
  };
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "monaco-editor-container h-full w-full overflow-hidden", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    import_react2.default,
    {
      height: "100%",
      path: modelPath,
      defaultLanguage: language,
      theme: themeMode === "dark" ? "vs-dark" : "light",
      value: code,
      onChange,
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
var import_react4 = require("react");

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
        
        /* Flex layout to pin console to bottom */
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

    #console-output {
        flex-shrink: 0;
        max-height: 35%; /* Cap console height */
        overflow-y: auto;
        background: #f4f4f4;
        border-top: 1px solid #ccc; /* Separator line */
        padding: 0.5rem 1rem;
        font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
        font-size: 13px;
        white-space: pre-wrap;
        display: none; /* Hidden until logs exist */
        width: 100%;
        box-sizing: border-box;
    }
    body.dark #console-output { background: #222; border-color: #444; }
    
    .error { color: #ef4444; }
    .log { color: #333; }
    body.dark .log { color: #ccc; }

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
    const consoleOutput = document.getElementById('console-output');
    
    function logToScreen(msg, type = 'log') {
        consoleOutput.style.display = 'block';
        const line = document.createElement('div');
        line.className = type;
        line.style.borderBottom = '1px solid rgba(0,0,0,0.05)';
        line.style.padding = '2px 0';
        
        const textContent = typeof msg === 'object' ? JSON.stringify(msg, null, 2) : String(msg);
        line.textContent = '> ' + textContent;
        
        consoleOutput.appendChild(line);
        // Auto scroll to bottom
        consoleOutput.scrollTop = consoleOutput.scrollHeight;

        // Notify parent window (React app) about the log/error
        window.parent.postMessage({ 
            type: type === 'error' ? 'RUNTIME_ERROR' : 'CONSOLE_LOG',
            payload: textContent
        }, '*');
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

    window.onerror = function(message, source, lineno, colno, error) {
        logToScreen(\`Error: \${message} (Line \${lineno})\`, 'error');
        return true;
    };

    window.addEventListener('unhandledrejection', function(event) {
        logToScreen(\`Async Error: \${event.reason}\`, 'error');
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
    
    <!-- Console sits at the bottom due to flex layout -->
    <div id="console-output"></div>

    <script>
        ${CONSOLE_INTERCEPTOR}

        window.addEventListener('message', (event) => {
            const { type, code, mode } = event.data;

            if (type === 'EXECUTE') {
                const root = document.getElementById('root');
                const placeholder = document.getElementById('placeholder');
                if (placeholder) placeholder.style.display = 'none';
                
                // Clear console for new run
                consoleOutput.innerHTML = '';
                consoleOutput.style.display = 'none';
                
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
var EXPRESS_SHIM = `
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
            // Convert Express path params (e.g. /users/:id) to regex for simple matching
            // This is a basic implementation.
            const regexPath = path.replace(/:[^/]+/g, '([^/]+)');
            this.routes.GET[regexPath] = { originalPath: path, handler };
        }

        listen(port, cb) {
            if (cb) cb();
            // Notify parent that app is ready
            window.parent.postMessage({ type: 'SERVER_READY' }, '*');
        }

        // Internal method to process incoming requests from the UI
        async _handleRequest(method, url) {
            console.log(\`Incoming Request: \${method} \${url}\`);
            
            const methodRoutes = this.routes[method] || {};
            
            // Find matching route
            for (const routeRegex in methodRoutes) {
                const match = new RegExp(\`^\${routeRegex}$\`).exec(url);
                if (match) {
                    const { handler } = methodRoutes[routeRegex];
                    
                    // Extract params
                    const params = {};
                    // This is a simplification. A real router tracks param names.
                    // For this mock, we support basic direct matching or single param.
                    // If user used :id, we'd need to map match[1] to 'id'.
                    // For now, let's just expose a basic req object.
                    
                    // Improved Param Parsing for simple cases like /users/:id
                    // We need to know the param keys from originalPath
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
                        params, 
                        query: {} // Query parsing omitted for brevity
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

            return { status: 404, data: { error: \`Cannot \${method} \${url}\` } };
        }
    }

    // --- Global Shim ---
    const appInstance = new MockApp();
    window.express = function() {
        return appInstance;
    };

    window.runMode = function(code, root) {
        // Express Mode
        // We don't use 'root' for visual output, but we clear it to be clean
        root.innerHTML = '';
        
        // Reset routes on re-run
        appInstance.routes = { GET: {} };

        try {
            window.eval(code);
        } catch (err) {
            console.error(err);
        }
    };

    // --- Message Listener for Test Requests ---
    window.addEventListener('message', async (event) => {
        const { type, payload } = event.data;
        if (type === 'SIMULATE_REQUEST') {
            const { method, url } = payload;
            const response = await appInstance._handleRequest(method, url);
            
            // Send result back to parent
            window.parent.postMessage({
                type: 'REQUEST_COMPLETE',
                payload: response
            }, '*');
        }
    });
`;
var generateExpressHtml = (showPlaceholder = true) => {
  return BASE_HTML_WRAPPER("", EXPRESS_SHIM, false);
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

// components/OutputFrame.tsx
var import_jsx_runtime3 = require("react/jsx-runtime");
var OutputFrame = ({
  runTrigger,
  code,
  themeMode,
  environmentMode,
  isBlurred = false,
  isPredictionMode = false
}) => {
  const iframeRef = (0, import_react4.useRef)(null);
  const [sandboxSrc, setSandboxSrc] = (0, import_react4.useState)("");
  (0, import_react4.useEffect)(() => {
    const url = createSandboxUrl(environmentMode, isPredictionMode);
    setSandboxSrc(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [environmentMode, isPredictionMode]);
  (0, import_react4.useEffect)(() => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ type: "THEME", mode: themeMode }, "*");
    }
  }, [themeMode]);
  (0, import_react4.useEffect)(() => {
    if (runTrigger > 0 && iframeRef.current?.contentWindow) {
      executeCodeInSandbox(iframeRef.current.contentWindow, code);
    }
  }, [runTrigger]);
  const handleIframeLoad = () => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ type: "THEME", mode: themeMode }, "*");
    }
  };
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
    PreviewContainer,
    {
      themeMode,
      isReady: runTrigger > 0,
      overlayMessage: isBlurred ? "Make your Prediction" : void 0,
      children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "w-full h-full relative", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
        "iframe",
        {
          ref: iframeRef,
          src: sandboxSrc,
          title: "Code Output",
          sandbox: SANDBOX_ATTRIBUTES,
          className: "w-full h-full border-none",
          onLoad: handleIframeLoad
        }
      ) })
    }
  );
};

// components/ServerOutput.tsx
var import_react5 = require("react");
var import_lucide_react = require("lucide-react");

// components/Button.tsx
var import_jsx_runtime4 = require("react/jsx-runtime");
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
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
    "button",
    {
      className: `${baseStyles} ${variants[variant]} ${className}`,
      ...props,
      children: [
        icon && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "w-4 h-4", children: icon }),
        children
      ]
    }
  );
};

// components/ServerOutput.tsx
var import_jsx_runtime5 = require("react/jsx-runtime");
var ServerOutput = ({
  runTrigger,
  code,
  themeMode,
  environmentMode,
  isBlurred = false
}) => {
  const iframeRef = (0, import_react5.useRef)(null);
  const [sandboxSrc, setSandboxSrc] = (0, import_react5.useState)("");
  const [route, setRoute] = (0, import_react5.useState)("/");
  const [method, setMethod] = (0, import_react5.useState)("GET");
  const [response, setResponse] = (0, import_react5.useState)(null);
  const [isLoading, setIsLoading] = (0, import_react5.useState)(false);
  const [serverReady, setServerReady] = (0, import_react5.useState)(false);
  const [runtimeError, setRuntimeError] = (0, import_react5.useState)(null);
  (0, import_react5.useEffect)(() => {
    const url = createSandboxUrl(environmentMode);
    setSandboxSrc(url);
    return () => URL.revokeObjectURL(url);
  }, [environmentMode]);
  (0, import_react5.useEffect)(() => {
    if (runTrigger > 0 && iframeRef.current?.contentWindow) {
      setServerReady(false);
      setResponse(null);
      setRuntimeError(null);
      executeCodeInSandbox(iframeRef.current.contentWindow, code);
    }
  }, [runTrigger, code]);
  (0, import_react5.useEffect)(() => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ type: "THEME", mode: themeMode }, "*");
    }
  }, [themeMode]);
  (0, import_react5.useEffect)(() => {
    const handleMessage = (event) => {
      const { type, payload } = event.data;
      if (type === "SERVER_READY") {
        setServerReady(true);
        setRuntimeError(null);
      }
      if (type === "REQUEST_COMPLETE") {
        setResponse(payload);
        setIsLoading(false);
      }
      if (type === "RUNTIME_ERROR") {
        setRuntimeError(payload);
        setIsLoading(false);
        if (!serverReady) setServerReady(false);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [serverReady]);
  const sendRequest = () => {
    if (!serverReady) return;
    setIsLoading(true);
    setResponse(null);
    setRuntimeError(null);
    setTimeout(() => {
      iframeRef.current?.contentWindow?.postMessage({
        type: "SIMULATE_REQUEST",
        payload: { method, url: route }
      }, "*");
    }, 300);
  };
  const isReady = runTrigger > 0;
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "flex flex-col h-full w-full gap-2", children: [
    /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: `
        flex items-center gap-2 p-2 rounded-md border transition-colors
        ${themeMode === "dark" ? "bg-[#252526] border-white/10" : "bg-white border-gray-200"}
      `, children: [
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: `
            px-3 py-1.5 rounded text-xs font-bold tracking-wider
            ${themeMode === "dark" ? "bg-blue-900/50 text-blue-400" : "bg-blue-100 text-blue-700"}
         `, children: "GET" }),
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
        "input",
        {
          type: "text",
          value: route,
          onChange: (e) => setRoute(e.target.value),
          placeholder: "/api/users",
          className: `
                flex-1 bg-transparent border-none outline-none text-sm font-mono
                ${themeMode === "dark" ? "text-white placeholder-gray-600" : "text-gray-800 placeholder-gray-400"}
            `
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(
        Button,
        {
          onClick: sendRequest,
          disabled: !isReady || isLoading || !serverReady || !!runtimeError,
          className: "!py-1 !px-3 h-8 text-xs",
          children: [
            isLoading ? "Sending..." : "Send",
            !isLoading && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(import_lucide_react.Send, { className: "w-3 h-3 ml-1" })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
      PreviewContainer,
      {
        themeMode,
        isReady,
        overlayMessage: isBlurred ? "Make your Prediction" : void 0,
        children: /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "flex flex-col h-full relative", children: [
          isReady && !serverReady && !runtimeError && !isBlurred && /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "absolute top-2 right-2 z-10 flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-xs", children: [
            /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(import_lucide_react.Clock, { className: "w-3 h-3 animate-pulse" }),
            /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { children: "Starting Server..." })
          ] }),
          isReady && serverReady && !runtimeError && !isBlurred && /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "absolute top-2 right-2 z-10 flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-500 text-xs", children: [
            /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(import_lucide_react.Server, { className: "w-3 h-3" }),
            /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { children: "Listening on :3000" })
          ] }),
          isReady && runtimeError && !isBlurred && /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "absolute top-2 right-2 z-10 flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-xs", children: [
            /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(import_lucide_react.XCircle, { className: "w-3 h-3" }),
            /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { children: "Server Error" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: `flex-1 overflow-auto p-4 font-mono text-sm ${themeMode === "dark" ? "bg-[#1e1e1e]" : "bg-gray-50"}`, children: runtimeError ? /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "animate-in fade-in zoom-in-95 duration-300 p-4 border border-red-500/20 rounded bg-red-500/5", children: [
            /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "flex items-center gap-2 text-red-500 font-bold mb-2", children: [
              /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(import_lucide_react.AlertCircle, { className: "w-4 h-4" }),
              /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { children: "Runtime Error" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("pre", { className: "whitespace-pre-wrap break-all text-red-400 opacity-90", children: runtimeError }),
            /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("p", { className: "mt-4 text-xs text-gray-500", children: "Check the console log below for more details." })
          ] }) : response ? /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "animate-in fade-in slide-in-from-bottom-2 duration-300", children: [
            /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "flex items-center justify-between mb-4 pb-2 border-b border-dashed border-gray-500/20", children: [
              /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("span", { className: `font-bold ${response.status >= 200 && response.status < 300 ? "text-green-500" : "text-red-500"}`, children: [
                response.status,
                " ",
                response.status === 200 ? "OK" : "Error"
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("span", { className: "text-xs opacity-50", children: [
                (Math.random() * 40 + 10).toFixed(0),
                "ms"
              ] })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("pre", { className: `whitespace-pre-wrap break-all ${themeMode === "dark" ? "text-blue-300" : "text-blue-700"}`, children: JSON.stringify(response.data, null, 2) })
          ] }) : /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "h-full flex flex-col items-center justify-center opacity-20 select-none", children: [
            /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(import_lucide_react.Server, { className: "w-12 h-12 mb-2" }),
            /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("p", { children: runtimeError ? "Fix errors to restart server" : "No response data" })
          ] }) }),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "h-1/3 border-t border-gray-500/20 relative", children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
            "iframe",
            {
              ref: iframeRef,
              src: sandboxSrc,
              title: "Server Console",
              sandbox: SANDBOX_ATTRIBUTES,
              className: "w-full h-full border-none"
            }
          ) })
        ] })
      }
    )
  ] });
};

// components/HelpSidebar.tsx
var import_lucide_react2 = require("lucide-react");

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
var import_jsx_runtime6 = require("react/jsx-runtime");
var HelpSidebar = ({
  isOpen,
  onClose,
  themeMode,
  environmentMode
}) => {
  const docs = getDocsForMode(environmentMode);
  if (!isOpen) return null;
  return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(
    "aside",
    {
      className: `
        flex flex-col border-l w-full md:w-80 shrink-0 h-full overflow-hidden transition-colors duration-300
        ${themeMode === "dark" ? "bg-[#1e1e1e] border-white/10" : "bg-gray-50 border-gray-200"}
      `,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: `
        flex items-center justify-between px-4 h-12 shrink-0 border-b
        ${themeMode === "dark" ? "border-white/10 bg-[#252526]" : "border-gray-200 bg-white"}
      `, children: [
          /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(import_lucide_react2.BookOpen, { className: `w-4 h-4 ${themeMode === "dark" ? "text-blue-400" : "text-blue-600"}` }),
            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("h2", { className: "font-semibold text-sm", children: "Documentation" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(Button, { variant: "ghost", onClick: onClose, className: "!p-1 h-8 w-8", children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(import_lucide_react2.X, { className: "w-4 h-4" }) })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { className: "flex-1 overflow-y-auto p-4 space-y-6", children: docs ? docs.map((section, idx) => /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("h3", { className: `
                text-xs font-bold uppercase tracking-wider mb-3
                ${themeMode === "dark" ? "text-gray-500" : "text-gray-500"}
              `, children: section.title }),
          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { className: "space-y-3", children: section.items.map((item, i) => /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: `
                    p-3 rounded-md text-sm
                    ${themeMode === "dark" ? "bg-black/20 hover:bg-black/40" : "bg-white shadow-sm border border-gray-100"}
                  `, children: [
            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("code", { className: `
                      font-mono text-xs block mb-1
                      ${themeMode === "dark" ? "text-blue-300" : "text-blue-700"}
                    `, children: item.name }),
            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("p", { className: `
                      leading-relaxed text-xs opacity-90
                      ${themeMode === "dark" ? "text-gray-300" : "text-gray-600"}
                    `, children: item.desc }),
            item.example && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { className: `
                        mt-2 p-2 rounded text-xs font-mono overflow-x-auto whitespace-pre
                        ${themeMode === "dark" ? "bg-black/30 text-gray-400" : "bg-gray-50 text-gray-600"}
                      `, children: item.example })
          ] }, i)) })
        ] }, idx)) : /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { className: "text-center py-8 opacity-60 text-sm", children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("p", { children: "No documentation available for this mode." }) }) })
      ]
    }
  );
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
  predictionPrompt
}) => {
  const [isHelpOpen, setIsHelpOpen] = (0, import_react6.useState)(false);
  const [predictionAnswer, setPredictionAnswer] = (0, import_react6.useState)("");
  const [isPredictionLocked, setIsPredictionLocked] = (0, import_react6.useState)(false);
  const [layout, setLayout] = (0, import_react6.useState)("horizontal");
  const hasDocs = !!getDocsForMode(environmentMode);
  const hasPredictionTask = !!predictionPrompt;
  const isPredictionFulfilled = !hasPredictionTask || predictionAnswer.trim().length > 0;
  (0, import_react6.useEffect)(() => {
    setPredictionAnswer("");
    setIsPredictionLocked(false);
  }, [sessionId]);
  (0, import_react6.useEffect)(() => {
    if (!hasDocs) setIsHelpOpen(false);
  }, [environmentMode, hasDocs]);
  const handleRunClick = () => {
    if (hasPredictionTask) {
      setIsPredictionLocked(true);
    }
    onRun();
  };
  const toggleLayout = () => {
    setLayout((prev) => prev === "horizontal" ? "vertical" : "horizontal");
  };
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
    default:
      fileName = "script.js";
  }
  return /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("main", { className: "flex-1 overflow-hidden flex flex-col relative", children: [
    hasPredictionTask && /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: `
          shrink-0 border-b p-4 flex flex-col gap-3 transition-colors duration-300
          ${themeMode === "dark" ? "bg-[#252526] border-white/10" : "bg-blue-50/50 border-blue-100"}
        `, children: /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "flex items-start gap-3", children: [
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: `p-2 rounded-lg shrink-0 ${themeMode === "dark" ? "bg-purple-500/20 text-purple-400" : "bg-purple-100 text-purple-700"}`, children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_lucide_react3.Brain, { className: "w-5 h-5" }) }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "flex-1 space-y-2", children: [
        /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("h3", { className: `text-sm font-bold uppercase tracking-wide mb-1 ${themeMode === "dark" ? "text-purple-400" : "text-purple-700"}`, children: "Predict" }),
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("p", { className: `text-sm leading-relaxed ${themeMode === "dark" ? "text-gray-300" : "text-gray-800"}`, children: predictionPrompt })
          ] }),
          isPredictionLocked && /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: `flex items-center gap-1 text-xs font-medium px-2 py-1 rounded border ${themeMode === "dark" ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-green-100 text-green-700 border-green-200"}`, children: [
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_lucide_react3.Lock, { className: "w-3 h-3" }),
            "Locked"
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
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
    /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: `h-12 shrink-0 border-b flex items-center justify-between px-4 transition-colors duration-300 ${themeMode === "dark" ? "bg-[#1e1e1e] border-white/10" : "bg-white border-gray-200"}`, children: [
      /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: `flex items-center gap-2 transition-colors ${themeMode === "dark" ? "text-gray-400" : "text-gray-600"}`, children: [
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_lucide_react3.FileCode, { className: "w-4 h-4" }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { className: "text-sm font-mono opacity-80", children: fileName }),
        hasPredictionTask && /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { className: "ml-2 text-xs px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-500 border border-orange-500/20", children: "Read Only" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "hidden sm:flex items-center gap-1 bg-black/5 dark:bg-white/5 rounded-md p-0.5", children: [
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
            "button",
            {
              onClick: () => setLayout("horizontal"),
              className: `p-1.5 rounded ${layout === "horizontal" ? themeMode === "dark" ? "bg-gray-700 text-white shadow-sm" : "bg-white text-black shadow-sm" : "opacity-50 hover:opacity-100"}`,
              title: "Split Screen (Side by Side)",
              children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_lucide_react3.Columns, { className: "w-3.5 h-3.5" })
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
            "button",
            {
              onClick: () => setLayout("vertical"),
              className: `p-1.5 rounded ${layout === "vertical" ? themeMode === "dark" ? "bg-gray-700 text-white shadow-sm" : "bg-white text-black shadow-sm" : "opacity-50 hover:opacity-100"}`,
              title: "Vertical Split (Stacked)",
              children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_lucide_react3.Rows, { className: "w-3.5 h-3.5" })
            }
          )
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: `h-4 w-px mx-1 ${themeMode === "dark" ? "bg-white/10" : "bg-gray-200"}` }),
        hasDocs && /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(
          Button,
          {
            variant: "ghost",
            onClick: () => setIsHelpOpen(!isHelpOpen),
            className: `!px-2 ${isHelpOpen ? "bg-blue-500/10 text-blue-500" : ""}`,
            title: "Toggle Documentation",
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_lucide_react3.Book, { className: "w-4 h-4" }),
              /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { className: "hidden sm:inline text-xs ml-2", children: "Help" })
            ]
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
          Button,
          {
            onClick: handleRunClick,
            disabled: isRunning || !isPredictionFulfilled,
            className: `h-8 px-4 text-sm font-semibold shadow-sm transition-all duration-300 ${!isPredictionFulfilled ? "opacity-50 cursor-not-allowed grayscale" : ""}`,
            icon: isRunning ? /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_lucide_react3.CheckCircle2, { className: "w-3.5 h-3.5 animate-pulse" }) : /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_lucide_react3.Play, { className: "w-3.5 h-3.5 fill-current" }),
            children: isRunning ? "Running..." : "Run Code"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "flex-1 flex overflow-hidden", children: [
      /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: `flex-1 flex overflow-hidden min-w-0 ${layout === "horizontal" ? "flex-col md:flex-row" : "flex-col"}`, children: [
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("section", { className: `
             flex-1 flex flex-col relative group transition-colors duration-300 min-w-0
             ${layout === "horizontal" ? "min-h-[40%] md:min-h-0 border-b md:border-b-0 md:border-r" : "min-h-[40%] border-b"}
             ${themeMode === "dark" ? "border-gray-800" : "border-gray-200"}
          `, children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
          CodeEditor,
          {
            code,
            onChange: (val) => onChange(val || ""),
            themeMode,
            environmentMode,
            sessionId,
            readOnly: hasPredictionTask
          }
        ) }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("section", { className: `flex-1 flex flex-col min-h-[40%] md:min-h-0 relative transition-colors duration-300 min-w-0 ${themeMode === "dark" ? "bg-gray-800" : "bg-gray-100"}`, children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "flex-1 p-2 md:p-4 h-full overflow-hidden", children: environmentMode === "express" ? /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
          ServerOutput,
          {
            runTrigger,
            code,
            themeMode,
            environmentMode,
            isBlurred: !isPredictionFulfilled
          }
        ) : /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
          OutputFrame,
          {
            runTrigger,
            code,
            themeMode,
            environmentMode,
            isBlurred: !isPredictionFulfilled,
            isPredictionMode: hasPredictionTask
          }
        ) }) })
      ] }),
      hasDocs && isHelpOpen && /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
        HelpSidebar,
        {
          isOpen: isHelpOpen,
          onClose: () => setIsHelpOpen(false),
          themeMode,
          environmentMode
        }
      )
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
  prediction_prompt
}) => {
  const [runTrigger, setRunTrigger] = (0, import_react7.useState)(0);
  const [isRunning, setIsRunning] = (0, import_react7.useState)(false);
  (0, import_react7.useEffect)(() => {
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
  const themeStyles = (0, import_react7.useMemo)(() => {
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
          predictionPrompt: prediction_prompt
        },
        sessionId
      )
    }
  );
};

// hooks/useSandboxState.ts
var import_react8 = require("react");

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
var TYPESCRIPT_STARTER_CODE = `// Welcome to TypeScript!
// The browser will transpile this code before running it.

interface User {
  id: number;
  name: string;
  role: 'admin' | 'user';
}

const currentUser: User = {
  id: 42,
  name: "Sandbox Developer",
  role: "admin"
};

// 'root' is available in the global scope
const displayUser = (user: User) => {
  const card = document.createElement('div');
  Object.assign(card.style, {
    padding: '20px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    fontFamily: 'monospace'
  });

  card.innerHTML = \`
    <h3>\${user.name}</h3>
    <p>ID: \${user.id}</p>
    <p>Role: <span style="color: blue">\${user.role}</span></p>
  \`;
  
  root.appendChild(card);
};

displayUser(currentUser);
console.log("TypeScript execution complete");
`;
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
var EXPRESS_STARTER_CODE = `// Welcome to the Express.js Simulator!
// We've mocked 'express' so you can write server-side code in the browser.

const app = express();
const port = 3000;

// Database simulation
const users = [
  { id: 1, name: 'Alice', role: 'engineer' },
  { id: 2, name: 'Bob', role: 'designer' }
];

// Define your routes below
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the mock API!' });
});

app.get('/users', (req, res) => {
  res.json(users);
});

app.get('/users/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const user = users.find(u => u.id === id);
  
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(\`Mock server listening on port \${port}\`);
});
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
    default:
      return STARTER_CODE;
  }
};
var useSandboxState = (persistenceKey) => {
  const STORAGE_PREFIX = persistenceKey ? `cs_${persistenceKey}` : "";
  const getStorageKey = (0, import_react8.useCallback)((key) => `${STORAGE_PREFIX}_${key}`, [STORAGE_PREFIX]);
  const loadSavedMode = () => {
    if (!persistenceKey || typeof window === "undefined") return "dom";
    try {
      const saved = localStorage.getItem(getStorageKey("env_mode"));
      return saved || "dom";
    } catch {
      return "dom";
    }
  };
  const loadSavedThemeMode = () => {
    if (!persistenceKey || typeof window === "undefined") return "dark";
    try {
      const saved = localStorage.getItem(getStorageKey("theme_mode"));
      return saved || "dark";
    } catch {
      return "dark";
    }
  };
  const loadSavedThemeName = () => {
    if (!persistenceKey || typeof window === "undefined") return themes[0].name;
    try {
      return localStorage.getItem(getStorageKey("theme_name")) || themes[0].name;
    } catch {
      return themes[0].name;
    }
  };
  const loadSavedCode = (mode) => {
    if (!persistenceKey || typeof window === "undefined") return getStarterCode(mode);
    try {
      const key = getStorageKey(`code_${mode}`);
      const saved = localStorage.getItem(key);
      return saved !== null ? saved : getStarterCode(mode);
    } catch {
      return getStarterCode(mode);
    }
  };
  const [environmentMode, setEnvironmentMode] = (0, import_react8.useState)(loadSavedMode);
  const [themeMode, setThemeMode] = (0, import_react8.useState)(loadSavedThemeMode);
  const [activeThemeName, setActiveThemeName] = (0, import_react8.useState)(loadSavedThemeName);
  const [code, setCode] = (0, import_react8.useState)(() => {
    return loadSavedCode(environmentMode);
  });
  const [sessionId, setSessionId] = (0, import_react8.useState)(0);
  (0, import_react8.useEffect)(() => {
    if (!persistenceKey) return;
    localStorage.setItem(getStorageKey("env_mode"), environmentMode);
  }, [environmentMode, persistenceKey, getStorageKey]);
  (0, import_react8.useEffect)(() => {
    if (!persistenceKey) return;
    const key = getStorageKey(`code_${environmentMode}`);
    localStorage.setItem(key, code);
  }, [code, environmentMode, persistenceKey, getStorageKey]);
  (0, import_react8.useEffect)(() => {
    if (!persistenceKey) return;
    localStorage.setItem(getStorageKey("theme_mode"), themeMode);
  }, [themeMode, persistenceKey, getStorageKey]);
  (0, import_react8.useEffect)(() => {
    if (!persistenceKey) return;
    localStorage.setItem(getStorageKey("theme_name"), activeThemeName);
  }, [activeThemeName, persistenceKey, getStorageKey]);
  const switchMode = (0, import_react8.useCallback)((newMode) => {
    if (newMode === environmentMode) return;
    const savedCode = loadSavedCode(newMode);
    setEnvironmentMode(newMode);
    setCode(savedCode);
    setSessionId((prev) => prev + 1);
  }, [environmentMode, persistenceKey, getStorageKey]);
  const resetCode = (0, import_react8.useCallback)(() => {
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
var import_react9 = require("react");
var useAutoKey = (identifier, initialCode = "", prefix = "auto") => {
  const key = (0, import_react9.useMemo)(() => {
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
  themes,
  useAutoKey,
  useSandboxState
});
