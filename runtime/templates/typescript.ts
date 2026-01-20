
import { BASE_HTML_WRAPPER } from "./common";

// We need Babel to transpile TS on the fly in the browser
const BABEL_CDN = '<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>';

const TS_EXECUTION_LOGIC = `
    window.runMode = function(code, root) {
        // TypeScript Mode
        root.innerHTML = ''; 
        
        try {
            // Transpile TypeScript to JavaScript
            const transpiled = Babel.transform(code, {
                presets: ['env', 'typescript'],
                filename: 'script.ts'
            }).code;

            // Execute the transpiled code
            // Wrap in a function that receives 'root' to match DOM behavior
            const userFunction = new Function('root', transpiled);
            userFunction(root);
        } catch (err) {
            console.error(err);
        }
    };
`;

export const generateTsHtml = (showPlaceholder: boolean = true) => {
    // Fixed: BASE_HTML_WRAPPER expects a single object argument with cdns as string[]
    return BASE_HTML_WRAPPER({ cdns: [BABEL_CDN], logic: TS_EXECUTION_LOGIC, showPlaceholder });
};