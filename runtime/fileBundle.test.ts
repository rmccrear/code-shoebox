import { describe, it, expect } from 'vitest';
import { HTML_JS_FILE_NAMES, serializeFileBundle, parseFileBundle } from './fileBundle';

describe('fileBundle', () => {
  it('round-trips a two-file bundle', () => {
    const files = {
      'index.html': '<h1>Hi</h1>',
      'style.css': 'h1 { color: red; }'
    };
    expect(parseFileBundle(serializeFileBundle(files))).toEqual(files);
  });

  it('survives learner content that looks like markup, quotes, and braces', () => {
    const files = {
      'index.html': '<!DOCTYPE html>\n<p>He said "use { } and \\ backslashes"</p>',
      'style.css': '.a::before { content: "{\\"__csFiles__\\":1}"; }'
    };
    expect(parseFileBundle(serializeFileBundle(files))).toEqual(files);
  });

  it('treats a plain HTML string as index.html with empty css', () => {
    expect(parseFileBundle('<h1>bare</h1>')).toEqual({
      'index.html': '<h1>bare</h1>',
      'style.css': ''
    });
  });

  it('treats malformed JSON as a plain string', () => {
    expect(parseFileBundle('{not json')['index.html']).toBe('{not json');
  });

  it('treats JSON without the envelope marker as a plain string', () => {
    const raw = '{"files": {"index.html": "x"}}';
    expect(parseFileBundle(raw)['index.html']).toBe(raw);
  });

  it('tolerates an envelope with missing keys', () => {
    const raw = JSON.stringify({ __csFiles__: 1, files: { 'index.html': '<p>only html</p>' } });
    expect(parseFileBundle(raw)).toEqual({
      'index.html': '<p>only html</p>',
      'style.css': ''
    });
  });

  it('round-trips an HTML and JavaScript bundle without interpreting learner text', () => {
    const files = {
      'index.html': '<button id="go">{ Go }</button><script src="script.js"></script>',
      'script.js': 'const template = `quotes " \\ ${value}`;\nconst closing = "</script>";'
    };

    expect(parseFileBundle(serializeFileBundle(files), HTML_JS_FILE_NAMES)).toEqual(files);
  });

  it('uses the requested HTML and JavaScript shape for plain-text fallback', () => {
    expect(parseFileBundle('<h1>bare</h1>', HTML_JS_FILE_NAMES)).toEqual({
      'index.html': '<h1>bare</h1>',
      'script.js': ''
    });
  });

  it('defaults a missing script.js file to an empty string', () => {
    const raw = JSON.stringify({ __csFiles__: 1, files: { 'index.html': '<p>only html</p>' } });
    expect(parseFileBundle(raw, HTML_JS_FILE_NAMES)).toEqual({
      'index.html': '<p>only html</p>',
      'script.js': ''
    });
  });
});
