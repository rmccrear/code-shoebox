import { describe, it, expect, vi } from 'vitest';
import { executeCodeInSandbox, getSandboxHtml, SANDBOX_ATTRIBUTES } from './runner';
import { EnvironmentMode } from '../types';
import type { MockApiConfig } from '../types';
import { FETCH_MOCK_SETUP } from './templates/fetch';

const ALL_MODES: EnvironmentMode[] = [
  'html', 'html-css', 'html-js', 'html-js-fetch', 'html-css-js', 'html-js-css-media', 'dom', 'fetch', 'typescript', 'p5', 'p5-ts', 'p5play', 'react', 'react-app', 'react-ts',
  'express', 'express-ts', 'hono', 'hono-ts', 'node-js', 'node-ts'
];

describe('getSandboxHtml', () => {
  it('produces a self-contained HTML document for every environment mode', () => {
    for (const mode of ALL_MODES) {
      const html = getSandboxHtml(mode);
      expect(html, `mode=${mode}`).toContain('<!DOCTYPE html>');
      // The kernel + a per-mode executor must always be present.
      expect(html, `mode=${mode}`).toContain('window.__RUN_MODE__');
      expect(html, `mode=${mode}`).toContain('<div id="root">');
    }
  });

  it('falls back to the dom recipe for an unknown mode', () => {
    const unknown = getSandboxHtml('totally-bogus' as EnvironmentMode);
    expect(unknown).toBe(getSandboxHtml('dom'));
  });

  it('embeds React + Babel CDNs only for React modes', () => {
    for (const mode of ['react', 'react-app', 'react-ts'] as EnvironmentMode[]) {
      const html = getSandboxHtml(mode);
      expect(html, mode).toContain('react@18.3.1/umd/react.development.js');
      expect(html, mode).toContain('react-dom@18.3.1');
      expect(html, mode).toContain('@babel/standalone@7.26.4');
    }
    expect(getSandboxHtml('dom')).not.toContain('react@18');
  });

  it('builds react-app around a captured default ES module export and automatic mounting', () => {
    const html = getSandboxHtml('react-app');

    expect(html).toContain('react@18.3.1/umd/react.development.js');
    expect(html).toContain('react-dom@18.3.1/umd/react-dom.development.js');
    expect(html).toContain('@babel/standalone@7.26.4/babel.min.js');
    expect(html).toContain("presets: ['react', ['env', { modules: 'commonjs' }]]");
    expect(html).toContain('filename: fileName');
    expect(html).toContain("sourceType: 'module'");
    expect(html).toContain("sourceFiles['App.css']");
    expect(html).toContain("specifier === './App.css'");
    expect(html).toContain('shouldInstallCss = true');
    expect(html).toContain("learnerStyle.textContent = files['App.css']");
    expect(html.indexOf("new Function('module', 'exports', 'require', compiled)")).toBeLessThan(
      html.indexOf("learnerStyle.textContent = files['App.css']")
    );
    expect(html).toContain("data-code-shoebox-react-app");
    expect(html).toContain('learnerStyle.remove()');
    expect(html).toContain("specifier === 'react' || specifier === 'react-dom/client'");
    expect(html).toContain('const module = { exports: {} }');
    expect(html).toContain("new Function('module', 'exports', 'require', compiled)");
    expect(html).toContain("executeModule('App.jsx').default");
    expect(html).toContain('moduleCache[fileName] = module');
    expect(html).toContain('delete moduleCache[fileName]');
    expect(html).toContain("const resolvedName = localMatch[1] + '.jsx'");
    expect(html).toContain('return executeModule(resolvedName)');
    expect(html).toContain('Cannot resolve "');
    expect(html).toContain('imported from "');
    expect(html).toContain('at most two component JSX files');
    expect(html).toContain("module === 'react-dom/client'");
    expect(html).toContain('rootInstance.unmount()');
    expect(html).toContain('window.ReactDOM.createRoot(root)');
    expect(html).toContain('window.React.createElement(App)');
    expect(html).toContain('React App mode requires a default export. Add `export default App`.');
  });

  it('installs HTML stylesheets before local CSS and cleans them up on rerun', () => {
    const html = getSandboxHtml('react-app');
    const logic = html.slice(html.indexOf('let rootInstance = null;'), html.lastIndexOf('</script>'));
    const fakeWindow = {
      ReactDOM: { createRoot: () => ({ render: vi.fn(), unmount: vi.fn() }) },
      React: { createElement: vi.fn() },
      require: vi.fn(),
      __RUN_MODE__: undefined as unknown as (code: string, root: HTMLElement) => void,
    };
    const babel = { transform: () => ({ code: "require('./App.css'); module.exports.default = function App() {};" }) };
    new Function('window', 'document', 'DOMParser', 'Babel', logic)(fakeWindow, document, DOMParser, babel);
    const root = document.createElement('div');
    fakeWindow.__RUN_MODE__(JSON.stringify({ __csFiles__: 1, files: {
      'App.jsx': '',
      'App.css': 'h1 { color: red; }',
      'index.html': '<head><link rel="stylesheet" href="https://example.com/library.css"><script>throw new Error("must not run")</script></head>',
    } }), root);
    const link = document.head.querySelector('link[href="https://example.com/library.css"]');
    const style = document.head.querySelector('[data-code-shoebox-react-app]');
    expect(link).not.toBeNull();
    expect(style?.textContent).toContain('color: red');
    expect(Array.from(document.head.children).indexOf(link!)).toBeLessThan(Array.from(document.head.children).indexOf(style!));
    fakeWindow.__RUN_MODE__(JSON.stringify({ __csFiles__: 1, files: { 'App.jsx': '' } }), root);
    expect(link?.isConnected).toBe(false);
    expect(style?.isConnected).toBe(false);
    document.head.querySelector('[data-code-shoebox-react-app]')?.remove();
  });

  it('enables the React App mock backend and network containment only when requested', () => {
    const enabled = getSandboxHtml('react-app', false, { mockApiEnabled: true });
    const ordinary = getSandboxHtml('react-app');
    expect(enabled).toContain('window.__installFetchMock = (rawConfig');
    expect(enabled).toContain("connect-src 'none'");
    expect(enabled).toContain('react@18.3.1');
    expect(ordinary).not.toContain('window.__installFetchMock = (rawConfig');
    expect(ordinary).not.toContain("connect-src 'none'");
    expect(getSandboxHtml('react-app', false, { mockApiEnabled: false })).toBe(ordinary);
    expect(getSandboxHtml('dom', false, { mockApiEnabled: true })).toBe(getSandboxHtml('dom'));
  });

  it('keeps React requests alive after rendering, aborts on rerun, and installs updated routes before modules', async () => {
    vi.useFakeTimers();
    try {
      const html = getSandboxHtml('react-app', false, { mockApiEnabled: true });
      const logic = html.slice(html.indexOf('let rootInstance = null;'), html.lastIndexOf('</script>'));
      const signals: AbortSignal[] = [];
      const order: string[] = [];
      const pending: Promise<Response>[] = [];
      const fakeWindow = {
        ReactDOM: { createRoot: () => ({ render: vi.fn(), unmount: () => order.push('unmount') }) },
        React: { createElement: vi.fn() },
        require: vi.fn(),
        fetch: undefined as unknown as typeof fetch,
        __installFetchMock: undefined as unknown as (config: MockApiConfig, signal: AbortSignal) => void,
        __RUN_MODE__: undefined as unknown as (code: string, root: HTMLElement, options: { mockApi: MockApiConfig }) => void,
      };
      new Function('window', FETCH_MOCK_SETUP)(fakeWindow);
      const installer = fakeWindow.__installFetchMock;
      fakeWindow.__installFetchMock = (config, signal) => {
        signals.push(signal);
        signal.addEventListener('abort', () => order.push('abort'));
        order.push('install');
        installer(config, signal);
      };
      const babel = { transform: () => {
        order.push('module');
        pending.push(fakeWindow.fetch('/api/items'));
        return { code: 'module.exports.default = function App() {};' };
      } };
      new Function('window', 'document', 'DOMParser', 'Babel', logic)(fakeWindow, document, DOMParser, babel);
      const root = document.createElement('div');
      fakeWindow.__RUN_MODE__('', root, { mockApi: { defaultDelayMs: 500, routes: [{ method: 'GET', path: '/api/items', body: ['old'] }] } });
      const aborted = expect(pending[0]).rejects.toMatchObject({ name: 'AbortError' });
      expect(signals[0].aborted).toBe(false);
      expect(order).toEqual(['install', 'module']);

      fakeWindow.__RUN_MODE__('', root, { mockApi: { defaultDelayMs: 0, routes: [{ method: 'GET', path: '/api/items', body: ['new'] }] } });
      expect(order).toEqual(['install', 'module', 'unmount', 'abort', 'install', 'module']);
      await aborted;
      await vi.runAllTimersAsync();
      await expect((await pending[1]).json()).resolves.toEqual(['new']);
      expect(signals[1].aborted).toBe(false);
    } finally {
      vi.clearAllTimers();
      vi.useRealTimers();
    }
  });

  it('aborts the React run controller on compilation failure and page exit', () => {
    const html = getSandboxHtml('react-app', false, { mockApiEnabled: true });
    const logic = html.slice(html.indexOf('let rootInstance = null;'), html.lastIndexOf('</script>'));
    const signals: AbortSignal[] = [];
    const events = new EventTarget();
    const fakeWindow = {
      ReactDOM: { createRoot: () => ({ render: vi.fn(), unmount: vi.fn() }) },
      React: { createElement: vi.fn() },
      addEventListener: events.addEventListener.bind(events),
      __installFetchMock: (_config: unknown, signal: AbortSignal) => signals.push(signal),
      __RUN_MODE__: undefined as unknown as (code: string, root: HTMLElement) => void,
    };
    const babel = { transform: vi.fn(() => ({ code: 'module.exports.default = function App() {};' })) };
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      new Function('window', 'document', 'DOMParser', 'Babel', logic)(fakeWindow, document, DOMParser, babel);
      const root = document.createElement('div');
      fakeWindow.__RUN_MODE__('', root);
      events.dispatchEvent(new Event('pagehide'));
      expect(signals[0].aborted).toBe(true);
      babel.transform.mockImplementationOnce(() => { throw new Error('invalid JSX'); });
      fakeWindow.__RUN_MODE__('', root);
      expect(signals[1].aborted).toBe(true);
      expect(log).toHaveBeenCalledWith(expect.objectContaining({ message: 'Error in "App.jsx": invalid JSX' }));
      babel.transform.mockReturnValueOnce({ code: 'throw new Error("module failed");' });
      fakeWindow.__RUN_MODE__('', root);
      expect(signals[2].aborted).toBe(true);
      expect(log).toHaveBeenCalledWith(expect.objectContaining({ message: 'Error in "App.jsx": module failed' }));
    } finally {
      log.mockRestore();
    }
  });

  it('uses pinned CDN versions for all transpiled modes', () => {
    // React modes get both React UMD and Babel pinned
    expect(getSandboxHtml('react')).toContain('react@18.3.1');
    expect(getSandboxHtml('react')).toContain('@babel/standalone@7.26.4');
    // typescript mode only needs Babel
    expect(getSandboxHtml('typescript')).toContain('@babel/standalone@7.26.4');
    // no mode should contain the old unpinned Babel URL
    const unpinnedBabel = /unpkg\.com\/@babel\/standalone\/babel/;
    for (const mode of ALL_MODES) {
      expect(getSandboxHtml(mode), `mode=${mode} has unpinned Babel URL`).not.toMatch(unpinnedBabel);
    }
  });

  it('embeds the p5 CDN for p5 modes', () => {
    expect(getSandboxHtml('p5')).toContain('p5.min.js');
    expect(getSandboxHtml('p5-ts')).toContain('p5.min.js');
    expect(getSandboxHtml('dom')).not.toContain('p5.min.js');
  });

  it('embeds p5 and the tagged p5.play fork in order for p5play mode', () => {
    const html = getSandboxHtml('p5play');
    const p5At = html.indexOf('p5.min.js');
    const playUrl = 'https://cdn.jsdelivr.net/gh/rmccrear/p5.play@v2.0.0-codex.1/lib/p5.play.js';
    const playAt = html.indexOf(playUrl);
    expect(p5At).toBeGreaterThan(-1);
    expect(html).not.toContain('alphaTint');
    expect(playAt).toBeGreaterThan(p5At);
    // plain p5 mode must not pull the sprite library
    expect(getSandboxHtml('p5')).not.toContain('p5.play.js');
  });

  it('wires up the server mock setup for server modes', () => {
    // Express modes register the express mock in the module registry.
    expect(getSandboxHtml('express')).toContain("window.__MODULE_REGISTRY__['express']");
    expect(getSandboxHtml('express-ts')).toContain("window.__MODULE_REGISTRY__['express']");
    expect(getSandboxHtml('express')).toContain('[Express Mock] Simulation error');
    expect(getSandboxHtml('express-ts')).toContain('[Express Mock] Simulation error');
    // Hono modes install the server bridge + import Hono via ESM.
    for (const mode of ['hono', 'hono-ts'] as EnvironmentMode[]) {
      const html = getSandboxHtml(mode);
      expect(html, mode).toContain('window.__startHonoServer');
      expect(html, mode).toContain('esm.sh/hono');
    }
  });

  it('builds fetch mode with top-level await, local mock routes, and network containment', () => {
    const html = getSandboxHtml('fetch');

    expect(html).toContain('Content-Security-Policy');
    expect(html).toContain("connect-src 'none'");
    expect(html).toContain('window.__installFetchMock');
    expect(html).toContain("new AsyncFunction('root', code)");
    expect(html).toContain('await new AsyncFunction');
    expect(html).toContain('candidate.requestHeaders === undefined || headersMatch');
    expect(html).toContain('candidate.requestBody === undefined ||');
    expect(html).toContain('requestBody.hasJson && jsonEquals');
    expect(html).toContain('routeSpecificity(right.candidate)');
    expect(html).toContain('new Response(body, { status, headers })');
    expect(html).toContain('activeRunController.abort()');
    expect(html).not.toContain('allow-same-origin');
    expect(html).not.toContain('api/air-quality');
  });

  it('builds the html-js family around one isolated nested page frame', () => {
    for (const mode of ['html-js', 'html-js-fetch', 'html-css-js', 'html-js-css-media'] as EnvironmentMode[]) {
      const html = getSandboxHtml(mode);
      expect(html, mode).toContain('PAGE_FRAME_SANDBOX = "allow-scripts allow-modals allow-forms"');
      expect(html, mode).toContain('event.source !== page.frame.contentWindow');
      expect(html, mode).toContain('event.source !== window.parent');
      expect(html, mode).not.toContain('allow-same-origin');
      // The kernel no longer runs learner script.js itself.
      expect(html, mode).not.toContain("new Function('root', files.js)");
      // The bridge literal must never close the kernel's own script element.
      expect(html.split('</script>').length - 1, mode).toBe(1);
      expect(html, mode).not.toContain('unpkg.com');
      expect(html, mode).not.toContain('esm.sh');
      expect(html, mode).not.toContain('cdnjs');
    }
  });

  it('ships the fetch mock only inside the html-js-fetch page bridge, under connect-src none', () => {
    const html = getSandboxHtml('html-js-fetch');
    expect(html).toContain("connect-src 'none'");
    expect(html).toContain('window.__installFetchMock');
    expect(html).not.toContain('api/air-quality');
    expect(getSandboxHtml('html-js')).not.toContain('__installFetchMock = ');
    expect(getSandboxHtml('html-css-js')).not.toContain('__installFetchMock = ');
  });

  it('keeps media assets out of the html-js-css-media sandbox', () => {
    const html = getSandboxHtml('html-js-css-media');
    expect(html).not.toContain('mediaAssets');
    expect(html).not.toContain('interactive-examples.mdn.mozilla.net');
  });

  it('shows the output placeholder for visual modes but hides it for server modes', () => {
    expect(getSandboxHtml('dom')).toContain('id="placeholder"');
    expect(getSandboxHtml('express')).not.toContain('id="placeholder"');
    expect(getSandboxHtml('hono')).not.toContain('id="placeholder"');
  });

  it('builds the html-css mode around the same sandboxed frame plus bundle parsing and link resolution', () => {
    const html = getSandboxHtml('html-css');
    expect(html).toContain("setAttribute('sandbox', '')");
    // Inline bundle parser (kept in sync with runtime/fileBundle.ts).
    expect(html).toContain('__csFiles__');
    // Strict link semantics + the unlinked-stylesheet hint banner.
    expect(html).toContain('link[rel="stylesheet"][href="style.css"]');
    expect(html).toContain('cs-hint-banner');
    expect(html).toContain('cs-script-banner');
    expect(html).not.toContain('id="placeholder"');
    expect(html).not.toContain('unpkg.com');
    expect(html).not.toContain('esm.sh');
    expect(html).not.toContain('cdnjs');
  });

  it('builds the html mode around a nested fully-sandboxed iframe with no CDNs', () => {
    const html = getSandboxHtml('html');
    // The inner frame's empty sandbox attribute is the script-blocking mechanism.
    expect(html).toContain("setAttribute('sandbox', '')");
    // Script detection only feeds the learner-facing banner.
    expect(html).toContain('cs-script-banner');
    expect(html).toContain('DOMParser');
    // Renders on mount, so no placeholder; loads nothing from the network.
    expect(html).not.toContain('id="placeholder"');
    expect(html).not.toContain('unpkg.com');
    expect(html).not.toContain('esm.sh');
    expect(html).not.toContain('cdnjs');
  });

  it('suppresses the placeholder in prediction mode even for visual modes', () => {
    expect(getSandboxHtml('dom', /* isPredictionMode */ true)).not.toContain('id="placeholder"');
  });

  it('exposes a sandbox attribute string that denies same-origin access', () => {
    expect(SANDBOX_ATTRIBUTES).toContain('allow-scripts');
    expect(SANDBOX_ATTRIBUTES).not.toContain('allow-same-origin');
  });

  it('guards every window message listener with an event.source check', () => {
    const GUARD = 'event.source !== window.parent';
    for (const mode of ALL_MODES) {
      const html = getSandboxHtml(mode);
      // The kernel listener guard must be present in every mode.
      expect(html, `mode=${mode} missing kernel guard`).toContain(GUARD);
    }
    // Express and hono modes embed the kernel guard PLUS one in their mock
    // fallback window listener — so the string must appear at least twice.
    for (const mode of ['express', 'express-ts', 'hono', 'hono-ts'] as EnvironmentMode[]) {
      const html = getSandboxHtml(mode);
      const occurrences = html.split(GUARD).length - 1;
      expect(occurrences, `mode=${mode} expected >=2 source guards, got ${occurrences}`).toBeGreaterThanOrEqual(2);
    }
  });

  it('installs DOM fixtures after reset and before learner execution', () => {
    const html = getSandboxHtml('dom');
    const resetAt = html.indexOf('root.replaceChildren()');
    const styleAt = html.indexOf("fixtureStyle.setAttribute('data-code-shoebox-fixture', '')");
    const fixtureAt = html.indexOf("new DOMParser().parseFromString(options.fixtureHtml, 'text/html')");
    const executeAt = html.indexOf("new Function('root', code)(root)");

    expect(resetAt).toBeGreaterThan(-1);
    expect(styleAt).toBeGreaterThan(resetAt);
    expect(fixtureAt).toBeGreaterThan(styleAt);
    expect(executeAt).toBeGreaterThan(fixtureAt);
  });

  it('passes EXECUTE payloads to recipes and includes readable error formatting', () => {
    const html = getSandboxHtml('dom');

    expect(html).toContain('window.__RUN_MODE__(code, root, payload || {})');
    expect(html).toContain('function formatRuntimeValue(value)');
    expect(html).toContain("value.name + ': ' + value.message");
    expect(html).toContain("window.addEventListener('unhandledrejection'");
    expect(html).toContain("formatRuntimeValue(event.reason)");
    expect(html).toContain('original.apply(console, args)');
  });

  it('does not forward the EXECUTE lifecycle message to the learner console', () => {
    for (const mode of ALL_MODES) {
      expect(getSandboxHtml(mode), `mode=${mode}`).not.toContain(
        'console.log("[Kernel] Received EXECUTE signal.")'
      );
    }
  });
});

describe('HTML page rendering', () => {
  const bundle = (html: string, css = '', js = '') => JSON.stringify({
    __csFiles__: 1, files: { 'index.html': html, 'style.css': css, 'script.js': js },
  });
  const createRunner = (mode: EnvironmentMode) => {
    const html = getSandboxHtml(mode);
    const stateAt = html.indexOf('const PAGE_HAS_CSS_TAB');
    const logic = html.slice(stateAt >= 0 ? stateAt : html.indexOf('window.__RUN_MODE__ ='), html.lastIndexOf('</script>'));
    const listeners: Array<(event: { source: unknown; data: unknown }) => void> = [];
    const sent: Array<[string, unknown]> = [];
    const host = {
      __RUN_MODE__: undefined as unknown as (code: string, root: HTMLElement, options?: object) => unknown,
      addEventListener: (type: string, listener: (typeof listeners)[number]) => {
        if (type === 'message') listeners.push(listener);
      },
    };
    const sendPayload = (type: string, payload: unknown) => sent.push([type, payload]);
    new Function('window', 'document', 'DOMParser', 'sendPayload', logic)(host, document, DOMParser, sendPayload);
    const root = document.createElement('div');
    document.body.appendChild(root);
    return {
      root,
      sent,
      run: (code: string, options?: object) => host.__RUN_MODE__(code, root, options),
      dispatch: (source: unknown, data: unknown) => listeners.forEach(listener => listener({ source, data })),
      cleanup: () => { host.__RUN_MODE__('', root); root.remove(); },
    };
  };

  it.each(['html', 'html-css'] as const)('%s preserves external stylesheet links', (mode) => {
    const runner = createRunner(mode);
    try {
      const html = '<html data-theme="light" lang="fr"><head><link rel="stylesheet" href="https://example.com/theme.css"></head><body><p>Page</p></body></html>';
      runner.run(mode === 'html' ? html : bundle(html));
      const frame = runner.root.querySelector('iframe')!;
      const rendered = new DOMParser().parseFromString(frame.srcdoc, 'text/html');
      expect(rendered.querySelector('link')?.getAttribute('href')).toBe('https://example.com/theme.css');
      expect(rendered.documentElement.getAttribute('data-theme')).toBe('light');
      expect(rendered.documentElement.getAttribute('lang')).toBe('fr');
    } finally { runner.cleanup(); }
  });

  const pageOf = (root: HTMLElement) => {
    const frame = root.querySelector('iframe')!;
    return { frame, doc: new DOMParser().parseFromString(frame.srcdoc, 'text/html') };
  };

  describe.each(['html-js', 'html-js-fetch', 'html-css-js', 'html-js-css-media'] as const)('%s page frame', (mode) => {
    const cssTab = mode === 'html-css-js' || mode === 'html-js-css-media';

    it('renders the page in its own sandboxed document, never same-origin', () => {
      const runner = createRunner(mode);
      try {
        runner.run(bundle('<body><p>Page</p><script src="script.js"></script></body>', '', 'root.dataset.x = 1;'));
        const { frame } = pageOf(runner.root);
        expect(frame.getAttribute('sandbox')).toBe(SANDBOX_ATTRIBUTES);
        expect(frame.getAttribute('sandbox')).not.toContain('allow-same-origin');
        expect(frame.className).toBe('cs-html-frame');
        // Learner markup lives in the frame, not in the kernel's root.
        expect(runner.root.querySelector('p')).toBeNull();
        expect(document.head.querySelector('style:not([data-code-shoebox-fixture])')).toBeNull();
      } finally { runner.cleanup(); }
    });

    it('keeps html and body rules, html attributes, and head content in the page document', () => {
      const runner = createRunner(mode);
      const kernelHtml = document.documentElement;
      try {
        runner.run(bundle(`<html data-theme="light" lang="fr"><head><title>Planner</title>
          <style>body { min-height: 100vh; display: grid; place-items: center; }</style>
          <link rel="stylesheet" href="https://example.com/theme.css" media="screen" crossorigin="anonymous">
          </head><body class="lesson"><h1>Top</h1></body></html>`));
        const { doc } = pageOf(runner.root);
        expect(doc.documentElement.getAttribute('data-theme')).toBe('light');
        expect(doc.documentElement.getAttribute('lang')).toBe('fr');
        expect(doc.body.className).toBe('lesson');
        expect(doc.title).toBe('Planner');
        expect(doc.querySelector('style')?.textContent).toContain('place-items: center');
        const link = doc.querySelector('link[rel="stylesheet"]')!;
        expect(link.getAttribute('href')).toBe('https://example.com/theme.css');
        expect(link.getAttribute('media')).toBe('screen');
        expect(link.getAttribute('crossorigin')).toBe('anonymous');
        // The kernel document is untouched.
        expect(kernelHtml.hasAttribute('data-theme')).toBe(false);
        expect(kernelHtml.hasAttribute('lang')).toBe(false);
      } finally { runner.cleanup(); }
    });

    it('puts the fixed bridge first, strips learner scripts, and keeps script.js out of srcdoc', () => {
      const runner = createRunner(mode);
      try {
        runner.run(bundle(
          '<head><script>window.inline = 1</script></head><body><p>Page</p><noscript><p>No JS</p></noscript><script src="https://example.com/x.js"></script><script src="script.js"></script></body>',
          '', 'window.SECRET_MARKER_FROM_SCRIPT_JS = 1;'));
        const { frame, doc } = pageOf(runner.root);
        const scripts = Array.from(doc.querySelectorAll('script'));
        expect(scripts).toHaveLength(1);
        expect(scripts[0].hasAttribute('src')).toBe(false);
        expect(scripts[0].textContent).toContain("data.type !== 'CS_PAGE_RUN'");
        expect(doc.head.firstElementChild).toBe(scripts[0]);
        expect(doc.querySelector('noscript')).toBeNull();
        expect(frame.srcdoc).not.toContain('SECRET_MARKER_FROM_SCRIPT_JS');
        expect(frame.srcdoc).not.toContain('window.inline');
        expect(scripts[0].textContent!.includes('window.__installFetchMock = ')).toBe(mode === 'html-js-fetch');
      } finally { runner.cleanup(); }
    });

    it('copies the kernel CSP into the page head ahead of the bridge', () => {
      const runner = createRunner(mode);
      const policy = document.createElement('meta');
      policy.setAttribute('http-equiv', 'Content-Security-Policy');
      policy.setAttribute('content', "connect-src 'none'");
      document.head.appendChild(policy);
      try {
        runner.run(bundle('<head><link rel="stylesheet" href="https://example.com/a.css"></head><body>x</body>'));
        const first = pageOf(runner.root).doc.head.firstElementChild!;
        expect(first.tagName).toBe('META');
        expect(first.getAttribute('content')).toBe("connect-src 'none'");
        expect(first.nextElementSibling?.tagName).toBe('SCRIPT');
      } finally { runner.cleanup(); policy.remove(); }
    });

    it('sends script.js and mock routes to the current frame only after it reports ready', async () => {
      const runner = createRunner(mode);
      try {
        const mockApi = { routes: [{ path: '/api/x', body: { ok: true } }] };
        const done = vi.fn();
        const execution = Promise.resolve(runner.run(
          bundle('<body><script src="script.js"></script></body>', '', 'root.dataset.ran = "yes";'),
          { mockApi },
        )).then(done);
        const { frame } = pageOf(runner.root);
        const post = vi.spyOn(frame.contentWindow!, 'postMessage').mockImplementation(() => {});

        // Messages from anything other than the current page frame are ignored.
        runner.dispatch(window, { type: 'CS_PAGE_READY' });
        runner.dispatch(window, { type: 'CONSOLE_LOG', payload: 'forged' });
        expect(post).not.toHaveBeenCalled();

        runner.dispatch(frame.contentWindow, { type: 'CS_PAGE_READY' });
        runner.dispatch(frame.contentWindow, { type: 'CS_PAGE_READY' });
        expect(post).toHaveBeenCalledTimes(1);
        expect(post).toHaveBeenCalledWith(
          { type: 'CS_PAGE_RUN', js: 'root.dataset.ran = "yes";', mockApi }, '*');

        runner.dispatch(frame.contentWindow, { type: 'CONSOLE_LOG', payload: 'hello' });
        runner.dispatch(frame.contentWindow, { type: 'RUNTIME_ERROR', payload: { toString: () => 'Boom' } });
        runner.dispatch(frame.contentWindow, { type: 'EXECUTION_COMPLETE', payload: {} });
        runner.dispatch(frame.contentWindow, { type: 'SERVER_READY' });
        expect(runner.sent).toEqual([['CONSOLE_LOG', 'hello'], ['RUNTIME_ERROR', 'Boom']]);

        await Promise.resolve();
        expect(done).not.toHaveBeenCalled();
        runner.dispatch(frame.contentWindow, { type: 'CS_PAGE_DONE' });
        await execution;
        expect(done).toHaveBeenCalled();
      } finally { runner.cleanup(); }
    });

    it('replaces the frame on rerun and ignores the old one', async () => {
      const runner = createRunner(mode);
      try {
        const first = runner.run(bundle('<body>One<script src="script.js"></script></body>', '', 'x()'));
        const oldWindow = pageOf(runner.root).frame.contentWindow;
        runner.run(bundle('<body>Two</body>'));
        await first; // superseded runs settle instead of hanging
        expect(runner.root.querySelectorAll('iframe')).toHaveLength(1);
        runner.dispatch(oldWindow, { type: 'CONSOLE_LOG', payload: 'stale' });
        expect(runner.sent).toEqual([]);
        expect(pageOf(runner.root).doc.body.textContent).toContain('Two');
      } finally { runner.cleanup(); }
    });

    it('sends no script when script.js is not linked and shows the hint', () => {
      const runner = createRunner(mode);
      try {
        runner.run(bundle('<p>Page</p>', '', 'throw new Error("unlinked");'));
        const { frame } = pageOf(runner.root);
        const post = vi.spyOn(frame.contentWindow!, 'postMessage').mockImplementation(() => {});
        runner.dispatch(frame.contentWindow, { type: 'CS_PAGE_READY' });
        expect(post).toHaveBeenCalledWith(expect.objectContaining({ js: null }), '*');
        expect(runner.root.textContent).toContain('script.js is not linked');
      } finally { runner.cleanup(); }
    });

    if (cssTab) {
      it('inlines exact style.css links in place and cannot break out of the style element', () => {
        const runner = createRunner(mode);
        try {
          runner.run(bundle(
            '<head><link rel="stylesheet" href="https://example.com/a.css"><link rel="stylesheet" href="style.css"><style>p { color: blue; }</style></head><body><p>Page</p></body>',
            'p { color: green; } /* </style><script>window.escaped = 1</script> */'));
          const { doc } = pageOf(runner.root);
          const sheets = Array.from(doc.head.querySelectorAll('link[rel="stylesheet"], style'));
          expect(sheets.map(node => node.tagName)).toEqual(['LINK', 'STYLE', 'STYLE']);
          expect(sheets[1].textContent).toContain('p { color: green; }');
          expect(sheets[2].textContent).toBe('p { color: blue; }');
          expect(doc.querySelectorAll('script')).toHaveLength(1);
          expect(runner.root.querySelector('.cs-hint-banner')).toBeNull();
        } finally { runner.cleanup(); }
      });

      it('shows the style.css hint before the script.js hint', () => {
        const runner = createRunner(mode);
        try {
          runner.run(bundle('<p>Page</p>', 'p { color: red; }', 'x()'));
          const hints = Array.from(runner.root.querySelectorAll('.cs-hint-banner')).map(node => node.textContent);
          expect(hints).toHaveLength(2);
          expect(hints[0]).toContain('style.css is not linked');
          expect(hints[1]).toContain('script.js is not linked');
        } finally { runner.cleanup(); }
      });
    } else {
      it('has no CSS tab: style.css links stay as plain links', () => {
        const runner = createRunner(mode);
        try {
          runner.run(bundle('<head><link rel="stylesheet" href="style.css"></head><body>x</body>', 'p { color: red; }'));
          expect(pageOf(runner.root).doc.querySelector('link[href="style.css"]')).not.toBeNull();
          expect(runner.root.textContent).not.toContain('style.css is not linked');
        } finally { runner.cleanup(); }
      });
    }
  });
});

describe('executeCodeInSandbox', () => {
  it('preserves the old two-argument EXECUTE message shape', () => {
    const postMessage = vi.fn();

    executeCodeInSandbox({ postMessage } as unknown as Window, 'console.log("old")');

    expect(postMessage).toHaveBeenCalledWith(
      { type: 'EXECUTE', code: 'console.log("old")' },
      '*'
    );
  });

  it('sends exact fixture strings as structured message data, never sandbox HTML', () => {
    const postMessage = vi.fn();
    const fixtureHtml = '<div data-value="` ${danger}"></div><\/script>';
    const fixtureCss = 'div::after { content: "quotes ` ${css}"; }';

    executeCodeInSandbox(
      { postMessage } as unknown as Window,
      'console.log("fixture")',
      { fixtureHtml, fixtureCss }
    );

    expect(postMessage).toHaveBeenCalledWith({
      type: 'EXECUTE',
      code: 'console.log("fixture")',
      payload: { fixtureHtml, fixtureCss },
    }, '*');
    expect(getSandboxHtml('dom')).not.toContain(fixtureHtml);
    expect(getSandboxHtml('dom')).not.toContain(fixtureCss);
  });

  it('sends mock API fixtures as structured payload data with an execution id', () => {
    const postMessage = vi.fn();
    const mockApi = {
      defaultDelayMs: 1000,
      routes: [{ method: 'GET' as const, path: '/api/readings', body: [{ aqi: 42 }] }],
    };

    executeCodeInSandbox(
      { postMessage } as unknown as Window,
      'let response = await fetch("/api/readings");',
      { mockApi },
      7
    );

    expect(postMessage).toHaveBeenCalledWith({
      type: 'EXECUTE',
      code: 'let response = await fetch("/api/readings");',
      payload: { mockApi },
      executionId: 7,
    }, '*');
    expect(getSandboxHtml('fetch')).not.toContain('/api/readings');
  });
});
