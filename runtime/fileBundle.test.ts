import { describe, it, expect } from 'vitest';
import {
  HTML_CSS_JS_FILE_NAMES,
  HTML_JS_FILE_NAMES,
  REACT_APP_FILE_NAMES,
  serializeFileBundle,
  parseFileBundle,
} from './fileBundle';

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

  it('round-trips an HTML, CSS, and JavaScript bundle without interpreting learner text', () => {
    const files = {
      'index.html': '<main>{ Page }</main><link rel="stylesheet" href="style.css"><script src="script.js"></script>',
      'style.css': 'main::after { content: "\\\\ { styled }"; }',
      'script.js': 'const template = `quotes " \\ ${value}`;\nconst closing = "</script>";',
    };

    expect(parseFileBundle(serializeFileBundle(files), HTML_CSS_JS_FILE_NAMES)).toEqual(files);
  });

  it('uses the requested three-file shape for plain-text fallback', () => {
    expect(parseFileBundle('<h1>bare</h1>', HTML_CSS_JS_FILE_NAMES)).toEqual({
      'index.html': '<h1>bare</h1>',
      'style.css': '',
      'script.js': '',
    });
  });

  it('defaults missing three-file companion entries to empty strings', () => {
    const raw = JSON.stringify({ __csFiles__: 1, files: { 'index.html': '<p>only html</p>' } });
    expect(parseFileBundle(raw, HTML_CSS_JS_FILE_NAMES)).toEqual({
      'index.html': '<p>only html</p>',
      'style.css': '',
      'script.js': '',
    });
  });

  it('round-trips a React App bundle', () => {
    const files = {
      'App.jsx': "import './App.css';\nexport default function App() { return <h1>Hello</h1>; }",
      'App.css': 'h1::after { content: "</style><script>not code</script>"; color: rebeccapurple; }',
    };

    expect(parseFileBundle(serializeFileBundle(files), REACT_APP_FILE_NAMES)).toEqual(files);
  });

  it('defaults a missing App.css entry to an empty string', () => {
    const raw = JSON.stringify({
      __csFiles__: 1,
      files: { 'App.jsx': 'export default function App() { return null; }' },
    });

    expect(parseFileBundle(raw, REACT_APP_FILE_NAMES)).toEqual({
      'App.jsx': 'export default function App() { return null; }',
      'App.css': '',
    });
  });

  it('treats legacy plain React source as App.jsx with empty App.css', () => {
    const source = 'export default function App() { return <h1>Legacy</h1>; }';

    expect(parseFileBundle(source, REACT_APP_FILE_NAMES)).toEqual({
      'App.jsx': source,
      'App.css': '',
    });
  });

  it('uses the first requested filename as fallback without changing HTML behavior', () => {
    expect(parseFileBundle('<h1>bare</h1>', HTML_CSS_JS_FILE_NAMES)).toEqual({
      'index.html': '<h1>bare</h1>',
      'style.css': '',
      'script.js': '',
    });
  });
});
