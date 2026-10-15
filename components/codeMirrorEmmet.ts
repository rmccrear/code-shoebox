import { EditorState, Prec, type Extension } from '@codemirror/state';
import { abbreviationTracker, emmetConfig, emmetCompletionSource, EmmetKnownSyntax } from '@emmetio/codemirror6-plugin';

export function codeMirrorEmmet(): Extension {
  return Prec.high([
    emmetConfig.of({ syntax: EmmetKnownSyntax.html, autocompleteTab: true }),
    abbreviationTracker({ syntax: EmmetKnownSyntax.html }),
    // Add Emmet alongside HTML's built-in tag/attribute completions.
    // This extension is installed only on this editable, opted-in HTML state.
    // State-local language data avoids Monaco's global-provider workaround.
    EditorState.languageData.of(() => [{ autocomplete: emmetCompletionSource }]),
  ]);
}
