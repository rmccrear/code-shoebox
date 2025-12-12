
import { BASE_HTML_WRAPPER } from "./common";

const REACT_TS_CDNS = `
<script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
<script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
`;

const REACT_TS_EXECUTION_LOGIC = `
    // 1. Shim 'require'
    window.require = function(module) {
        if (module === 'react') return window.React;
        if (module === 'react-dom') return window.ReactDOM;
        if (module === 'react-dom/client') return window.ReactDOM;
        throw new Error('Module not found: ' + module);
    };

    // 2. Patch createRoot for cleanup
    const originalCreateRoot = window.ReactDOM.createRoot;
    window.ReactDOM.createRoot = function(container, options) {
        const root = originalCreateRoot.call(window.ReactDOM, container, options);
        if (container.id === 'root') {
            window.__APP_ROOT__ = root;
        }
        return root;
    };

    window.runMode = function(code, rootElement) {
        // React + TypeScript Mode
        
        if (window.__APP_ROOT__) {
            try { window.__APP_ROOT__.unmount(); } catch(e) {}
            window.__APP_ROOT__ = null;
        }

        rootElement.innerHTML = '';
        
        try {
            // Transpile with 'typescript' preset
            const compiled = Babel.transform(code, {
                presets: ['react', 'env', 'typescript'],
                filename: 'App.tsx'
            }).code;

            (function() {
                eval(compiled);
            })();
            
        } catch (err) {
            console.error(err);
        }
    };
`;

export const generateReactTsHtml = (showPlaceholder: boolean = true) => {
    return BASE_HTML_WRAPPER(REACT_TS_CDNS, REACT_TS_EXECUTION_LOGIC, showPlaceholder);
};
