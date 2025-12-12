
import { BASE_HTML_WRAPPER } from "./common";

const EXPRESS_SHIM = `
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

export const generateExpressHtml = (showPlaceholder: boolean = true) => {
    // We pass false for placeholder usually, or handle it via CSS in the ServerOutput component 
    // because the console is the main view here.
    return BASE_HTML_WRAPPER('', EXPRESS_SHIM, false); 
};
