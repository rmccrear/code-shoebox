import { Prec } from '@codemirror/state';
import { keymap } from '@codemirror/view';
import { acceptCompletion, autocompletion, closeCompletion, completionKeymap } from '@codemirror/autocomplete';

// Keep suggestion navigation and Ctrl-Space, but accept suggestions with Tab.
// Unhandled Tab falls through to snippet fields, Emmet expansion or indentation.
export const codeMirrorKeys = [
  autocompletion({ defaultKeymap: false }),
  Prec.highest(keymap.of([
    ...completionKeymap.filter(binding => binding.key !== 'Enter'),
    { key: 'Tab', run: acceptCompletion },
    { key: 'Enter', run: view => { closeCompletion(view); return false; } },
  ])),
];
