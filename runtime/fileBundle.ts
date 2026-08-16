/**
 * Serialization for bounded multi-file environment modes:
 * 'html-css' (index.html + style.css) and
 * 'html-js' (index.html + script.js).
 *
 * The public CodeShoebox contract is ONE code string everywhere (props,
 * localStorage, presets, the EXECUTE message). Multi-file modes pack their
 * files into that string as a small JSON envelope. Any string that is not
 * an envelope parses as a bare index.html with the mode's companion file
 * empty, so hand-authored content and stale persisted code degrade gracefully.
 *
 * NOTE: the 'html-css' and 'html-js' recipes in runner.ts contain inline
 * plain-JS copies of parseFileBundle (the iframe kernel cannot import
 * modules). Keep them in sync — runner.test.ts and fileBundle.test.ts guard
 * both.
 */

export const HTML_CSS_FILE_NAMES = ['index.html', 'style.css'] as const;
export const HTML_JS_FILE_NAMES = ['index.html', 'script.js'] as const;

export type WebFileName = typeof HTML_CSS_FILE_NAMES[number] | typeof HTML_JS_FILE_NAMES[number];
export type FileBundleFor<T extends readonly WebFileName[]> = { [K in T[number]]: string };
export type WebFileBundle = FileBundleFor<typeof HTML_CSS_FILE_NAMES>;
export type HtmlJsFileBundle = FileBundleFor<typeof HTML_JS_FILE_NAMES>;

export const serializeFileBundle = (
  files: Readonly<WebFileBundle> | Readonly<HtmlJsFileBundle>
): string =>
  JSON.stringify({ __csFiles__: 1, files });

export function parseFileBundle(code: string): WebFileBundle;
export function parseFileBundle<const T extends readonly WebFileName[]>(
  code: string,
  fileNames: T
): FileBundleFor<T>;
export function parseFileBundle(
  code: string,
  fileNames: readonly WebFileName[] = HTML_CSS_FILE_NAMES
): Record<string, string> {
  try {
    const parsed = JSON.parse(code);
    if (parsed && parsed.__csFiles__ === 1 && parsed.files) {
      return Object.fromEntries(
        fileNames.map((fileName) => [fileName, String(parsed.files[fileName] ?? '')])
      );
    }
  } catch { /* not an envelope — fall through */ }
  return Object.fromEntries(
    fileNames.map((fileName) => [fileName, fileName === 'index.html' ? code : ''])
  );
}
