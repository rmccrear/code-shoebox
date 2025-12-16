
import { BASE_HTML_WRAPPER } from "./common";

// Export the mock logic so it can be reused by express-ts
export const EXPRESS_MOCK_SETUP = `
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
            window.parent.postMessage({ type: 'SERVER_READY' }, '*');
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

    // --- Global Shim ---
    const appInstance = new MockApp();
    
    // For JS mode: const app = express();
    // For TS mode shim: require('express') returns window.express
    window.express = function() {
        return appInstance;
    };
    
    // Expose instance for reset logic
    window.appInstance = appInstance;

    // --- Message Listener for Test Requests ---
    window.addEventListener('message', async (event) => {
        const { type, payload } = event.data;
        if (type === 'SIMULATE_REQUEST') {
            const { method, url } = payload;
            const response = await appInstance._handleRequest(method, url);
            window.parent.postMessage({
                type: 'REQUEST_COMPLETE',
                payload: response
            }, '*');
        }
    });
`;

const EXPRESS_JS_RUNNER = `
    window.runMode = function(code, root) {
        // Express Mode (JS)
        root.innerHTML = '';
        
        // Reset routes on re-run
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

export const generateExpressHtml = (showPlaceholder: boolean = true) => {
    // Combine the setup logic and the JS-specific runner
    const script = EXPRESS_MOCK_SETUP + EXPRESS_JS_RUNNER;
    return BASE_HTML_WRAPPER('', script, false); 
};