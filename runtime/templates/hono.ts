
/**
 * Mock logic for Hono framework simulation in the browser.
 */

export const HONO_MOCK_SETUP = `
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
