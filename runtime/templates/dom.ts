
import { BASE_HTML_WRAPPER } from "./common";

const DOM_EXECUTION_LOGIC = `
    window.runMode = function(code, root) {
        // Standard DOM Mode
        root.innerHTML = ''; 
        try {
            const userFunction = new Function('root', code);
            userFunction(root);
        } catch (err) {
            console.error(err);
        }
    };
`;

export const generateDomHtml = (showPlaceholder: boolean = true) => {
    // Fixed: BASE_HTML_WRAPPER expects a single object argument
    return BASE_HTML_WRAPPER({ logic: DOM_EXECUTION_LOGIC, showPlaceholder });
};