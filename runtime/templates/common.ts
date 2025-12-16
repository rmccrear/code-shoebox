

/**
 * Shared HTML/CSS/JS for the sandbox environment.
 */

export const BASE_STYLES = `
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

export const CONSOLE_INTERCEPTOR = `
    // --- Console Capture System ---
    
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
`;

export const BASE_HTML_WRAPPER = (headContent: string, scriptContent: string, showPlaceholder: boolean = true) => `
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
        ${showPlaceholder ? '<p id="placeholder" style="color: #666; font-style: italic; align-self: flex-start;">Output will appear here...</p>' : ''}
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