
import { BASE_HTML_WRAPPER } from "./common";

const REACT_CDNS = `
<script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
<script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
`;

const REACT_EXECUTION_LOGIC = `
    // 1. Shim 'require' to support standard imports transpiled by Babel
    window.require = function(module) {
        if (module === 'react') return window.React;
        if (module === 'react-dom') return window.ReactDOM;
        if (module === 'react-dom/client') return window.ReactDOM;
        throw new Error('Module not found: ' + module);
    };

    // 2. Patch createRoot to track the root instance for cleanup
    //    (React 18 warns if you createRoot on an existing root container)
    const originalCreateRoot = window.ReactDOM.createRoot;
    window.ReactDOM.createRoot = function(container, options) {
        const root = originalCreateRoot.call(window.ReactDOM, container, options);
        if (container.id === 'root') {
            window.__APP_ROOT__ = root;
        }
        return root;
    };

    window.runMode = function(code, rootElement) {
        // React Mode
        
        // 1. Cleanup previous React Root
        if (window.__APP_ROOT__) {
            try {
                window.__APP_ROOT__.unmount();
            } catch(e) { console.warn('Failed to unmount previous root', e); }
            window.__APP_ROOT__ = null;
        }

        // 2. Clear DOM (safely)
        rootElement.innerHTML = '';
        
        try {
            // 3. Transpile code
            //    We use 'env' to transpile imports to 'require' calls (CommonJS),
            //    which our shim handles.
            const compiled = Babel.transform(code, {
                presets: ['react', 'env'],
                filename: 'user_code.js'
            }).code;

            // 4. Execute
            //    We wrap in a function to isolate scope slightly, though imports 
            //    usually end up as var declarations at top level.
            (function() {
                eval(compiled);
            })();
            
        } catch (err) {
            console.error(err);
        }
    };
`;

export const generateReactHtml = (showPlaceholder: boolean = true) => {
    // Fixed: BASE_HTML_WRAPPER expects a single object argument with cdns as string[]
    return BASE_HTML_WRAPPER({ cdns: [REACT_CDNS], logic: REACT_EXECUTION_LOGIC, showPlaceholder });
};