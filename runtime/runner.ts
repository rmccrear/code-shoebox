
import { EnvironmentMode, EnvironmentRecipe } from "./types";
import { BASE_HTML_WRAPPER } from "./templates/common";
import { EXPRESS_MOCK_SETUP } from "./templates/express";
import { HONO_MOCK_SETUP } from "./templates/hono";

export const SANDBOX_ATTRIBUTES = "allow-scripts allow-modals allow-forms";

// CDN deps are pinned to exact versions for reproducible sandbox behavior.
// Bump deliberately: change the version, then manually verify every affected
// mode in `npm run dev` (see ENVIRONMENTS_README.md for the mode inventory).
const BABEL_CDN = '<script src="https://unpkg.com/@babel/standalone@7.26.4/babel.min.js"></script>';
const REACT_CDNS = [
  '<script crossorigin src="https://unpkg.com/react@18.3.1/umd/react.development.js"></script>',
  '<script crossorigin src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js"></script>',
  BABEL_CDN
];
const P5_CDN = '<script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.min.js"></script>';
// p5.play v2, rmccrear/code-dot-org fork (LGPL-2.1) — the sprite library behind
// Code.org Game Lab (createSprite, drawSprites, keyDown, isTouching...).
// Pinned to a jsDelivr GitHub tag with stock p5.js compat baked in.
const P5PLAY_CDNS = [
  P5_CDN,
  '<script src="https://cdn.jsdelivr.net/gh/rmccrear/p5.play@v2.0.0-codex.1/lib/p5.play.js"></script>'
];
const P5_RUNTIME_STYLES = `
  #root {
    padding: 0;
    overflow: hidden;
  }

  canvas.p5Canvas {
    position: absolute !important;
    top: 0 !important;
    left: 0 !important;
    margin: 0 !important;
    border: 2px solid rgba(37, 99, 235, 0.85);
    border-radius: 6px;
    box-sizing: border-box;
  }

  body.dark canvas.p5Canvas {
    border-color: rgba(96, 165, 250, 0.95);
  }
`;
// Hono CDN - Using a module script to inject into window
const HONO_CDN = '<script type="module">import { Hono } from "https://esm.sh/hono@4.1.0"; window.Hono = Hono;</script>';

// Shared by the html / html-css modes: full-bleed nested frame plus the
// notice banners rendered above the learner's page.
const HTML_RUNTIME_STYLES = `
  #root {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    padding: 0;
  }

  .cs-script-banner,
  .cs-hint-banner {
    flex-shrink: 0;
    padding: 6px 12px;
    font-size: 12px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }

  .cs-script-banner {
    background: #fef3c7;
    color: #92400e;
    border-bottom: 1px solid #fcd34d;
  }

  .cs-hint-banner {
    background: #dbeafe;
    color: #1e40af;
    border-bottom: 1px solid #93c5fd;
  }

  .cs-html-frame {
    flex: 1;
    width: 100%;
    border: none;
    display: block;
    background: #fff;
  }
`;

/**
 * Registry of environment configurations.
 * This makes it trivial to add new modes without creating new files.
 */
const ENV_RECIPES: Record<string, EnvironmentRecipe> = {
  html: {
    name: "HTML (single file)",
    showPlaceholder: false,
    styles: HTML_RUNTIME_STYLES,
    logic: `
      window.__RUN_MODE__ = (code, root) => {
        root.innerHTML = '';
        // The buffer renders verbatim as the srcdoc of a nested iframe with
        // sandbox="" — script execution is blocked by the browser sandbox
        // itself (nested sandbox flags intersect, so the outer frame's
        // allow-scripts does not leak in). The DOMParser pass below only
        // DETECTS script tags to show the learner a banner; it must not be
        // "upgraded" to stripping, and sandbox="" must stay empty.
        const probe = new DOMParser().parseFromString(code, 'text/html');
        if (probe.querySelector('script')) {
          const banner = document.createElement('div');
          banner.className = 'cs-script-banner';
          banner.textContent = '\\u26a0 <script> is ignored in HTML & CSS mode \\u2014 switch to the DOM mode to write JavaScript.';
          root.appendChild(banner);
        }
        const frame = document.createElement('iframe');
        frame.setAttribute('sandbox', '');
        frame.className = 'cs-html-frame';
        frame.srcdoc = code;
        root.appendChild(frame);
      };
    `
  },
  'html-css': {
    name: "HTML & CSS (style.css)",
    showPlaceholder: false,
    styles: HTML_RUNTIME_STYLES,
    logic: `
      window.__RUN_MODE__ = (code, root) => {
        root.innerHTML = '';
        // Inline copy of parseFileBundle from runtime/fileBundle.ts — the
        // iframe kernel cannot import modules. Keep the two in sync.
        let files;
        try {
          const parsed = JSON.parse(code);
          files = (parsed && parsed.__csFiles__ === 1 && parsed.files)
            ? { html: String(parsed.files['index.html'] ?? ''), css: String(parsed.files['style.css'] ?? '') }
            : { html: code, css: '' };
        } catch (e) { files = { html: code, css: '' }; }

        const doc = new DOMParser().parseFromString(files.html, 'text/html');

        if (doc.querySelector('script')) {
          const banner = document.createElement('div');
          banner.className = 'cs-script-banner';
          banner.textContent = '\\u26a0 <script> is ignored in HTML & CSS mode \\u2014 switch to the DOM mode to write JavaScript.';
          root.appendChild(banner);
        }

        // Strict link semantics: only a literal style.css href resolves to
        // the css tab. Scripts are still blocked by the inner sandbox=""
        // attribute below, not by stripping — do not change either rule.
        const links = doc.querySelectorAll('link[rel="stylesheet"][href="style.css"]');
        links.forEach((link) => {
          const style = doc.createElement('style');
          style.textContent = files.css;
          link.replaceWith(style);
        });
        if (links.length === 0 && files.css.trim()) {
          const hint = document.createElement('div');
          hint.className = 'cs-hint-banner';
          hint.textContent = 'style.css is not linked \\u2014 add <link rel="stylesheet" href="style.css"> inside <head>.';
          root.appendChild(hint);
        }

        const frame = document.createElement('iframe');
        frame.setAttribute('sandbox', '');
        frame.className = 'cs-html-frame';
        frame.srcdoc = '<!DOCTYPE html>' + doc.documentElement.outerHTML;
        root.appendChild(frame);
      };
    `
  },
  dom: {
    name: "DOM",
    logic: `
      window.__RUN_MODE__ = (code, root, options = {}) => {
        root.replaceChildren();
        document.querySelectorAll('style[data-code-shoebox-fixture]').forEach((style) => style.remove());

        if (options.fixtureCss !== undefined) {
          const fixtureStyle = document.createElement('style');
          fixtureStyle.setAttribute('data-code-shoebox-fixture', '');
          fixtureStyle.textContent = options.fixtureCss;
          document.head.appendChild(fixtureStyle);
        }

        if (options.fixtureHtml !== undefined) {
          const fixtureDocument = new DOMParser().parseFromString(options.fixtureHtml, 'text/html');
          const fixtureFragment = document.createDocumentFragment();
          fixtureDocument.body.childNodes.forEach((node) => {
            fixtureFragment.appendChild(document.importNode(node, true));
          });
          root.appendChild(fixtureFragment);
        }

        try { new Function('root', code)(root); } catch (e) { console.error(e); }
      };
    `
  },
  typescript: {
    name: "TypeScript",
    cdns: [BABEL_CDN],
    babelPresets: ['typescript', 'env'],
    logic: `
      window.__RUN_MODE__ = (code, root) => {
        root.innerHTML = '';
        try {
          const transpiled = Babel.transform(code, { presets: ['env', 'typescript'], filename: 'script.ts' }).code;
          new Function('root', transpiled)(root);
        } catch (e) { console.error(e); }
      };
    `
  },
  p5play: {
    name: "p5.js + p5.play",
    cdns: P5PLAY_CDNS,
    styles: P5_RUNTIME_STYLES,
    logic: `
      let instance = null;
      window.__RUN_MODE__ = (code, root) => {
        if (instance) instance.remove();
        root.innerHTML = '';
        window.setup = window.draw = null;
        const observer = new MutationObserver(m => {
          m.forEach(mutation => mutation.addedNodes.forEach(node => {
            if (node.tagName === 'CANVAS' && node.classList.contains('p5Canvas')) root.appendChild(node);
          }));
        });
        observer.observe(document.body, { childList: true });
        try {
          // Game Lab semantics: the canvas and p5 globals exist BEFORE student
          // code runs, so top-level statements like createSprite() work.
          // p5's redraw() looks up window.draw each frame, so a draw() defined
          // by the eval below is picked up even though the instance already exists.
          instance = new p5();
          window.createCanvas(400, 400);
          window.eval(code);
          if (typeof window.setup === 'function') window.setup();
        } catch (e) { console.error(e); }
      };
    `
  },
  p5: {
    name: "p5.js",
    cdns: [P5_CDN],
    styles: P5_RUNTIME_STYLES,
    logic: `
      let instance = null;
      window.__RUN_MODE__ = (code, root) => {
        if (instance) instance.remove();
        root.innerHTML = '';
        window.setup = window.draw = null;
        const observer = new MutationObserver(m => {
          m.forEach(mutation => mutation.addedNodes.forEach(node => {
            if (node.tagName === 'CANVAS' && node.classList.contains('p5Canvas')) root.appendChild(node);
          }));
        });
        observer.observe(document.body, { childList: true });
        try { window.eval(code); instance = new p5(); } catch (e) { console.error(e); }
      };
    `
  },
  'p5-ts': {
    name: "p5.js TS",
    cdns: [P5_CDN, BABEL_CDN],
    babelPresets: ['typescript', 'env'],
    styles: P5_RUNTIME_STYLES,
    logic: `
      let instance = null;
      window.__RUN_MODE__ = (code, root) => {
        if (instance) instance.remove();
        root.innerHTML = '';
        window.setup = window.draw = null;
        const observer = new MutationObserver(m => {
          m.forEach(mutation => mutation.addedNodes.forEach(node => {
            if (node.tagName === 'CANVAS' && node.classList.contains('p5Canvas')) root.appendChild(node);
          }));
        });
        observer.observe(document.body, { childList: true });
        try {
          const transpiled = Babel.transform(code, { 
            presets: ['env', 'typescript'], 
            filename: 'sketch.ts' 
          }).code;
          window.eval(transpiled); 
          instance = new p5(); 
        } catch (e) { console.error(e); }
      };
    `
  },
  react: {
    name: "React",
    cdns: REACT_CDNS,
    babelPresets: ['react', 'env'],
    logic: `
      let rootInstance = null;
      const originalCreateRoot = window.ReactDOM.createRoot;
      window.ReactDOM.createRoot = (c, o) => {
        const r = originalCreateRoot.call(window.ReactDOM, c, o);
        if (c.id === 'root') rootInstance = r;
        return r;
      };
      window.__RUN_MODE__ = (code, root) => {
        if (rootInstance) { try { rootInstance.unmount(); } catch(e){} rootInstance = null; }
        root.innerHTML = '';
        try {
          const compiled = Babel.transform(code, { presets: ['react', 'env'], filename: 'App.js' }).code;
          eval(compiled);
        } catch (e) { console.error(e); }
      };
    `
  },
  'react-ts': {
    name: "React TS",
    cdns: REACT_CDNS,
    babelPresets: ['react', 'typescript', 'env'],
    logic: `
      let rootInstance = null;
      const originalCreateRoot = window.ReactDOM.createRoot;
      window.ReactDOM.createRoot = (c, o) => {
        const r = originalCreateRoot.call(window.ReactDOM, c, o);
        if (c.id === 'root') rootInstance = r;
        return r;
      };
      window.__RUN_MODE__ = (code, root) => {
        if (rootInstance) { try { rootInstance.unmount(); } catch(e){} rootInstance = null; }
        root.innerHTML = '';
        try {
          const compiled = Babel.transform(code, { presets: ['react', 'typescript', 'env'], filename: 'App.tsx' }).code;
          eval(compiled);
        } catch (e) { console.error(e); }
      };
    `
  },
  express: {
    name: "Express",
    mocks: EXPRESS_MOCK_SETUP,
    showPlaceholder: false,
    logic: `
      window.__MODULE_REGISTRY__['express'] = window.express;
      window.__RUN_MODE__ = (code, root) => {
        root.innerHTML = '';
        if (window.appInstance) window.appInstance.routes = { GET: {} };
        try { eval(code); } catch (e) { console.error(e); }
      };
    `
  },
  'express-ts': {
    name: "Express TS",
    cdns: [BABEL_CDN],
    mocks: EXPRESS_MOCK_SETUP,
    showPlaceholder: false,
    logic: `
      window.__MODULE_REGISTRY__['express'] = window.express;
      window.__RUN_MODE__ = (code, root) => {
        root.innerHTML = '';
        if (window.appInstance) window.appInstance.routes = { GET: {} };
        try {
          var exports = {};
          var module = { exports: exports };
          const transpiled = Babel.transform(code, {
            presets: [['env', { modules: 'commonjs' }], 'typescript'],
            filename: 'server.ts',
            sourceType: 'module'
          }).code;
          new Function('module', 'exports', transpiled)(module, exports);
        } catch (e) { console.error(e); }
      };
    `
  },
  hono: {
    name: "Hono",
    // Added BABEL_CDN to JS mode to support 'export default' transpilation
    cdns: [HONO_CDN, BABEL_CDN],
    mocks: HONO_MOCK_SETUP,
    showPlaceholder: false,
    logic: `
      window.__RUN_MODE__ = (code, root) => {
        root.innerHTML = '';
        const run = () => {
          if (!window.Hono || !window.Babel) {
            setTimeout(run, 50);
            return;
          }
          
          if (window.__setupHonoMock) window.__setupHonoMock(window.Hono);
          
          // Reset previous instance
          window.appInstance = null;

          try {
            // Setup CommonJS shim to capture exports
            var exports = {};
            var module = { exports: exports };
            
            // Transpile to handle 'export default'
            const transpiled = Babel.transform(code, {
                presets: [['env', { modules: 'commonjs' }]],
                filename: 'index.js',
                sourceType: 'module'
            }).code;

            // Execute code
            // We use 'call' to provide the 'this' context if needed, but mostly rely on scope
            new Function('module', 'exports', transpiled)(module, exports);

            // Check for exports
            const exportedApp = module.exports.default || module.exports;
            
            // If the user exported a Hono app, start it automatically
            if (exportedApp && typeof exportedApp.fetch === 'function') {
                window.__startHonoServer(exportedApp);
            }

          } catch (e) { console.error(e); }
        };
        run();
      };
    `
  },
  'hono-ts': {
    name: "Hono TS",
    cdns: [HONO_CDN, BABEL_CDN],
    mocks: HONO_MOCK_SETUP,
    showPlaceholder: false,
    logic: `
      window.__RUN_MODE__ = (code, root) => {
        root.innerHTML = '';
        const run = () => {
          if (!window.Hono || !window.Babel) {
            setTimeout(run, 50);
            return;
          }
          
          if (window.__setupHonoMock) window.__setupHonoMock(window.Hono);

          // Reset previous instance
          window.appInstance = null;

          try {
            // Setup CommonJS shim to capture exports
            var exports = {};
            var module = { exports: exports };

            const transpiled = Babel.transform(code, {
              presets: [['env', { modules: 'commonjs' }], 'typescript'],
              filename: 'server.ts',
              sourceType: 'module'
            }).code;
            
            new Function('module', 'exports', transpiled)(module, exports);

            // Check for exports
            const exportedApp = module.exports.default || module.exports;
            
            // If the user exported a Hono app, start it automatically
            if (exportedApp && typeof exportedApp.fetch === 'function') {
                window.__startHonoServer(exportedApp);
            }

          } catch (e) { console.error(e); }
        };
        run();
      };
    `
  },
  'node-js': {
    name: "Node JS",
    showPlaceholder: false,
    headless: true,
    logic: `
      window.__RUN_MODE__ = (code, root) => {
        root.innerHTML = '<div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; opacity:0.3;">💻 Console Environment</div>';
        try { new Function('document', 'window', 'root', code)(null, null, null); } catch (e) { console.error(e); }
      };
    `
  },
  'node-ts': {
    name: "Node TS",
    cdns: [BABEL_CDN],
    showPlaceholder: false,
    headless: true,
    logic: `
      window.__RUN_MODE__ = (code, root) => {
        root.innerHTML = '<div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; opacity:0.3;">💻 TS Console Environment</div>';
        try {
          const transpiled = Babel.transform(code, { presets: ['env', 'typescript'], filename: 'index.ts' }).code;
          new Function('document', 'window', 'root', transpiled)(null, null, null);
        } catch (e) { console.error(e); }
      };
    `
  }
};

export const getSandboxHtml = (mode: EnvironmentMode = 'dom', isPredictionMode: boolean = false): string => {
  const recipe = ENV_RECIPES[mode] || ENV_RECIPES.dom;
  return BASE_HTML_WRAPPER({
    cdns: recipe.cdns,
    mocks: recipe.mocks,
    styles: recipe.styles,
    logic: recipe.logic || '',
    showPlaceholder: isPredictionMode ? false : recipe.showPlaceholder
  });
};

export interface SandboxExecutionOptions {
  fixtureHtml?: string;
  fixtureCss?: string;
}

export const executeCodeInSandbox = (
  iframeContentWindow: Window,
  code: string,
  options?: SandboxExecutionOptions
) => {
  const message = options === undefined
    ? { type: 'EXECUTE', code }
    : { type: 'EXECUTE', code, payload: options };
  iframeContentWindow.postMessage(message, '*');
};
