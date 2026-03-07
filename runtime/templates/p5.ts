
import { BASE_HTML_WRAPPER } from "./common";

const P5_CDN = '<script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.min.js"></script>';
const P5_STYLES = `
    #root {
        align-items: flex-start;
        justify-content: flex-start;
        padding: 0.5rem;
    }

    canvas.p5Canvas {
        margin: 0;
        border: 2px solid rgba(37, 99, 235, 0.85);
        border-radius: 6px;
    }

    body.dark canvas.p5Canvas {
        border-color: rgba(96, 165, 250, 0.95);
    }
`;

const P5_EXECUTION_LOGIC = `
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

export const generateP5Html = (showPlaceholder: boolean = true) => {
    return BASE_HTML_WRAPPER({
        cdns: [P5_CDN],
        styles: P5_STYLES,
        logic: P5_EXECUTION_LOGIC,
        showPlaceholder
    });
};
