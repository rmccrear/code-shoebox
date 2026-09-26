import type { Monaco } from '@monaco-editor/react';

const JSX_LANGUAGE_ID = 'jsx';

const setupByMonaco = new WeakMap<object, Promise<void>>();

/**
 * Registers JSX synchronously so Monaco can create the model with the correct
 * language id, then loads the TextMate grammar and themes off the critical
 * path. Shiki's JavaScript regex engine keeps this browser-only: no WASM,
 * worker, or network-loaded compiler is required.
 */
export const prepareJsxHighlighting = (monaco: Monaco): Promise<void> => {
  if (!monaco.languages.getLanguages().some(({ id }: { id: string }) => id === JSX_LANGUAGE_ID)) {
    monaco.languages.register({
      id: JSX_LANGUAGE_ID,
      extensions: ['.jsx'],
      aliases: ['JSX'],
    });
  }

  const existingSetup = setupByMonaco.get(monaco);
  if (existingSetup) return existingSetup;

  const setup = Promise.all([
    import('@shikijs/core'),
    import('@shikijs/engine-javascript'),
    import('@shikijs/langs/jsx'),
    import('@shikijs/themes/dark-plus'),
    import('@shikijs/themes/light-plus'),
    import('@shikijs/monaco'),
  ]).then(async ([
    { createHighlighterCore },
    { createJavaScriptRegexEngine },
    { default: jsx },
    { default: darkPlus },
    { default: lightPlus },
    { shikiToMonaco },
  ]) => {
    const highlighter = await createHighlighterCore({
      langs: [jsx],
      themes: [
        { ...darkPlus, name: 'vs-dark' },
        { ...lightPlus, name: 'light' },
      ],
      engine: createJavaScriptRegexEngine(),
    });

    // Shiki owns tokenization only for registered, loaded languages. Naming
    // its themes after Monaco's existing choices lets every non-JSX editor
    // continue using the same public light/dark theme contract.
    shikiToMonaco(
      highlighter,
      monaco as unknown as Parameters<typeof shikiToMonaco>[1],
    );
  }).catch((error) => {
    setupByMonaco.delete(monaco);
    throw error;
  });

  setupByMonaco.set(monaco, setup);
  return setup;
};
