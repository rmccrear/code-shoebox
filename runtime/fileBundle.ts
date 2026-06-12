/**
 * Serialization for multi-file environment modes (currently only
 * 'html-css': index.html + style.css).
 *
 * The public CodeShoebox contract is ONE code string everywhere (props,
 * localStorage, presets, the EXECUTE message). Multi-file modes pack their
 * files into that string as a small JSON envelope. Any string that is not
 * an envelope parses as a bare index.html with an empty style.css, so
 * hand-authored content and stale persisted code degrade gracefully.
 *
 * NOTE: the 'html-css' recipe in runner.ts contains an inline plain-JS
 * copy of parseFileBundle (the iframe kernel cannot import modules). Keep
 * the two in sync — runner.test.ts and fileBundle.test.ts guard both.
 */

export interface WebFileBundle {
  'index.html': string;
  'style.css': string;
}

export const serializeFileBundle = (files: WebFileBundle): string =>
  JSON.stringify({ __csFiles__: 1, files });

export const parseFileBundle = (code: string): WebFileBundle => {
  try {
    const parsed = JSON.parse(code);
    if (parsed && parsed.__csFiles__ === 1 && parsed.files) {
      return {
        'index.html': String(parsed.files['index.html'] ?? ''),
        'style.css': String(parsed.files['style.css'] ?? '')
      };
    }
  } catch { /* not an envelope — fall through */ }
  return { 'index.html': code, 'style.css': '' };
};
