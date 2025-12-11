import { BASE_HTML_WRAPPER } from "./common";

const P5_CDN = '<script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.min.js"></script>';

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

export const generateP5Html = () => {
    return BASE_HTML_WRAPPER(P5_CDN, P5_EXECUTION_LOGIC);
};