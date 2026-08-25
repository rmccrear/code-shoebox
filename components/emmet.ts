import type { Monaco } from '@monaco-editor/react';
import type {
  CancellationToken,
  Position,
  editor,
  languages,
} from 'monaco-editor';

/**
 * Registers Emmet for one HTML model without enabling it for every HTML editor
 * that shares Monaco's global language registry.
 */
export const registerHtmlEmmetForModel = (
  monaco: Monaco,
  enabledModel: editor.ITextModel
): Promise<() => void> => import('emmet-monaco-es').then(({ emmetHTML }) => {
  const languagesProxy = new Proxy(monaco.languages, {
    get(target, property) {
      if (property !== 'registerCompletionItemProvider') {
        return Reflect.get(target, property, target);
      }

      return (
        languageSelector: languages.LanguageSelector,
        provider: languages.CompletionItemProvider
      ) => target.registerCompletionItemProvider(languageSelector, {
        ...provider,
        provideCompletionItems(
          model: editor.ITextModel,
          position: Position,
          context: languages.CompletionContext,
          token: CancellationToken
        ) {
          if (model !== enabledModel) return undefined;
          return provider.provideCompletionItems(model, position, context, token);
        },
      });
    },
  });

  const gatedMonaco = new Proxy(monaco, {
    get(target, property) {
      if (property === 'languages') return languagesProxy;
      return Reflect.get(target, property, target);
    },
  });

  return emmetHTML(gatedMonaco, ['html'], { tokenizer: 'standard' });
});
