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

export const CONSOLE_INTERCEPTOR = `
    // --- Console Capture System ---
    const consoleOutput = document.getElementById('console-output');
    
    function logToScreen(msg, type = 'log') {
        consoleOutput.style.display = 'block';
        const line = document.createElement('div');
        line.className = type;
        line.style.borderBottom = '1px solid rgba(0,0,0,0.05)';
        line.style.padding = '2px 0';
        line.textContent = '> ' + (typeof msg === 'object' ? JSON.stringify(msg, null, 2) : String(msg));
        consoleOutput.appendChild(line);
        // Auto scroll to bottom
        consoleOutput.scrollTop = consoleOutput.scrollHeight;
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

export const BASE_HTML_WRAPPER = (headContent: string, scriptContent: string) => `
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
        <p id="placeholder" style="color: #666; font-style: italic; align-self: flex-start;">Output will appear here...</p>
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