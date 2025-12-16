
import { BASE_HTML_WRAPPER } from "./common";
import { EXPRESS_MOCK_SETUP } from "./express";

const BABEL_CDN = '<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>';

const EXPRESS_TS_RUNNER = `
    // 1. Shim 'require' to support standard imports transpiled by Babel
    window.require = function(module) {
        if (module === 'express') {
            // In TS/ESM: import express from 'express'; express() -> app
            // Babel 'env' preset might treat default export as module.default depending on config,
            // or just module() if it's commonjs interop.
            // Our window.express is the function.
            // Let's ensure common default import patterns work.
            const exp = window.express;
            exp.default = exp;
            return exp;
        }
        throw new Error('Module not found: ' + module);
    };

    window.runMode = function(code, root) {
        // Express TS Mode
        root.innerHTML = '';
        
        // Reset routes on re-run
        if (window.appInstance) {
             window.appInstance.routes = { GET: {} };
        }

        try {
             // Transpile with 'typescript' and 'env' presets
             // 'env' will convert import/export to require/module.exports (CommonJS)
             const transpiled = Babel.transform(code, {
                presets: ['env', 'typescript'],
                filename: 'server.ts'
            }).code;

            // Execute in an IIFE
            (function() {
                eval(transpiled);
            })();
        } catch (err) {
            console.error(err);
        }
    };
`;

export const generateExpressTsHtml = (showPlaceholder: boolean = false) => {
    const script = EXPRESS_MOCK_SETUP + EXPRESS_TS_RUNNER;
    return BASE_HTML_WRAPPER(BABEL_CDN, script, false);
};