import type { Monaco } from '@monaco-editor/react';
import type { editor, languages } from 'monaco-editor';
import { describe, expect, it, vi } from 'vitest';
import { emmetHTML } from 'emmet-monaco-es';
import { registerHtmlEmmetForModel } from './emmet';

vi.mock('emmet-monaco-es', () => ({
  emmetHTML: vi.fn((monaco: Monaco, languageIds: string[]) => {
    const disposable = monaco.languages.registerCompletionItemProvider(languageIds[0], {
      provideCompletionItems: () => ({ suggestions: [] }),
    });
    return () => disposable.dispose();
  }),
}));

describe('registerHtmlEmmetForModel', () => {
  it('gates Emmet completions to the opted-in Monaco model', async () => {
    let registeredProvider: languages.CompletionItemProvider | undefined;
    const dispose = vi.fn();
    const registerCompletionItemProvider = vi.fn((
      _selector: languages.LanguageSelector,
      provider: languages.CompletionItemProvider
    ) => {
      registeredProvider = provider;
      return { dispose };
    });
    const monaco = {
      languages: { registerCompletionItemProvider },
    } as unknown as Monaco;
    const enabledModel = { uri: { path: '/enabled.html' } } as editor.ITextModel;
    const otherModel = { uri: { path: '/plain.html' } } as editor.ITextModel;

    const unregister = await registerHtmlEmmetForModel(monaco, enabledModel);

    expect(emmetHTML).toHaveBeenCalledWith(
      expect.anything(),
      ['html'],
      { tokenizer: 'standard' }
    );
    expect(registerCompletionItemProvider).toHaveBeenCalledWith('html', expect.any(Object));
    expect(registeredProvider?.provideCompletionItems(
      otherModel,
      {} as never,
      {} as never,
      {} as never
    )).toBeUndefined();
    expect(registeredProvider?.provideCompletionItems(
      enabledModel,
      {} as never,
      {} as never,
      {} as never
    )).toEqual({ suggestions: [] });

    unregister();
    expect(dispose).toHaveBeenCalledOnce();
  });
});
