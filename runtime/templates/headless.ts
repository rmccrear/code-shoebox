
import { BASE_HTML_WRAPPER } from "./common";

const BABEL_CDN = '<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>';

/**
 * Common logic to execute code in a "headless" way.
 * It shadows DOM globals to discourage their use and focus the student on the console.
 */
const HEADLESS_RUNNER = (isTypescript: boolean) => `
    window.runMode = function(code, root) {
        // Clear previous state if any
        root.innerHTML = '<div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; opacity:0.3; text-align:center; font-family:sans-serif; padding:2rem;">' +
                         '<div style="font-size:3rem; margin-bottom:1rem;">💻</div>' +
                         '<div>Console Environment Active</div>' +
                         '<div style="font-size:0.8rem; margin-top:0.5rem;">The output is displayed in the console below.</div>' +
                         '</div>';

        try {
            let executableCode = code;

            if (${isTypescript}) {
                // Transpile TS
                executableCode = Babel.transform(code, {
                    presets: ['env', 'typescript'],
                    filename: 'index.ts'
                }).code;
            }

            /**
             * We wrap in a function to shadow globals like 'document' and 'window'
             * with null to reinforce that this is a console-only environment.
             */
            const headlessWrapper = new Function('document', 'window', 'root', executableCode);
            headlessWrapper(null, null, null);
            
        } catch (err) {
            console.error(err);
        }
    };
`;

export const generateHeadlessJsHtml = () => {
    return BASE_HTML_WRAPPER('', HEADLESS_RUNNER(false), false);
};

export const generateHeadlessTsHtml = () => {
    return BASE_HTML_WRAPPER(BABEL_CDN, HEADLESS_RUNNER(true), false);
};
