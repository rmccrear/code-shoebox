import { describe, it, expect, vi } from 'vitest';
import { executeCodeInSandbox, getSandboxHtml, SANDBOX_ATTRIBUTES } from './runner';
import { EnvironmentMode } from '../types';

const ALL_MODES: EnvironmentMode[] = [
  'html', 'html-css', 'html-js', 'html-js-fetch', 'html-css-js', 'html-js-css-media', 'dom', 'fetch', 'typescript', 'p5', 'p5-ts', 'p5play', 'react', 'react-ts',
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
    for (const mode of ['react', 'react-ts'] as EnvironmentMode[]) {
      const html = getSandboxHtml(mode);
      expect(html, mode).toContain('react@18.3.1/umd/react.development.js');
      expect(html, mode).toContain('react-dom@18.3.1');
      expect(html, mode).toContain('@babel/standalone@7.26.4');
    }
    expect(getSandboxHtml('dom')).not.toContain('react@18');
  });

  it('uses pinned CDN versions for all transpiled modes', () => {
    // react and react-ts get both React UMD and Babel pinned
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
    expect(html).toContain('candidate.query !== undefined');
    expect(html).toContain('candidate.query === undefined');
    expect(html).toContain('new Response(body, { status, headers })');
    expect(html).toContain('activeRunController.abort()');
    expect(html).not.toContain('allow-same-origin');
    expect(html).not.toContain('api/air-quality');
  });

  it('combines bounded HTML/JS files with the abortable mock-fetch runtime', () => {
    const html = getSandboxHtml('html-js-fetch');

    expect(html).toContain('Content-Security-Policy');
    expect(html).toContain("connect-src 'none'");
    expect(html).toContain('window.__installFetchMock');
    expect(html).toContain('__csFiles__');
    expect(html).toContain('script[src="script.js"]');
    expect(html).toContain("new HtmlJsAsyncFunction('root', files.js)");
    expect(html).toContain('activeHtmlJsRunController.abort()');
    expect(html).toContain('script.js is not linked');
    expect(html).not.toContain('allow-same-origin');
    expect(html).not.toContain('api/air-quality');
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

  it('builds html-js as a manual DOM runner with strict local-script semantics', () => {
    const html = getSandboxHtml('html-js');
    const parseAt = html.indexOf('__csFiles__');
    const linkAt = html.indexOf('script[src="script.js"]');
    const removeAt = html.indexOf("querySelectorAll('script').forEach");
    const importAt = html.indexOf('runRoot.appendChild(document.importNode(node, true))');
    const executeAt = html.indexOf("new Function('root', files.js)(runRoot)");

    expect(parseAt).toBeGreaterThan(-1);
    expect(linkAt).toBeGreaterThan(parseAt);
    expect(removeAt).toBeGreaterThan(linkAt);
    expect(importAt).toBeGreaterThan(removeAt);
    expect(executeAt).toBeGreaterThan(importAt);
    expect(html).toContain('script.js is not linked');
    expect(html).toContain('<script src="script.js"><\\/script>');
    expect(html).not.toContain('<script src="script.js"></script> before </body>');
    expect(html).toContain('cs-hint-banner');
    expect(html).toContain('event.source !== window.parent');
    expect(html).not.toContain('allow-same-origin');
    expect(html).not.toContain("setAttribute('sandbox', '')");
    expect(html).not.toContain('unpkg.com');
    expect(html).not.toContain('esm.sh');
    expect(html).not.toContain('cdnjs');
  });

  it('builds html-css-js with independent local style and script semantics', () => {
    const html = getSandboxHtml('html-css-js');
    const cleanupAt = html.indexOf("style[data-code-shoebox-html-css-js]");
    const parseAt = html.indexOf('__csFiles__');
    const styleLinkAt = html.indexOf('link[rel="stylesheet"][href="style.css"]');
    const scriptLinkAt = html.indexOf('script[src="script.js"]');
    const scriptRemoveAt = html.indexOf("querySelectorAll('script').forEach");
    const linkRemoveAt = html.indexOf("querySelectorAll('link[rel~=\"stylesheet\"]')");
    const styleTextAt = html.indexOf('style.textContent = files.css');
    const styleAppendAt = html.indexOf('document.head.appendChild(style)');
    const importAt = html.indexOf('root.appendChild(document.importNode(node, true))');
    const executeAt = html.indexOf("new Function('root', files.js)(root)");

    expect(cleanupAt).toBeGreaterThan(-1);
    expect(parseAt).toBeGreaterThan(cleanupAt);
    expect(styleLinkAt).toBeGreaterThan(parseAt);
    expect(scriptLinkAt).toBeGreaterThan(styleLinkAt);
    expect(scriptRemoveAt).toBeGreaterThan(scriptLinkAt);
    expect(linkRemoveAt).toBeGreaterThan(scriptRemoveAt);
    expect(styleTextAt).toBeGreaterThan(linkRemoveAt);
    expect(styleAppendAt).toBeGreaterThan(styleTextAt);
    expect(importAt).toBeGreaterThan(styleAppendAt);
    expect(executeAt).toBeGreaterThan(importAt);
    expect(html.indexOf('style.css is not linked')).toBeLessThan(html.indexOf('script.js is not linked'));
    expect(html).toContain('<script src="script.js"><\\/script>');
    expect(html).toContain('cs-hint-banner');
    expect(html).toContain('event.source !== window.parent');
    expect(html).not.toContain('allow-same-origin');
    expect(html).not.toContain("setAttribute('sandbox', '')");
    expect(html).not.toContain('unpkg.com');
    expect(html).not.toContain('esm.sh');
    expect(html).not.toContain('cdnjs');
  });

  it('reuses the three-file sandbox contract for html-js-css-media', () => {
    const html = getSandboxHtml('html-js-css-media');

    for (const marker of [
      '__csFiles__',
      'link[rel="stylesheet"][href="style.css"]',
      'script[src="script.js"]',
      "querySelectorAll('script').forEach",
      'style.textContent = files.css',
      "new Function('root', files.js)(root)",
      'style.css is not linked',
      'script.js is not linked',
    ]) {
      expect(html).toContain(marker);
    }
    expect(html).toContain('event.source !== window.parent');
    expect(html).not.toContain('allow-same-origin');
    expect(html).not.toContain('mediaAssets');
    expect(html).not.toContain('interactive-examples.mdn.mozilla.net');
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
