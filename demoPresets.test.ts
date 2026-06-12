import { describe, it, expect } from 'vitest';
import {
  EDITOR_DEMO_PRESETS,
  resolvePresetFromHash,
  getPresetHashForMode
} from './demoPresets';
import { parseFileBundle } from './runtime/fileBundle';

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

  it('maps a mode to its preset hash and round-trips back', () => {
    const hash = getPresetHashForMode('hono');
    expect(hash).toBe('hono-api-demo');
    expect(resolvePresetFromHash(hash!)?.mode).toBe('hono');
  });

  it('returns undefined for a mode with no preset', () => {
    expect(getPresetHashForMode('dom')).toBeUndefined();
  });

  it('keeps preset ids unique', () => {
    const ids = EDITOR_DEMO_PRESETS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
