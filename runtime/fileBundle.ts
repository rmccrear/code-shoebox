/**
 * Serialization for bounded multi-file environment modes:
 * 'html-css' (index.html + style.css),
 * 'html-js' (index.html + script.js),
 * 'html-css-js' (index.html + style.css + script.js), and
 * 'react-app' (App.jsx + up to two component JSX files + App.css).
 *
 * The public CodeShoebox contract is ONE code string everywhere (props,
 * localStorage, presets, the EXECUTE message). Multi-file modes pack their
 * files into that string as a small JSON envelope. Any string that is not
 * an envelope parses as the mode's first file with companion files empty, so
 * hand-authored content and stale persisted code degrade gracefully.
 *
 * NOTE: the bounded HTML recipes in runner.ts contain inline plain-JS copies
 * of parseFileBundle (the iframe kernel cannot import modules). Keep them in
 * sync — runner.test.ts and fileBundle.test.ts guard both.
 */

export const HTML_CSS_FILE_NAMES = ['index.html', 'style.css'] as const;
export const HTML_JS_FILE_NAMES = ['index.html', 'script.js'] as const;
export const HTML_CSS_JS_FILE_NAMES = ['index.html', 'style.css', 'script.js'] as const;
export const REACT_APP_FILE_NAMES = ['App.jsx', 'App.css'] as const;

const REACT_COMPONENT_FILE_NAME = /^[A-Z][A-Za-z0-9_-]*\.jsx$/;
const REACT_APP_MAX_JSX_FILES = 3;

export type WebFileName =
  | typeof HTML_CSS_FILE_NAMES[number]
  | typeof HTML_JS_FILE_NAMES[number]
  | typeof HTML_CSS_JS_FILE_NAMES[number]
  | typeof REACT_APP_FILE_NAMES[number];
export type FileBundleFor<T extends readonly WebFileName[]> = { [K in T[number]]: string };
export type WebFileBundle = FileBundleFor<typeof HTML_CSS_FILE_NAMES>;
export type HtmlJsFileBundle = FileBundleFor<typeof HTML_JS_FILE_NAMES>;
export type HtmlCssJsFileBundle = FileBundleFor<typeof HTML_CSS_JS_FILE_NAMES>;
export type ReactAppFileBundle = FileBundleFor<typeof REACT_APP_FILE_NAMES>;

/** A bounded React App workspace. `App.jsx` is required; `App.css` is optional. */
export type ReactAppBundleInput = {
  'App.jsx': string;
  'App.css'?: string;
  [fileName: string]: string | undefined;
};

export interface ParsedReactAppBundle {
  files: Record<string, string> & { 'App.jsx': string; 'App.css': string };
  /** Canonical editor order: entry, alphabetical components, stylesheet. */
  fileNames: string[];
}

export const serializeFileBundle = (
  files: Readonly<WebFileBundle> | Readonly<HtmlJsFileBundle> | Readonly<HtmlCssJsFileBundle> | Readonly<ReactAppFileBundle>
): string =>
  JSON.stringify({ __csFiles__: 1, files });

const validateReactAppFiles = (candidate: unknown): ParsedReactAppBundle => {
  if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) {
    throw new Error('React App bundle files must be an object.');
  }

  const source = candidate as Record<string, unknown>;
  if (!Object.prototype.hasOwnProperty.call(source, 'App.jsx')) {
    throw new Error('React App bundle requires an App.jsx entry file.');
  }

  const componentNames: string[] = [];
  for (const fileName of Object.keys(source)) {
    if (fileName === 'App.jsx' || fileName === 'App.css') continue;
    if (!REACT_COMPONENT_FILE_NAME.test(fileName)) {
      throw new Error(
        `Unsupported React App file "${fileName}". Component files must be top-level, begin with an uppercase letter, and end in .jsx.`
      );
    }
    componentNames.push(fileName);
  }

  if (componentNames.length + 1 > REACT_APP_MAX_JSX_FILES) {
    throw new Error('React App mode supports App.jsx plus at most two component JSX files.');
  }

  componentNames.sort((left, right) => left.localeCompare(right));
  const fileNames = ['App.jsx', ...componentNames, 'App.css'];
  const files = Object.fromEntries(
    fileNames.map((fileName) => [fileName, String(source[fileName] ?? '')])
  ) as ParsedReactAppBundle['files'];

  return { files, fileNames };
};

/** Serialize and validate the public, bounded `react-app` workspace format. */
export const serializeReactAppBundle = (files: Readonly<ReactAppBundleInput>): string => {
  const validated = validateReactAppFiles(files);
  return JSON.stringify({ __csFiles__: 1, files: validated.files });
};

/** Parse a React App workspace, including legacy plain App.jsx source strings. */
export const parseReactAppBundle = (code: string): ParsedReactAppBundle => {
  try {
    const parsed = JSON.parse(code);
    if (parsed && parsed.__csFiles__ === 1) {
      return validateReactAppFiles(parsed.files);
    }
  } catch (error) {
    if (error instanceof SyntaxError) {
      // A non-envelope string is legacy App.jsx source.
    } else {
      throw error;
    }
  }

  return validateReactAppFiles({ 'App.jsx': code, 'App.css': '' });
};

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
  const fallbackFileName = fileNames[0];
  return Object.fromEntries(
    fileNames.map((fileName) => [fileName, fileName === fallbackFileName ? code : ''])
  );
}
