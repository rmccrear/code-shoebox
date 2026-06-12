import { describe, it, expect } from 'vitest';
import { getSandboxHtml, SANDBOX_ATTRIBUTES } from './runner';
import { EnvironmentMode } from '../types';

const ALL_MODES: EnvironmentMode[] = [
  'html', 'html-css', 'dom', 'typescript', 'p5', 'p5-ts', 'react', 'react-ts',
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

  it('wires up the server mock setup for server modes', () => {
    // Express modes register the express mock in the module registry.
    expect(getSandboxHtml('express')).toContain("window.__MODULE_REGISTRY__['express']");
    expect(getSandboxHtml('express-ts')).toContain("window.__MODULE_REGISTRY__['express']");
    // Hono modes install the server bridge + import Hono via ESM.
    for (const mode of ['hono', 'hono-ts'] as EnvironmentMode[]) {
      const html = getSandboxHtml(mode);
      expect(html, mode).toContain('window.__startHonoServer');
      expect(html, mode).toContain('esm.sh/hono');
    }
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
});
