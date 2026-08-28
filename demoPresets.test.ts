import { describe, it, expect } from 'vitest';
import {
  EDITOR_DEMO_PRESETS,
  resolvePresetFromHash,
  getPresetHashForMode,
  getPresetMediaAssetsForMode,
  getPresetMockApiForMode,
} from './demoPresets';
import { HTML_CSS_JS_FILE_NAMES, HTML_JS_FILE_NAMES, parseFileBundle } from './runtime/fileBundle';

describe('demoPresets', () => {
  it('resolves a preset by its id', () => {
    const preset = resolvePresetFromHash('hono-api-demo');
    expect(preset?.id).toBe('hono-api-demo');
    expect(preset?.mode).toBe('hono');
  });

  it('tolerates a leading "#" in the hash (as window.location.hash provides)', () => {
    expect(resolvePresetFromHash('#hono-api-demo')?.id).toBe('hono-api-demo');
  });

  it('resolves aliases back to the canonical preset', () => {
    // 'express-rest-demo' is an alias of 'ts-express-rest-demo'.
    expect(resolvePresetFromHash('express-rest-demo')?.id).toBe('ts-express-rest-demo');
  });

  it('returns undefined for empty or unknown hashes', () => {
    expect(resolvePresetFromHash('')).toBeUndefined();
    expect(resolvePresetFromHash('#')).toBeUndefined();
    expect(resolvePresetFromHash('no-such-preset')).toBeUndefined();
  });

  it('resolves the html mode preset', () => {
    const preset = resolvePresetFromHash('html-css-demo');
    expect(preset?.mode).toBe('html');
    expect(getPresetHashForMode('html')).toBe('html-css-demo');
  });

  it('resolves the html-css mode preset and its code is a valid file bundle', () => {
    const preset = resolvePresetFromHash('html-css-tabs-demo');
    expect(preset?.mode).toBe('html-css');
    expect(getPresetHashForMode('html-css')).toBe('html-css-tabs-demo');
    const files = parseFileBundle(preset!.code);
    expect(files['index.html']).toContain('<link rel="stylesheet" href="style.css">');
    expect(files['style.css'].length).toBeGreaterThan(0);
  });

  it('resolves the html-js mode preset and its code is a linked file bundle', () => {
    const preset = resolvePresetFromHash('html-js-tabs-demo');
    expect(preset?.mode).toBe('html-js');
    expect(getPresetHashForMode('html-js')).toBe('html-js-tabs-demo');
    const files = parseFileBundle(preset!.code, HTML_JS_FILE_NAMES);
    expect(files['index.html']).toContain('<script src="script.js"></script>');
    expect(files['script.js'].length).toBeGreaterThan(0);
  });

  it('resolves the html-css-js preset and its code is a linked three-file bundle', () => {
    const preset = resolvePresetFromHash('html-css-js-tabs-demo');
    expect(preset?.mode).toBe('html-css-js');
    expect(getPresetHashForMode('html-css-js')).toBe('html-css-js-tabs-demo');
    const files = parseFileBundle(preset!.code, HTML_CSS_JS_FILE_NAMES);
    expect(files['index.html']).toContain('<link rel="stylesheet" href="style.css">');
    expect(files['index.html']).toContain('<script src="script.js"></script>');
    expect(files['style.css'].length).toBeGreaterThan(0);
    expect(files['script.js'].length).toBeGreaterThan(0);
  });

  it('resolves the media preset with three host assets outside its code envelope', () => {
    const preset = resolvePresetFromHash('html-js-css-media-tabs-demo');
    expect(preset?.mode).toBe('html-js-css-media');
    expect(getPresetHashForMode('html-js-css-media')).toBe('html-js-css-media-tabs-demo');
    expect(getPresetMediaAssetsForMode('html-js-css-media')).toEqual(preset?.mediaAssets);
    expect(preset?.mediaAssets?.map((asset) => asset.kind)).toEqual(['image', 'audio', 'video']);
    expect(preset?.mediaAssets?.[0]).toMatchObject({ alt: expect.any(String) });

    const files = parseFileBundle(preset!.code, HTML_CSS_JS_FILE_NAMES);
    expect(files['index.html']).toContain('<link rel="stylesheet" href="style.css">');
    expect(files['index.html']).toContain('<script src="script.js"></script>');
    expect(files['style.css'].length).toBeGreaterThan(0);
    expect(files['script.js'].length).toBeGreaterThan(0);
    expect(preset!.code).not.toContain('mediaAssets');
    expect(getPresetMediaAssetsForMode('html-css-js')).toBeUndefined();
  });

  it('maps a mode to its preset hash and round-trips back', () => {
    const hash = getPresetHashForMode('hono');
    expect(hash).toBe('hono-api-demo');
    expect(resolvePresetFromHash(hash!)?.mode).toBe('hono');
  });

  it('provides fetch fixtures outside learner code', () => {
    const preset = resolvePresetFromHash('fetch-air-quality-demo');
    const mockApi = getPresetMockApiForMode('fetch');

    expect(preset?.mode).toBe('fetch');
    expect(mockApi?.defaultDelayMs).toBe(1000);
    expect(mockApi?.routes.some((route) => route.query?.limit === '4')).toBe(true);
    expect(preset?.code).toContain('await fetch("/api/air-quality?limit=4")');
    expect(preset?.code).not.toContain('Portland');
  });

  it('returns undefined for a mode with no preset', () => {
    expect(getPresetHashForMode('dom')).toBeUndefined();
  });

  it('keeps preset ids unique', () => {
    const ids = EDITOR_DEMO_PRESETS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
