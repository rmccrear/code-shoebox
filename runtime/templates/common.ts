
/**
 * Shared HTML/CSS/JS for the sandbox environment.
 * This acts as the "Kernel" for all execution modes.
 */

export const BASE_STYLES = `
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

export const KERNEL_SCRIPTS = `
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

export const BASE_HTML_WRAPPER = (recipe: { 
  cdns?: string[], 
  mocks?: string, 
  styles?: string,
  logic: string,
  showPlaceholder?: boolean,
  contentSecurityPolicy?: string,
}) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    ${recipe.contentSecurityPolicy ? `<meta http-equiv="Content-Security-Policy" content="${recipe.contentSecurityPolicy}">` : ''}
    <style>${BASE_STYLES} ${recipe.styles || ''}</style>
    ${(recipe.cdns || []).join('\n')}
</head>
<body>
    <div id="root">
        ${recipe.showPlaceholder !== false ? '<p id="placeholder" style="color: #888; font-style: italic;">Output will appear here...</p>' : ''}
    </div>
    <script>
        ${KERNEL_SCRIPTS}
        ${recipe.mocks || ''}
        ${recipe.logic}
    </script>
</body>
</html>
`;
