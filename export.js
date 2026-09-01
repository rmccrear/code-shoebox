// components/CodeShoebox.tsx
import { useState as useState5, useMemo as useMemo4, useEffect as useEffect4, useRef as useRef4 } from "react";

// components/CodingEnvironment.tsx
import React5, { useState as useState4, useEffect as useEffect3, useRef as useRef3, useCallback as useCallback3, useMemo as useMemo3 } from "react";
import {
  Play,
  CheckCircle2,
  FileCode,
  Lock as Lock2,
  Columns,
  Rows,
  GripVertical,
  GripHorizontal as GripHorizontal3
} from "lucide-react";

// components/ReadOnlyCodeViewer.tsx
import { jsx } from "react/jsx-runtime";
var ReadOnlyCodeViewer = ({
  code,
  filename,
  language,
  themeMode
}) => /* @__PURE__ */ jsx(
  "pre",
  {
    "aria-label": `Read-only code: ${filename}`,
    className: `m-0 h-full w-full overflow-auto select-text p-4 font-mono text-sm leading-6 whitespace-pre ${themeMode === "dark" ? "bg-[#1e1e1e] text-gray-100" : "bg-white text-gray-900"}`,
    "data-filename": filename,
    "data-language": language,
    tabIndex: 0,
    children: /* @__PURE__ */ jsx("code", { children: code })
  }
);

// components/MediaPanel.tsx
import { useId, useState } from "react";
import { Lock } from "lucide-react";
import { jsx as jsx2, jsxs } from "react/jsx-runtime";
var escapeHtmlAttribute = (value) => value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/'/g, "&#39;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\r/g, "&#13;").replace(/\n/g, "&#10;");
var escapeCssString = (value) => value.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\r\n|\r|\n/g, "\\a ");
var getSnippets = (asset) => {
  switch (asset.kind) {
    case "image":
      return [
        { language: "HTML", code: `<img src="${escapeHtmlAttribute(asset.src)}" alt="${escapeHtmlAttribute(asset.alt)}">` },
        { language: "CSS", code: `.media-image { background-image: url("${escapeCssString(asset.src)}"); }` }
      ];
    case "audio":
      return [
        { language: "HTML", code: `<audio controls src="${escapeHtmlAttribute(asset.src)}"></audio>` },
        { language: "JavaScript", code: `const audio = new Audio(${JSON.stringify(asset.src)});
void audio.play();` }
      ];
    case "video":
      return [
        { language: "HTML", code: `<video id="media-video" controls src="${escapeHtmlAttribute(asset.src)}"></video>` },
        { language: "JavaScript", code: "const video = document.querySelector('#media-video');\nvoid video?.play();" }
      ];
  }
};
var SnippetBlock = ({ language, code }) => /* @__PURE__ */ jsxs("div", { children: [
  /* @__PURE__ */ jsx2("h3", { className: "mb-1 text-xs font-bold uppercase tracking-wide", children: language }),
  /* @__PURE__ */ jsx2("pre", { className: "overflow-x-auto rounded bg-black/20 p-3 text-xs", children: /* @__PURE__ */ jsx2("code", { children: code }) })
] });
var getAssetKey = (asset, index) => `${index}:${asset.kind}:${asset.name}:${asset.src}`;
var MediaPanel = ({ mediaAssets, themeMode }) => {
  const panelId = useId();
  const visibleAssets = mediaAssets.slice(0, 3);
  const [selectedAssetKey, setSelectedAssetKey] = useState(null);
  const [failedAssetKey, setFailedAssetKey] = useState(null);
  const selectedIndex = visibleAssets.findIndex((item, index) => getAssetKey(item, index) === selectedAssetKey);
  const effectiveSelectedIndex = selectedIndex >= 0 ? selectedIndex : 0;
  const asset = visibleAssets[effectiveSelectedIndex];
  if (!asset) {
    return /* @__PURE__ */ jsx2("section", { className: `flex h-full items-center justify-center p-6 ${themeMode === "dark" ? "bg-[#1e1e1e] text-gray-300" : "bg-white text-gray-600"}`, children: /* @__PURE__ */ jsx2("p", { className: "rounded-lg border border-dashed border-current/25 px-5 py-4 text-center text-sm", children: "No media assets supplied." }) });
  }
  const snippets = getSnippets(asset);
  const activeAssetKey = getAssetKey(asset, effectiveSelectedIndex);
  return /* @__PURE__ */ jsxs("section", { className: `h-full overflow-auto p-4 ${themeMode === "dark" ? "bg-[#1e1e1e] text-gray-100" : "bg-white text-gray-900"}`, children: [
    /* @__PURE__ */ jsx2("div", { role: "tablist", "aria-label": "Media assets", className: "mb-4 flex gap-1 overflow-x-auto", children: visibleAssets.map((item, index) => /* @__PURE__ */ jsxs(
      "button",
      {
        id: `${panelId}-tab-${index}`,
        type: "button",
        role: "tab",
        "aria-selected": index === effectiveSelectedIndex,
        "aria-controls": `${panelId}-panel`,
        onClick: () => {
          setSelectedAssetKey(getAssetKey(item, index));
          setFailedAssetKey(null);
        },
        className: `shrink-0 rounded px-3 py-1.5 text-sm font-medium transition-colors ${index === effectiveSelectedIndex ? themeMode === "dark" ? "bg-white/10 text-blue-300" : "bg-blue-50 text-blue-700" : "opacity-60 hover:opacity-90"}`,
        children: [
          item.name,
          /* @__PURE__ */ jsx2(Lock, { "aria-hidden": "true", className: "ml-1 inline h-3 w-3" })
        ]
      },
      `${index}-${item.name}`
    )) }),
    mediaAssets.length > visibleAssets.length && /* @__PURE__ */ jsx2("p", { className: "mb-4 text-xs opacity-70", children: "Only the first 3 assets are shown." }),
    /* @__PURE__ */ jsxs(
      "div",
      {
        id: `${panelId}-panel`,
        role: "tabpanel",
        "aria-labelledby": `${panelId}-tab-${effectiveSelectedIndex}`,
        children: [
          /* @__PURE__ */ jsxs("div", { className: `flex min-h-40 items-center justify-center rounded-lg border p-3 ${themeMode === "dark" ? "border-white/10 bg-black/20" : "border-gray-200 bg-gray-50"}`, children: [
            asset.kind === "image" && /* @__PURE__ */ jsx2("img", { src: asset.src, alt: asset.alt, onError: () => setFailedAssetKey(activeAssetKey), className: "max-h-64 max-w-full rounded object-contain" }),
            asset.kind === "audio" && /* @__PURE__ */ jsx2("audio", { src: asset.src, controls: true, preload: "metadata", "aria-label": `Audio preview: ${asset.name}`, onError: () => setFailedAssetKey(activeAssetKey), className: "w-full" }),
            asset.kind === "video" && /* @__PURE__ */ jsx2("video", { src: asset.src, controls: true, preload: "metadata", "aria-label": `Video preview: ${asset.name}`, onError: () => setFailedAssetKey(activeAssetKey), className: "max-h-64 max-w-full rounded" })
          ] }),
          failedAssetKey === activeAssetKey && /* @__PURE__ */ jsxs("p", { role: "alert", className: "mt-3 text-sm text-red-500", children: [
            "Could not load ",
            asset.name,
            "."
          ] }),
          /* @__PURE__ */ jsx2("div", { className: "mt-5 space-y-4", children: snippets.map((snippet) => /* @__PURE__ */ jsx2(SnippetBlock, { ...snippet }, snippet.language)) })
        ]
      }
    )
  ] });
};

// components/ApiServerPanel.tsx
import { CloudOff } from "lucide-react";
import { jsx as jsx3, jsxs as jsxs2 } from "react/jsx-runtime";
var getRouteLabel = (route) => {
  if (!route.query) return route.path;
  const query = new URLSearchParams(Object.entries(route.query)).toString();
  return query ? `${route.path}?${query}` : route.path;
};
var ApiServerPanel = ({ mockApi, themeMode }) => {
  const routes = mockApi?.routes ?? [];
  const defaultDelayMs = mockApi?.defaultDelayMs ?? 1e3;
  const dark = themeMode === "dark";
  return /* @__PURE__ */ jsxs2(
    "section",
    {
      "aria-label": "Mock API server",
      className: `h-full overflow-auto p-4 ${dark ? "bg-[#181818] text-gray-200" : "bg-slate-50 text-slate-800"}`,
      children: [
        /* @__PURE__ */ jsxs2("div", { className: `mb-4 rounded-lg border p-3 ${dark ? "border-blue-400/30 bg-blue-400/10" : "border-blue-200 bg-blue-50"}`, children: [
          /* @__PURE__ */ jsxs2("div", { className: "flex items-center gap-2 text-sm font-semibold", children: [
            /* @__PURE__ */ jsx3(CloudOff, { "aria-hidden": "true", size: 16 }),
            /* @__PURE__ */ jsx3("span", { children: "Mock API \u2014 no network request" })
          ] }),
          /* @__PURE__ */ jsx3("p", { className: "mt-1 text-xs opacity-70", children: "Use these relative routes with fetch(). Responses are simulated inside the sandbox." })
        ] }),
        routes.length === 0 ? /* @__PURE__ */ jsx3("p", { className: "text-sm opacity-60", children: "No mock API routes are configured for this activity." }) : /* @__PURE__ */ jsx3("div", { className: "space-y-3", children: routes.map((route, index) => {
          const delayMs = route.delayMs ?? defaultDelayMs;
          const status = route.networkError ? "Network error" : route.status ?? 200;
          return /* @__PURE__ */ jsxs2(
            "article",
            {
              className: `rounded-lg border p-3 ${dark ? "border-white/10 bg-white/[0.03]" : "border-slate-200 bg-white"}`,
              children: [
                /* @__PURE__ */ jsxs2("div", { className: "flex flex-wrap items-center gap-2", children: [
                  /* @__PURE__ */ jsx3("span", { className: "rounded bg-emerald-500/15 px-2 py-0.5 font-mono text-xs font-bold text-emerald-500", children: route.method }),
                  /* @__PURE__ */ jsx3("code", { className: "break-all text-sm font-semibold", children: getRouteLabel(route) })
                ] }),
                /* @__PURE__ */ jsxs2("dl", { className: "mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs opacity-70", children: [
                  /* @__PURE__ */ jsxs2("div", { children: [
                    /* @__PURE__ */ jsx3("dt", { className: "inline font-semibold", children: "Status: " }),
                    /* @__PURE__ */ jsx3("dd", { className: "inline", children: status })
                  ] }),
                  /* @__PURE__ */ jsxs2("div", { children: [
                    /* @__PURE__ */ jsx3("dt", { className: "inline font-semibold", children: "Delay: " }),
                    /* @__PURE__ */ jsxs2("dd", { className: "inline", children: [
                      delayMs,
                      " ms"
                    ] })
                  ] })
                ] }),
                route.requestHeaders !== void 0 && /* @__PURE__ */ jsxs2("div", { className: "mt-3", children: [
                  /* @__PURE__ */ jsx3("p", { className: "mb-1 text-xs font-semibold opacity-70", children: "Required request headers" }),
                  /* @__PURE__ */ jsx3("pre", { className: `overflow-auto rounded p-3 text-xs ${dark ? "bg-black/30" : "bg-slate-100"}`, children: JSON.stringify(route.requestHeaders, null, 2) })
                ] }),
                route.requestBody !== void 0 && /* @__PURE__ */ jsxs2("div", { className: "mt-3", children: [
                  /* @__PURE__ */ jsx3("p", { className: "mb-1 text-xs font-semibold opacity-70", children: "Required JSON request body" }),
                  /* @__PURE__ */ jsx3("pre", { className: `overflow-auto rounded p-3 text-xs ${dark ? "bg-black/30" : "bg-slate-100"}`, children: JSON.stringify(route.requestBody, null, 2) })
                ] }),
                route.networkError ? /* @__PURE__ */ jsx3("p", { className: "mt-3 font-mono text-xs text-red-400", children: route.errorMessage ?? "Simulated network error" }) : /* @__PURE__ */ jsxs2("div", { className: "mt-3", children: [
                  /* @__PURE__ */ jsx3("p", { className: "mb-1 text-xs font-semibold opacity-70", children: "Response JSON" }),
                  /* @__PURE__ */ jsx3("pre", { className: `overflow-auto rounded p-3 text-xs ${dark ? "bg-black/30" : "bg-slate-100"}`, children: JSON.stringify(route.body, null, 2) })
                ] })
              ]
            },
            `${route.method}-${getRouteLabel(route)}-${index}`
          );
        }) })
      ]
    }
  );
};

// components/OutputFrame.tsx
import { useEffect, useRef, useState as useState2, useCallback, useMemo } from "react";

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
        const { type, code, mode, payload, executionId } = event.data;
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
            let execution;
            try {
                execution = window.__RUN_MODE__(code, root, payload || {});
            } catch (error) {
                console.error(error);
                sendPayload('EXECUTION_COMPLETE', { executionId });
                return;
            }
            Promise.resolve(execution)
                .catch((error) => console.error(error))
                .then(() => sendPayload('EXECUTION_COMPLETE', { executionId }));
        }
    });
`;
var BASE_HTML_WRAPPER = (recipe) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    ${recipe.contentSecurityPolicy ? `<meta http-equiv="Content-Security-Policy" content="${recipe.contentSecurityPolicy}">` : ""}
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

// runtime/templates/fetch.ts
var FETCH_MOCK_SETUP = `
    (() => {
        const DEFAULT_DELAY_MS = 1000;
        const ABSOLUTE_URL = /^[a-zA-Z][a-zA-Z\\d+.-]*:/;

        const safeDelay = (value, fallback) => {
            const number = Number(value);
            return Number.isFinite(number) && number >= 0 ? number : fallback;
        };

        const abortError = () => {
            try { return new DOMException('The operation was aborted.', 'AbortError'); }
            catch (e) {
                const error = new Error('The operation was aborted.');
                error.name = 'AbortError';
                return error;
            }
        };

        const delay = (milliseconds, signals) => new Promise((resolve, reject) => {
            let timer;
            const activeSignals = signals.filter(Boolean);
            const cleanup = () => activeSignals.forEach((signal) => signal.removeEventListener('abort', onAbort));
            const onAbort = () => {
                clearTimeout(timer);
                cleanup();
                reject(abortError());
            };

            if (activeSignals.some((signal) => signal.aborted)) {
                onAbort();
                return;
            }

            activeSignals.forEach((signal) => signal.addEventListener('abort', onAbort, { once: true }));
            timer = setTimeout(() => {
                cleanup();
                resolve();
            }, milliseconds);
        });

        const queryMatches = (searchParams, expected) => {
            const expectedEntries = Object.entries(expected || {});
            const actualEntries = Array.from(searchParams.entries());
            if (actualEntries.length !== expectedEntries.length) return false;
            return expectedEntries.every(([key, value]) => (
                searchParams.getAll(key).length === 1 && searchParams.get(key) === String(value)
            ));
        };

        const jsonEquals = (actual, expected) => {
            if (actual === expected) return true;
            if (Array.isArray(actual) || Array.isArray(expected)) {
                return Array.isArray(actual)
                    && Array.isArray(expected)
                    && actual.length === expected.length
                    && actual.every((value, index) => jsonEquals(value, expected[index]));
            }
            if (!actual || !expected || typeof actual !== 'object' || typeof expected !== 'object') {
                return false;
            }
            const actualKeys = Object.keys(actual);
            const expectedKeys = Object.keys(expected);
            return actualKeys.length === expectedKeys.length
                && expectedKeys.every((key) => (
                    Object.prototype.hasOwnProperty.call(actual, key)
                    && jsonEquals(actual[key], expected[key])
                ));
        };

        const headersMatch = (headers, expected) => {
            const expectedHeaders = new Headers(expected || {});
            return Array.from(expectedHeaders.entries()).every(([name, value]) => headers.get(name) === value);
        };

        const routeSpecificity = (route) => {
            const queryScore = route.query === undefined ? 0 : Math.max(1, Object.keys(route.query || {}).length);
            const headerScore = route.requestHeaders === undefined
                ? 0
                : Math.max(1, Object.keys(route.requestHeaders || {}).length);
            const bodyScore = route.requestBody === undefined ? 0 : 1;
            return queryScore + headerScore + bodyScore;
        };

        const parseInput = (input, init) => {
            const isRequest = typeof Request !== 'undefined' && input instanceof Request;
            const isUrl = typeof URL !== 'undefined' && input instanceof URL;
            const rawUrl = isRequest ? input.url : isUrl ? input.href : String(input);
            const baseUrl = new URL(document.baseURI);

            let url;
            if (isRequest || isUrl) {
                url = new URL(rawUrl);
                if (url.origin !== baseUrl.origin) {
                    throw new TypeError('Network access is disabled in Fetch tutorial mode. Use a relative /api/... route.');
                }
            } else {
                if (ABSOLUTE_URL.test(rawUrl) || rawUrl.startsWith('//')) {
                    throw new TypeError('Network access is disabled in Fetch tutorial mode. Use a relative /api/... route.');
                }
                url = new URL(rawUrl, baseUrl);
            }

            const hasInitHeaders = init && init.headers !== undefined;
            const headers = new Headers(hasInitHeaders ? init.headers : isRequest ? input.headers : undefined);
            const hasInitBody = !!init && Object.prototype.hasOwnProperty.call(init, 'body');
            let bodyPromise;
            const readJsonBody = () => {
                if (bodyPromise) return bodyPromise;
                bodyPromise = (async () => {
                    let text;
                    if (hasInitBody) {
                        if (init.body === undefined || init.body === null) return { hasJson: false };
                        text = await new Response(init.body).text();
                    } else if (isRequest) {
                        text = await input.clone().text();
                    } else {
                        return { hasJson: false };
                    }
                    if (!text) return { hasJson: false };
                    try { return { hasJson: true, value: JSON.parse(text) }; }
                    catch (e) { return { hasJson: false }; }
                })();
                return bodyPromise;
            };

            return {
                url,
                method: String((init && init.method) || (isRequest && input.method) || 'GET').toUpperCase(),
                signal: (init && init.signal) || (isRequest && input.signal) || null,
                headers,
                readJsonBody
            };
        };

        const jsonResponse = (route, fallbackBody) => {
            const status = route.status === undefined ? 200 : Number(route.status);
            const headers = new Headers(route.headers || {});
            if (!headers.has('content-type')) headers.set('content-type', 'application/json');
            const body = status === 204 || status === 205 || status === 304
                ? null
                : JSON.stringify(route.body === undefined ? fallbackBody : route.body);
            return new Response(body, { status, headers });
        };

        window.__installFetchMock = (rawConfig, runSignal) => {
            const config = rawConfig && typeof rawConfig === 'object' ? rawConfig : {};
            const routes = Array.isArray(config.routes) ? config.routes : [];
            const defaultDelayMs = safeDelay(config.defaultDelayMs, DEFAULT_DELAY_MS);

            window.fetch = async (input, init) => {
                const request = parseInput(input, init);
                const candidates = routes.filter((route) => (
                    route
                    && String(route.method || 'GET').toUpperCase() === request.method
                    && route.path === request.url.pathname
                ));
                const requestBody = candidates.some((candidate) => candidate.requestBody !== undefined)
                    ? await request.readJsonBody()
                    : { hasJson: false };
                const route = candidates
                    .map((candidate, index) => ({ candidate, index }))
                    .filter(({ candidate }) => (
                        (candidate.query === undefined || queryMatches(request.url.searchParams, candidate.query))
                        && (candidate.requestHeaders === undefined || headersMatch(request.headers, candidate.requestHeaders))
                        && (candidate.requestBody === undefined || (
                            requestBody.hasJson && jsonEquals(requestBody.value, candidate.requestBody)
                        ))
                    ))
                    .sort((left, right) => (
                        routeSpecificity(right.candidate) - routeSpecificity(left.candidate)
                        || left.index - right.index
                    ))[0]?.candidate;

                if (!route) {
                    await delay(defaultDelayMs, [runSignal, request.signal]);
                    return jsonResponse(
                        { status: 404, body: { error: 'No mock route for ' + request.method + ' ' + request.url.pathname } },
                        null
                    );
                }

                await delay(safeDelay(route.delayMs, defaultDelayMs), [runSignal, request.signal]);
                if (route.networkError === true) {
                    throw new TypeError(route.errorMessage || 'Simulated network error');
                }
                return jsonResponse(route, null);
            };
        };
    })();
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
var HTML_JS_RUNTIME_LOGIC = `
  let activeHtmlJsRunController = null;
  let htmlJsRunGeneration = 0;
  const HtmlJsAsyncFunction = Object.getPrototypeOf(async function () {}).constructor;

  window.__RUN_MODE__ = (code, root, options = {}) => {
    const usesMockFetch = typeof window.__installFetchMock === 'function';
    let generation = htmlJsRunGeneration;
    let runRoot = root;

    if (usesMockFetch) {
      generation = ++htmlJsRunGeneration;
      if (activeHtmlJsRunController) activeHtmlJsRunController.abort();
      activeHtmlJsRunController = new AbortController();
      runRoot = document.createElement('div');
      runRoot.style.width = '100%';
      root.replaceChildren(runRoot);
      window.__installFetchMock(options.mockApi, activeHtmlJsRunController.signal);
    } else {
      root.replaceChildren();
    }

    // Inline copy of the bounded bundle parser from runtime/fileBundle.ts.
    // The iframe kernel cannot import modules; keep both copies in sync.
    let files;
    try {
      const parsed = JSON.parse(code);
      files = (parsed && parsed.__csFiles__ === 1 && parsed.files)
        ? { html: String(parsed.files['index.html'] ?? ''), js: String(parsed.files['script.js'] ?? '') }
        : { html: code, js: '' };
    } catch (e) { files = { html: code, js: '' }; }

    const doc = new DOMParser().parseFromString(files.html, 'text/html');
    const linkedScript = doc.querySelector('script[src="script.js"]');

    // Learner HTML never creates a second execution path. The bundled
    // script.js file is the only JavaScript this mode executes.
    doc.querySelectorAll('script').forEach((script) => script.remove());

    if (!linkedScript && files.js.trim()) {
      const hint = document.createElement('div');
      hint.className = 'cs-hint-banner';
      hint.textContent = 'script.js is not linked \\u2014 add <script src="script.js"><\\/script> before </body>.';
      runRoot.appendChild(hint);
    }

    doc.body.childNodes.forEach((node) => {
      runRoot.appendChild(document.importNode(node, true));
    });

    if (!linkedScript) return;
    if (!usesMockFetch) {
      try { new Function('root', files.js)(runRoot); } catch (error) { console.error(error); }
      return;
    }

    return new HtmlJsAsyncFunction('root', files.js)(runRoot).catch((error) => {
      if (generation !== htmlJsRunGeneration || (error && error.name === 'AbortError')) return;
      throw error;
    });
  };
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
  "html-js": {
    name: "HTML & JavaScript (script.js)",
    showPlaceholder: false,
    styles: HTML_RUNTIME_STYLES,
    logic: HTML_JS_RUNTIME_LOGIC
  },
  "html-js-fetch": {
    name: "HTML, JavaScript & Fetch (Mock API)",
    mocks: FETCH_MOCK_SETUP,
    showPlaceholder: false,
    styles: HTML_RUNTIME_STYLES,
    contentSecurityPolicy: "connect-src 'none'",
    logic: HTML_JS_RUNTIME_LOGIC
  },
  "html-css-js": {
    name: "HTML, CSS & JavaScript (3 files)",
    showPlaceholder: false,
    styles: HTML_RUNTIME_STYLES,
    logic: `
      window.__RUN_MODE__ = (code, root) => {
        root.replaceChildren();
        document.querySelectorAll('style[data-code-shoebox-html-css-js]').forEach((style) => style.remove());

        // Inline copy of the bounded bundle parser from runtime/fileBundle.ts.
        // The iframe kernel cannot import modules; keep both copies in sync.
        let files;
        try {
          const parsed = JSON.parse(code);
          files = (parsed && parsed.__csFiles__ === 1 && parsed.files)
            ? {
                html: String(parsed.files['index.html'] ?? ''),
                css: String(parsed.files['style.css'] ?? ''),
                js: String(parsed.files['script.js'] ?? '')
              }
            : { html: code, css: '', js: '' };
        } catch (e) { files = { html: code, css: '', js: '' }; }

        const doc = new DOMParser().parseFromString(files.html, 'text/html');
        const linkedStyles = doc.querySelector('link[rel="stylesheet"][href="style.css"]');
        const linkedScript = doc.querySelector('script[src="script.js"]');

        // The bundled files are the only CSS/JS resource paths in this mode.
        // Detect their markers first, then remove every parsed resource node.
        doc.querySelectorAll('script').forEach((script) => script.remove());
        doc.querySelectorAll('link[rel~="stylesheet"]').forEach((link) => link.remove());

        if (linkedStyles) {
          const style = document.createElement('style');
          style.setAttribute('data-code-shoebox-html-css-js', '');
          style.textContent = files.css;
          document.head.appendChild(style);
        } else if (files.css.trim()) {
          const hint = document.createElement('div');
          hint.className = 'cs-hint-banner';
          hint.textContent = 'style.css is not linked \\u2014 add <link rel="stylesheet" href="style.css"> inside <head>.';
          root.appendChild(hint);
        }

        if (!linkedScript && files.js.trim()) {
          const hint = document.createElement('div');
          hint.className = 'cs-hint-banner';
          hint.textContent = 'script.js is not linked \\u2014 add <script src="script.js"><\\/script> before </body>.';
          root.appendChild(hint);
        }

        doc.body.childNodes.forEach((node) => {
          root.appendChild(document.importNode(node, true));
        });

        if (!linkedScript) return;
        try { new Function('root', files.js)(root); } catch (e) { console.error(e); }
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
  fetch: {
    name: "Fetch API",
    mocks: FETCH_MOCK_SETUP,
    showPlaceholder: false,
    contentSecurityPolicy: "connect-src 'none'",
    logic: `
      let activeRunController = null;
      let runGeneration = 0;
      const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;

      window.__RUN_MODE__ = async (code, root, options = {}) => {
        const generation = ++runGeneration;
        if (activeRunController) activeRunController.abort();
        activeRunController = new AbortController();

        const runRoot = document.createElement('div');
        runRoot.style.width = '100%';
        root.replaceChildren(runRoot);
        window.__installFetchMock(options.mockApi, activeRunController.signal);

        try {
          await new AsyncFunction('root', code)(runRoot);
        } catch (error) {
          if (generation !== runGeneration || (error && error.name === 'AbortError')) return;
          throw error;
        }
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
ENV_RECIPES["html-js-css-media"] = {
  ...ENV_RECIPES["html-css-js"],
  name: "HTML, CSS, JavaScript & Media (4 tabs)"
};
var getSandboxHtml = (mode = "dom", isPredictionMode = false) => {
  const recipe = ENV_RECIPES[mode] || ENV_RECIPES.dom;
  return BASE_HTML_WRAPPER({
    cdns: recipe.cdns,
    mocks: recipe.mocks,
    styles: recipe.styles,
    logic: recipe.logic || "",
    showPlaceholder: isPredictionMode ? false : recipe.showPlaceholder,
    contentSecurityPolicy: recipe.contentSecurityPolicy
  });
};
var executeCodeInSandbox = (iframeContentWindow, code, options, executionId) => {
  const message = {
    type: "EXECUTE",
    code,
    ...options === void 0 ? {} : { payload: options },
    ...executionId === void 0 ? {} : { executionId }
  };
  iframeContentWindow.postMessage(message, "*");
};

// components/PreviewContainer.tsx
import { jsx as jsx4, jsxs as jsxs3 } from "react/jsx-runtime";
var PreviewContainer = ({
  themeMode,
  isReady,
  children,
  overlayMessage
}) => {
  return /* @__PURE__ */ jsxs3("div", { className: `w-full h-full rounded-md overflow-hidden shadow-inner relative border transition-colors duration-300 ${themeMode === "dark" ? "bg-[#1a1a1a] border-gray-700" : "bg-white border-gray-200"}`, children: [
    children,
    !isReady && /* @__PURE__ */ jsx4("div", { className: "absolute inset-0 flex items-center justify-center pointer-events-none bg-black/5", children: /* @__PURE__ */ jsx4("p", { className: "text-gray-400 font-medium", children: overlayMessage || "Click 'Run Code' to execute" }) })
  ] });
};

// components/Console.tsx
import React2 from "react";
import { Terminal, Ban } from "lucide-react";

// components/Button.tsx
import { jsx as jsx5, jsxs as jsxs4 } from "react/jsx-runtime";
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
  return /* @__PURE__ */ jsxs4(
    "button",
    {
      className: `${baseStyles} ${variants[variant]} ${className}`,
      ...props,
      children: [
        icon && /* @__PURE__ */ jsx5("span", { className: "w-4 h-4", children: icon }),
        children
      ]
    }
  );
};

// components/Console.tsx
import { jsx as jsx6, jsxs as jsxs5 } from "react/jsx-runtime";
var Console = React2.memo(function Console2({
  logs,
  onClear,
  themeMode,
  className = ""
}) {
  return /* @__PURE__ */ jsxs5("div", { className: `flex flex-col h-full w-full overflow-hidden ${className} ${themeMode === "dark" ? "bg-[#1e1e1e]" : "bg-gray-50"}`, children: [
    /* @__PURE__ */ jsxs5("div", { className: `flex items-center justify-between px-3 py-1 shrink-0 border-b ${themeMode === "dark" ? "border-white/10 bg-[#252526]" : "border-gray-200 bg-gray-100"}`, children: [
      /* @__PURE__ */ jsxs5("div", { className: "flex items-center gap-2 text-xs font-semibold opacity-70", children: [
        /* @__PURE__ */ jsx6(Terminal, { className: "w-3 h-3" }),
        /* @__PURE__ */ jsxs5("span", { children: [
          "Console (",
          logs.length,
          ")"
        ] })
      ] }),
      /* @__PURE__ */ jsx6(Button, { variant: "ghost", onClick: onClear, className: "!p-1 h-6 w-6", title: "Clear Console", children: /* @__PURE__ */ jsx6(Ban, { className: "w-3 h-3" }) })
    ] }),
    /* @__PURE__ */ jsxs5(
      "div",
      {
        className: `flex-1 overflow-y-auto p-2 font-mono text-xs space-y-1 ${themeMode === "dark" ? "text-gray-300" : "text-gray-700"}`,
        children: [
          logs.length === 0 && /* @__PURE__ */ jsx6("div", { className: "h-full flex flex-col items-center justify-center opacity-30 select-none", children: /* @__PURE__ */ jsx6("span", { className: "italic", children: "No output" }) }),
          logs.map((log, i) => /* @__PURE__ */ jsxs5("div", { className: `
            border-b border-transparent hover:bg-black/5 dark:hover:bg-white/5 px-1 py-0.5 break-all whitespace-pre
            ${log.type === "error" ? "text-red-500 bg-red-500/5" : ""}
            ${log.type === "warn" ? "text-yellow-500 bg-yellow-500/5" : ""}
          `, children: [
            /* @__PURE__ */ jsx6("span", { className: "opacity-50 mr-2 select-none", children: ">" }),
            log.content
          ] }, i))
        ]
      }
    )
  ] });
});

// components/OutputFrame.tsx
import { GripHorizontal } from "lucide-react";
import { jsx as jsx7, jsxs as jsxs6 } from "react/jsx-runtime";
var MAX_CONSOLE_LOGS = 500;
var appendLog = (prev, entry) => prev.length >= MAX_CONSOLE_LOGS ? [...prev.slice(-(MAX_CONSOLE_LOGS - 1)), entry] : [...prev, entry];
var OutputFrame = ({
  runTrigger,
  code,
  themeMode,
  environmentMode,
  fixtureHtml,
  fixtureCss,
  mockApi,
  isBlurred = false,
  isPredictionMode = false,
  debugMode = false,
  onExecutionComplete
}) => {
  const iframeRef = useRef(null);
  const containerRef = useRef(null);
  const channelRef = useRef(null);
  const executionRef = useRef({ code, environmentMode, fixtureHtml, fixtureCss, mockApi, debugMode });
  const latestExecutionIdRef = useRef(null);
  const [logs, setLogs] = useState2([]);
  const [consoleHeight, setConsoleHeight] = useState2(150);
  const [isDragging, setIsDragging] = useState2(false);
  const isHeadless = environmentMode === "node-js" || environmentMode === "node-ts";
  const isFetchMode = environmentMode === "fetch" || environmentMode === "html-js-fetch";
  const isStaticHtmlMode = environmentMode === "html" || environmentMode === "html-css";
  const addSystemLog = useCallback((msg, type = "log") => {
    setLogs((prev) => appendLog(prev, {
      type,
      content: `[System] ${msg}`,
      timestamp: Date.now()
    }));
  }, []);
  const sandboxHtml = useMemo(
    () => getSandboxHtml(environmentMode, isPredictionMode),
    [environmentMode, isPredictionMode]
  );
  useEffect(() => {
    executionRef.current = { code, environmentMode, fixtureHtml, fixtureCss, mockApi, debugMode };
  }, [code, environmentMode, fixtureHtml, fixtureCss, mockApi, debugMode]);
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
    } else if (type === "EXECUTION_COMPLETE" && isFetchMode && payload?.executionId === latestExecutionIdRef.current) {
      onExecutionComplete?.();
    }
  }, [debugMode, addSystemLog, isFetchMode, onExecutionComplete]);
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
        const executionUsesFetch = execution.environmentMode === "fetch" || execution.environmentMode === "html-js-fetch";
        if (executionUsesFetch) latestExecutionIdRef.current = runTrigger;
        const hasDomFixture = execution.environmentMode === "dom" && (execution.fixtureHtml !== void 0 || execution.fixtureCss !== void 0);
        if (hasDomFixture) {
          executeCodeInSandbox(iframeRef.current.contentWindow, execution.code, {
            fixtureHtml: execution.fixtureHtml,
            fixtureCss: execution.fixtureCss
          });
        } else if (executionUsesFetch) {
          executeCodeInSandbox(iframeRef.current.contentWindow, execution.code, {
            mockApi: execution.mockApi
          }, runTrigger);
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
    if (!isStaticHtmlMode) return;
    const timer = setTimeout(() => {
      if (iframeRef.current?.contentWindow) {
        executeCodeInSandbox(iframeRef.current.contentWindow, code);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [code, isStaticHtmlMode]);
  const handleIframeLoad = () => {
    if (debugMode) addSystemLog('Iframe "onLoad" event fired.');
    if (!iframeRef.current?.contentWindow) return;
    channelRef.current?.port1.close();
    const channel = new MessageChannel();
    channelRef.current = channel;
    channel.port1.onmessage = (event) => kernelMessageRef.current(event.data);
    iframeRef.current.contentWindow.postMessage({ type: "INIT_PORT" }, "*", [channel.port2]);
    iframeRef.current.contentWindow.postMessage({ type: "THEME", mode: themeMode }, "*");
    if (isStaticHtmlMode) executeCodeInSandbox(iframeRef.current.contentWindow, code);
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
  return /* @__PURE__ */ jsx7(
    PreviewContainer,
    {
      themeMode,
      isReady: isStaticHtmlMode || runTrigger > 0,
      overlayMessage: isBlurred ? "Make your Prediction" : void 0,
      children: /* @__PURE__ */ jsxs6("div", { ref: containerRef, className: "w-full h-full flex flex-col relative", children: [
        !isHeadless && /* @__PURE__ */ jsx7("div", { className: "flex-1 min-h-0 relative", children: /* @__PURE__ */ jsx7(
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
        !isHeadless && !isStaticHtmlMode && /* @__PURE__ */ jsx7(
          "div",
          {
            onMouseDown: handleMouseDown,
            className: `h-3 shrink-0 flex items-center justify-center cursor-row-resize z-10 hover:bg-blue-500 hover:text-white transition-colors ${themeMode === "dark" ? "bg-[#252526] text-gray-600 border-t border-b border-black/20" : "bg-gray-100 text-gray-400 border-t border-b border-gray-200"}`,
            children: /* @__PURE__ */ jsx7(GripHorizontal, { className: "w-3 h-3" })
          }
        ),
        !isStaticHtmlMode && /* @__PURE__ */ jsx7("div", { style: { height: isHeadless ? "100%" : consoleHeight }, className: "shrink-0 min-h-0", children: /* @__PURE__ */ jsx7(Console, { logs, onClear: () => setLogs([]), themeMode }) }),
        isHeadless && /* @__PURE__ */ jsx7(
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
import { useEffect as useEffect2, useRef as useRef2, useState as useState3, useCallback as useCallback2, useMemo as useMemo2 } from "react";
import { Server, Clock, AlertCircle, GripHorizontal as GripHorizontal2 } from "lucide-react";
import { jsx as jsx8, jsxs as jsxs7 } from "react/jsx-runtime";
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
  const [logs, setLogs] = useState3([]);
  const [route, setRoute] = useState3("/");
  const [method] = useState3("GET");
  const [response, setResponse] = useState3(null);
  const [pendingRequest, setPendingRequest] = useState3(null);
  const [isLoading, setIsLoading] = useState3(false);
  const [serverReady, setServerReady] = useState3(false);
  const [runtimeError, setRuntimeError] = useState3(null);
  const startupTimeoutRef = useRef2(null);
  const requestTimeoutRef = useRef2(null);
  const [consoleHeight, setConsoleHeight] = useState3(150);
  const [isDragging, setIsDragging] = useState3(false);
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
  const sandboxHtml = useMemo2(() => {
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
  return /* @__PURE__ */ jsxs7("div", { className: "flex flex-col h-full w-full gap-2", children: [
    /* @__PURE__ */ jsxs7("div", { className: `flex items-center gap-2 p-2 rounded-md border transition-colors ${themeMode === "dark" ? "bg-[#252526] border-white/10" : "bg-white border-gray-200"}`, children: [
      /* @__PURE__ */ jsx8("div", { className: `px-3 py-1.5 rounded text-xs font-bold tracking-wider ${themeMode === "dark" ? "bg-blue-900/50 text-blue-400" : "bg-blue-100 text-blue-700"}`, children: method }),
      /* @__PURE__ */ jsx8(
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
      /* @__PURE__ */ jsx8(
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
    /* @__PURE__ */ jsx8(PreviewContainer, { themeMode, isReady, overlayMessage: isBlurred ? "Make your Prediction" : void 0, children: /* @__PURE__ */ jsxs7("div", { ref: containerRef, className: "flex flex-col h-full relative", children: [
      isLoading && /* @__PURE__ */ jsxs7("div", { className: "absolute top-2 right-2 z-10 flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-xs shadow-lg backdrop-blur-md", children: [
        /* @__PURE__ */ jsx8(Clock, { className: "w-3 h-3 animate-pulse" }),
        /* @__PURE__ */ jsx8("span", { children: pendingRequest ? "Starting Server..." : "Processing..." })
      ] }),
      /* @__PURE__ */ jsx8("div", { className: `flex-1 overflow-auto p-4 font-mono text-sm ${themeMode === "dark" ? "bg-[#1e1e1e]" : "bg-gray-50"}`, children: runtimeError ? /* @__PURE__ */ jsxs7("div", { className: "p-4 border border-red-500/20 rounded bg-red-500/5 text-red-400", children: [
        /* @__PURE__ */ jsxs7("div", { className: "flex items-center gap-2 text-red-500 font-bold mb-2", children: [
          /* @__PURE__ */ jsx8(AlertCircle, { className: "w-4 h-4" }),
          /* @__PURE__ */ jsx8("span", { children: "Runtime Error" })
        ] }),
        /* @__PURE__ */ jsx8("pre", { className: "whitespace-pre-wrap break-all", children: runtimeError })
      ] }) : response ? /* @__PURE__ */ jsxs7("div", { className: "animate-in fade-in slide-in-from-top-2 duration-300", children: [
        /* @__PURE__ */ jsx8("div", { className: "flex items-center justify-between mb-4 pb-2 border-b border-dashed border-gray-500/20", children: /* @__PURE__ */ jsxs7("span", { className: `font-bold ${response.status < 300 ? "text-green-500" : "text-red-500"}`, children: [
          response.status,
          " ",
          response.status === 200 ? "OK" : ""
        ] }) }),
        /* @__PURE__ */ jsx8("pre", { className: `${themeMode === "dark" ? "text-blue-300" : "text-blue-700"}`, children: JSON.stringify(response.data, null, 2) })
      ] }) : /* @__PURE__ */ jsxs7("div", { className: "h-full flex flex-col items-center justify-center opacity-20", children: [
        /* @__PURE__ */ jsx8(Server, { className: "w-12 h-12 mb-2" }),
        /* @__PURE__ */ jsx8("p", { children: "Server Standby" })
      ] }) }),
      /* @__PURE__ */ jsx8("div", { onMouseDown: handleMouseDown, className: `h-3 shrink-0 flex items-center justify-center cursor-row-resize ${themeMode === "dark" ? "bg-[#252526] text-gray-600 border-t border-b border-black/20" : "bg-gray-100 text-gray-400 border-t border-b border-gray-200"}`, children: /* @__PURE__ */ jsx8(GripHorizontal2, { className: "w-3 h-3" }) }),
      /* @__PURE__ */ jsx8("div", { style: { height: consoleHeight }, className: "shrink-0 min-h-0", children: /* @__PURE__ */ jsx8(Console, { logs, onClear: clearConsole, themeMode }) }),
      /* @__PURE__ */ jsx8(
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
var HTML_CSS_FILE_NAMES = ["index.html", "style.css"];
var HTML_JS_FILE_NAMES = ["index.html", "script.js"];
var HTML_CSS_JS_FILE_NAMES = ["index.html", "style.css", "script.js"];
var serializeFileBundle = (files) => JSON.stringify({ __csFiles__: 1, files });
function parseFileBundle(code, fileNames = HTML_CSS_FILE_NAMES) {
  try {
    const parsed = JSON.parse(code);
    if (parsed && parsed.__csFiles__ === 1 && parsed.files) {
      return Object.fromEntries(
        fileNames.map((fileName) => [fileName, String(parsed.files[fileName] ?? "")])
      );
    }
  } catch {
  }
  return Object.fromEntries(
    fileNames.map((fileName) => [fileName, fileName === "index.html" ? code : ""])
  );
}

// components/CodingEnvironment.tsx
import { jsx as jsx9, jsxs as jsxs8 } from "react/jsx-runtime";
var BUNDLE_MODE_CONFIG = {
  "html-css": { files: HTML_CSS_FILE_NAMES, hasMediaTab: false },
  "html-js": { files: HTML_JS_FILE_NAMES, hasMediaTab: false },
  "html-js-fetch": { files: HTML_JS_FILE_NAMES, hasMediaTab: false },
  "html-css-js": { files: HTML_CSS_JS_FILE_NAMES, hasMediaTab: false },
  "html-js-css-media": { files: HTML_CSS_JS_FILE_NAMES, hasMediaTab: true }
};
var getDisplayFilename = (mode) => mode === "html" ? "index.html" : `${mode}.script`;
var getCodeLanguage = (mode, filename) => {
  if (filename?.endsWith(".html")) return "html";
  if (filename?.endsWith(".css")) return "css";
  if (filename?.endsWith(".js")) return "javascript";
  if (mode === "html") return "html";
  if (["typescript", "react-ts", "express-ts", "hono-ts", "node-ts", "p5-ts"].includes(mode)) {
    return "typescript";
  }
  return "javascript";
};
var CodeEditor = React5.lazy(() => import("./CodeEditor-4XVTC4QA.js").then((module) => ({
  default: module.CodeEditor
})));
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
  mediaAssets,
  enableEmmet = false,
  mockApi,
  sessionId,
  predictionPrompt,
  debugMode = false,
  onExecutionComplete
}) => {
  const [predictionAnswer, setPredictionAnswer] = useState4("");
  const [isPredictionLocked, setIsPredictionLocked] = useState4(false);
  const [layout, setLayout] = useState4("horizontal");
  const [editorRatio, setEditorRatio] = useState4(0.5);
  const [isDragging, setIsDragging] = useState4(false);
  const containerRef = useRef3(null);
  const isPredictionFulfilled = !predictionPrompt || predictionAnswer.trim().length > 0;
  const isPredictionSourceMode = !!predictionPrompt || isPredictionLocked;
  const isFetchMode = environmentMode === "fetch" || environmentMode === "html-js-fetch";
  const bundleModeConfig = environmentMode in BUNDLE_MODE_CONFIG ? BUNDLE_MODE_CONFIG[environmentMode] : null;
  const editableBundleFileNames = bundleModeConfig?.files ?? null;
  const isEditableBundleMode = editableBundleFileNames !== null;
  const hasDomFixtures = environmentMode === "dom" && (fixtureHtml !== void 0 || fixtureCss !== void 0);
  const visibleTabs = useMemo3(() => {
    if (editableBundleFileNames) {
      return [
        ...editableBundleFileNames,
        ...bundleModeConfig?.hasMediaTab ? ["media"] : [],
        ...environmentMode === "html-js-fetch" ? ["api-server"] : []
      ];
    }
    if (environmentMode === "fetch") return ["script.js", "api-server"];
    if (!hasDomFixtures) return ["script.js"];
    return [
      "script.js",
      ...fixtureHtml !== void 0 ? ["index.html"] : [],
      ...fixtureCss !== void 0 ? ["style.css"] : []
    ];
  }, [editableBundleFileNames, bundleModeConfig, environmentMode, hasDomFixtures, fixtureHtml, fixtureCss]);
  const isTabbedMode = visibleTabs.length > 1;
  const [activeTab, setActiveTab] = useState4(
    isEditableBundleMode ? "index.html" : "script.js"
  );
  const selectedTab = visibleTabs.includes(activeTab) ? activeTab : visibleTabs[0];
  const selectedFile = selectedTab === "media" || selectedTab === "api-server" ? null : selectedTab;
  const files = useMemo3(
    () => editableBundleFileNames ? parseFileBundle(code, editableBundleFileNames) : null,
    [editableBundleFileNames, code]
  );
  useEffect3(() => {
    if (!visibleTabs.includes(activeTab)) setActiveTab(visibleTabs[0]);
  }, [activeTab, visibleTabs]);
  const editorCode = isEditableBundleMode && files && selectedFile ? files[selectedFile] : hasDomFixtures && selectedFile === "index.html" ? fixtureHtml ?? "" : hasDomFixtures && selectedFile === "style.css" ? fixtureCss ?? "" : code;
  const displayedFilename = isTabbedMode && selectedFile ? selectedFile : getDisplayFilename(environmentMode);
  const displayedLanguage = getCodeLanguage(
    environmentMode,
    isTabbedMode ? selectedFile ?? void 0 : void 0
  );
  const handleEditorChange = (value) => {
    const next = value || "";
    if (isEditableBundleMode && files && selectedFile) {
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
  return /* @__PURE__ */ jsxs8("div", { className: `flex-1 flex flex-col overflow-hidden ${themeMode === "dark" ? "bg-[#1e1e1e]" : "bg-white"}`, children: [
    predictionPrompt && /* @__PURE__ */ jsx9("div", { className: `p-4 border-b flex gap-4 ${themeMode === "dark" ? "bg-[#252526] border-white/10" : "bg-blue-50 border-blue-100"}`, children: /* @__PURE__ */ jsxs8("div", { className: "flex-1", children: [
      /* @__PURE__ */ jsx9("h3", { className: "text-xs font-bold uppercase tracking-wider text-purple-500 mb-2", children: "Knowledge Check" }),
      /* @__PURE__ */ jsx9("div", { className: "text-sm opacity-80 mb-3", children: predictionPrompt }),
      /* @__PURE__ */ jsx9(
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
    /* @__PURE__ */ jsxs8("div", { className: `h-12 px-4 border-b flex items-center justify-between ${themeMode === "dark" ? "bg-[#1e1e1e] border-white/10 text-gray-400" : "bg-white border-gray-100"}`, children: [
      /* @__PURE__ */ jsxs8("div", { className: "flex min-w-0 items-center gap-2 overflow-hidden", children: [
        /* @__PURE__ */ jsx9(FileCode, { className: "h-4 w-4 shrink-0 text-blue-500" }),
        isTabbedMode ? /* @__PURE__ */ jsx9("div", { className: "flex min-w-0 items-center gap-1 overflow-x-auto whitespace-nowrap", children: visibleTabs.map((tab) => {
          const isMediaTab = tab === "media";
          const isApiServerTab = tab === "api-server";
          const isFixtureFile = hasDomFixtures && tab !== "script.js";
          const isReadOnlyTab = isMediaTab || isApiServerTab || isFixtureFile;
          const tabLabel = isMediaTab ? "Media" : isApiServerTab ? "API Server" : tab;
          return /* @__PURE__ */ jsxs8(
            "button",
            {
              type: "button",
              onClick: () => setActiveTab(tab),
              title: isMediaTab ? "Read-only media" : isApiServerTab ? "Read-only mock API" : isFixtureFile ? "Fixed fixture" : void 0,
              "aria-pressed": selectedTab === tab,
              className: `px-2 py-1 rounded text-xs font-mono font-medium transition-colors ${selectedTab === tab ? themeMode === "dark" ? "bg-white/10 text-blue-400" : "bg-blue-50 text-blue-600" : "opacity-50 hover:opacity-80"}`,
              children: [
                tabLabel,
                isReadOnlyTab && /* @__PURE__ */ jsx9(Lock2, { "aria-hidden": "true", className: "ml-1 inline h-3 w-3" })
              ]
            },
            tab
          );
        }) }) : /* @__PURE__ */ jsx9("span", { className: "text-xs font-mono font-medium hidden sm:inline", children: getDisplayFilename(environmentMode) })
      ] }),
      /* @__PURE__ */ jsxs8("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsxs8("div", { className: "flex bg-black/5 dark:bg-white/5 p-0.5 rounded-lg border border-black/5 dark:border-white/5", children: [
          /* @__PURE__ */ jsxs8(
            "button",
            {
              onClick: () => setLayout("horizontal"),
              title: "Split View (Side by Side)",
              className: `flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-tight transition-all ${layout === "horizontal" ? "bg-white dark:bg-gray-700 shadow-sm text-blue-500" : "opacity-40 hover:opacity-60"}`,
              children: [
                /* @__PURE__ */ jsx9(Columns, { size: 12 }),
                /* @__PURE__ */ jsx9("span", { className: "hidden md:inline", children: "Split" })
              ]
            }
          ),
          /* @__PURE__ */ jsxs8(
            "button",
            {
              onClick: () => setLayout("vertical"),
              title: "Vertical View (Stacked)",
              className: `flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-tight transition-all ${layout === "vertical" ? "bg-white dark:bg-gray-700 shadow-sm text-blue-500" : "opacity-40 hover:opacity-60"}`,
              children: [
                /* @__PURE__ */ jsx9(Rows, { size: 12 }),
                /* @__PURE__ */ jsx9("span", { className: "hidden md:inline", children: "Stacked" })
              ]
            }
          )
        ] }),
        !isServerMode && /* @__PURE__ */ jsx9(
          Button,
          {
            onClick: handleRunClick,
            disabled: isRunning && !isFetchMode || !isPredictionFulfilled,
            variant: "primary",
            className: "h-8 !px-5 text-xs font-bold shadow-lg shadow-blue-500/20",
            icon: isRunning ? /* @__PURE__ */ jsx9(CheckCircle2, { className: "animate-pulse", size: 14 }) : /* @__PURE__ */ jsx9(Play, { size: 14 }),
            children: isRunning ? isFetchMode ? "RUN AGAIN" : "RUNNING..." : "RUN CODE"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs8("div", { ref: containerRef, className: `flex-1 flex overflow-hidden ${layout === "horizontal" ? "flex-row" : "flex-col"}`, children: [
      /* @__PURE__ */ jsx9("div", { style: { [layout === "horizontal" ? "width" : "height"]: `${editorRatio * 100}%` }, className: "relative flex flex-col min-w-0 min-h-0", children: selectedTab === "media" ? /* @__PURE__ */ jsx9(
        MediaPanel,
        {
          mediaAssets: environmentMode === "html-js-css-media" ? mediaAssets ?? [] : [],
          themeMode
        }
      ) : selectedTab === "api-server" ? /* @__PURE__ */ jsx9(ApiServerPanel, { mockApi, themeMode }) : isPredictionSourceMode ? /* @__PURE__ */ jsx9(
        ReadOnlyCodeViewer,
        {
          code: editorCode,
          filename: displayedFilename,
          language: displayedLanguage,
          themeMode
        }
      ) : /* @__PURE__ */ jsx9(React5.Suspense, { fallback: /* @__PURE__ */ jsx9("div", { className: "h-full w-full flex items-center justify-center text-sm opacity-50", children: "Loading Editor..." }), children: /* @__PURE__ */ jsx9(
        CodeEditor,
        {
          code: editorCode,
          onChange: handleEditorChange,
          themeMode,
          environmentMode,
          sessionId,
          activeFile: isTabbedMode ? selectedFile ?? void 0 : void 0,
          enableEmmet,
          readOnly: hasDomFixtures && selectedFile !== "script.js"
        }
      ) }) }),
      /* @__PURE__ */ jsx9(
        "div",
        {
          onMouseDown: handleMouseDown,
          className: `flex items-center justify-center shrink-0 hover:bg-blue-500/50 transition-colors z-10 ${layout === "horizontal" ? "w-1.5 cursor-col-resize" : "h-1.5 cursor-row-resize"} ${themeMode === "dark" ? "bg-black/40" : "bg-gray-100"}`,
          children: layout === "horizontal" ? /* @__PURE__ */ jsx9(GripVertical, { size: 10, className: "opacity-20" }) : /* @__PURE__ */ jsx9(GripHorizontal3, { size: 10, className: "opacity-20" })
        }
      ),
      /* @__PURE__ */ jsx9("div", { style: { [layout === "horizontal" ? "width" : "height"]: `${(1 - editorRatio) * 100}%` }, className: `relative flex flex-col min-w-0 min-h-0 ${isDragging ? "pointer-events-none" : ""}`, children: /* @__PURE__ */ jsx9("div", { className: "flex-1 p-2 md:p-3 overflow-hidden", children: isServerMode ? /* @__PURE__ */ jsx9(
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
      ) : /* @__PURE__ */ jsx9(
        OutputFrame,
        {
          runTrigger,
          code,
          themeMode,
          environmentMode,
          fixtureHtml: environmentMode === "dom" ? fixtureHtml : void 0,
          fixtureCss: environmentMode === "dom" ? fixtureCss : void 0,
          mockApi: isFetchMode ? mockApi : void 0,
          isBlurred: !isPredictionFulfilled,
          isPredictionMode: !!predictionPrompt,
          debugMode,
          onExecutionComplete: isFetchMode ? onExecutionComplete : void 0
        }
      ) }) })
    ] })
  ] });
};

// components/CodeShoebox.tsx
import { jsx as jsx10 } from "react/jsx-runtime";
var CodeShoebox = ({
  code,
  onCodeChange,
  environmentMode,
  fixtureHtml,
  fixtureCss,
  mediaAssets,
  enableEmmet = false,
  mockApi,
  theme,
  themeMode,
  sessionId = 0,
  prediction_prompt,
  debugMode = false
}) => {
  const [runTrigger, setRunTrigger] = useState5(0);
  const [isRunning, setIsRunning] = useState5(false);
  const runFallbackRef = useRef4(null);
  useEffect4(() => {
    setRunTrigger(0);
    setIsRunning(false);
    if (runFallbackRef.current) clearTimeout(runFallbackRef.current);
  }, [sessionId]);
  useEffect4(() => () => {
    if (runFallbackRef.current) clearTimeout(runFallbackRef.current);
  }, []);
  const handleRun = () => {
    setIsRunning(true);
    setRunTrigger((prev) => prev + 1);
    if (runFallbackRef.current) clearTimeout(runFallbackRef.current);
    runFallbackRef.current = setTimeout(() => {
      setIsRunning(false);
      runFallbackRef.current = null;
    }, environmentMode === "fetch" || environmentMode === "html-js-fetch" ? 1e4 : 500);
  };
  const handleExecutionComplete = () => {
    if (runFallbackRef.current) clearTimeout(runFallbackRef.current);
    runFallbackRef.current = null;
    setIsRunning(false);
  };
  const themeStyles = useMemo4(() => {
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
  return /* @__PURE__ */ jsx10(
    "div",
    {
      className: "flex flex-col h-full w-full transition-colors duration-300 bg-[hsl(var(--background))] text-[hsl(var(--foreground))]",
      style: themeStyles,
      children: /* @__PURE__ */ jsx10(
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
          mediaAssets,
          enableEmmet,
          mockApi,
          predictionPrompt: prediction_prompt,
          debugMode,
          onExecutionComplete: handleExecutionComplete
        },
        sessionId
      )
    }
  );
};

// hooks/useSandboxState.ts
import { useState as useState6, useEffect as useEffect5, useCallback as useCallback4 } from "react";

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
var HTML_JS_STARTER_CODE = serializeFileBundle({
  "index.html": `<!DOCTYPE html>
<html>
<head>
  <title>Two Files</title>
</head>
<body>
  <h1>HTML meets JavaScript</h1>
  <p id="message">Press the button to run an interaction.</p>
  <button id="change-message">Change message</button>
  <script src="script.js"></script>
</body>
</html>
`,
  "script.js": `const button = document.getElementById('change-message');
const message = document.getElementById('message');

button.addEventListener('click', () => {
  message.textContent = 'JavaScript changed the page!';
  console.log('Message updated');
});
`
});
var HTML_JS_FETCH_STARTER_CODE = serializeFileBundle({
  "index.html": `<!DOCTYPE html>
<html>
<head>
  <title>Air Quality</title>
</head>
<body>
  <main>
    <h1>Air quality readings</h1>
    <p id="status">Loading data from the mock API...</p>
    <ul id="readings"></ul>
  </main>
  <script src="script.js"></script>
</body>
</html>
`,
  "script.js": `let response = await fetch("/api/air-quality?limit=4");
let readings = await response.json();
let status = document.getElementById("status");
let list = document.getElementById("readings");

status.textContent = "Loaded " + readings.length + " readings.";
readings.forEach(function (reading) {
  let item = document.createElement("li");
  item.textContent = reading.city + ": AQI " + reading.aqi + " (" + reading.category + ")";
  list.appendChild(item);
});

console.log(readings);
`
});
var HTML_CSS_JS_STARTER_CODE = serializeFileBundle({
  "index.html": `<!DOCTYPE html>
<html>
<head>
  <title>Three Files</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <main class="message-card">
    <p class="eyebrow">HTML + CSS + JavaScript</p>
    <h1 id="message">Ready for all three layers.</h1>
    <button id="change-message" type="button">Change message</button>
  </main>
  <script src="script.js"></script>
</body>
</html>
`,
  "style.css": `body {
  margin: 0;
  padding: 2rem;
  background: #eef2ff;
  font-family: ui-sans-serif, system-ui, sans-serif;
}

.message-card {
  max-width: 28rem;
  padding: 1.5rem;
  border: 1px solid #a5b4fc;
  border-radius: 1rem;
  background: white;
  color: #1e1b4b;
}

.eyebrow { color: #4f46e5; font-weight: 700; }
button { padding: 0.7rem 1rem; border: 0; border-radius: 999px; background: #4f46e5; color: white; }
`,
  "script.js": `const button = document.getElementById('change-message');
const message = document.getElementById('message');

button.addEventListener('click', () => {
  message.textContent = 'HTML, CSS, and JavaScript are connected!';
  console.log('Three-file interaction complete');
});
`
});
var HTML_JS_CSS_MEDIA_STARTER_CODE = serializeFileBundle({
  "index.html": `<!DOCTYPE html>
<html>
<head>
  <title>Media Page</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <main class="media-card">
    <p class="eyebrow">HTML + CSS + JavaScript + Media</p>
    <h1>Build with media</h1>
    <div id="media-gallery">
      Open the Media tab and paste a snippet here.
    </div>
    <button id="check-media" type="button">Check my page</button>
  </main>
  <script src="script.js"></script>
</body>
</html>
`,
  "style.css": `body {
  margin: 0;
  padding: 2rem;
  background: #fff7ed;
  font-family: ui-sans-serif, system-ui, sans-serif;
  color: #7c2d12;
}

.media-card {
  max-width: 32rem;
  padding: 1.5rem;
  border: 1px solid #fdba74;
  border-radius: 1rem;
  background: white;
}

.eyebrow { color: #ea580c; font-weight: 700; }
#media-gallery { margin: 1rem 0; padding: 1rem; border: 2px dashed #fdba74; border-radius: 0.75rem; }
button { padding: 0.7rem 1rem; border: 0; border-radius: 999px; background: #ea580c; color: white; }
`,
  "script.js": `const button = document.getElementById('check-media');
const gallery = document.getElementById('media-gallery');

button.addEventListener('click', () => {
  console.log(gallery.children.length > 0 ? 'Media added!' : 'Choose a snippet from the Media tab.');
});
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
var FETCH_STARTER_CODE = `// Fetch data from the routes in the API Server tab.
// The mock server waits one second so you can observe that await pauses here.

let response = await fetch("/api/air-quality?limit=4");
let readings = await response.json();

console.log("The first city is " + readings[0].city);
console.log(readings);
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
  "html-js",
  "html-js-fetch",
  "html-css-js",
  "html-js-css-media",
  "dom",
  "fetch",
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
    case "html-js":
      return HTML_JS_STARTER_CODE;
    case "html-js-fetch":
      return HTML_JS_FETCH_STARTER_CODE;
    case "html-css-js":
      return HTML_CSS_JS_STARTER_CODE;
    case "html-js-css-media":
      return HTML_JS_CSS_MEDIA_STARTER_CODE;
    case "fetch":
      return FETCH_STARTER_CODE;
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
  const [environmentMode, setEnvironmentMode] = useState6(() => loadState("env_mode", defaultMode, VALID_MODES));
  const [themeMode, setThemeMode] = useState6(() => loadState("theme_mode", "dark", ["light", "dark"]));
  const [activeThemeName, setActiveThemeName] = useState6(() => loadState("theme_name", themes[0].name, themes.map((t) => t.name)));
  const [code, setCode] = useState6(() => loadCode(environmentMode));
  const [sessionId, setSessionId] = useState6(() => Math.floor(Math.random() * 1e6));
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
import { useMemo as useMemo5 } from "react";
var useAutoKey = (identifier, initialCode = "", prefix = "auto") => {
  const key = useMemo5(() => {
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
