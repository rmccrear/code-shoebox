import { describe, it, expect } from 'vitest';
import { getSandboxHtml, SANDBOX_ATTRIBUTES } from './runner';
import { EnvironmentMode } from '../types';

const ALL_MODES: EnvironmentMode[] = [
  'dom', 'typescript', 'p5', 'p5-ts', 'react', 'react-ts',
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
      expect(html, mode).toContain('react@18/umd/react.development.js');
      expect(html, mode).toContain('react-dom@18');
      expect(html, mode).toContain('@babel/standalone');
    }
    expect(getSandboxHtml('dom')).not.toContain('react@18');
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

  it('suppresses the placeholder in prediction mode even for visual modes', () => {
    expect(getSandboxHtml('dom', /* isPredictionMode */ true)).not.toContain('id="placeholder"');
  });

  it('exposes a sandbox attribute string that denies same-origin access', () => {
    expect(SANDBOX_ATTRIBUTES).toContain('allow-scripts');
    expect(SANDBOX_ATTRIBUTES).not.toContain('allow-same-origin');
  });
});
