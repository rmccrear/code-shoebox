
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

const EXPRESS_JS_RUNNER = `
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

export const generateExpressHtml = (showPlaceholder: boolean = true) => {
    const script = EXPRESS_MOCK_SETUP + EXPRESS_JS_RUNNER;
    // Fixed: BASE_HTML_WRAPPER expects a single object argument
    return BASE_HTML_WRAPPER({ logic: script, showPlaceholder: false }); 
};
