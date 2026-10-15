import { act, render, waitFor } from '@testing-library/react';
import { expect, it } from 'vitest';
import { EditorView } from '@codemirror/view';
import { StateEffect } from '@codemirror/state';
import { autocompletion, completeFromList, completionStatus, startCompletion } from '@codemirror/autocomplete';
import { CodeMirrorCodeEditor } from './CodeMirrorCodeEditor';

async function editorWithSuggestions() {
  const result = render(<CodeMirrorCodeEditor code="ap" onChange={() => {}} themeMode="dark" environmentMode="node-js" sessionId={1} />);
  const view = EditorView.findFromDOM(result.container.querySelector('.cm-editor') as HTMLElement)!;
  act(() => {
    view.dispatch({ selection: { anchor: 2 }, effects: StateEffect.appendConfig.of(autocompletion({
      override: [completeFromList(['apple'])], interactionDelay: 0, activateOnTyping: false,
    })) });
    startCompletion(view);
  });
  await waitFor(() => expect(completionStatus(view.state)).toBe('active'));
  return view;
}

it('accepts the selected suggestion with Tab', async () => {
  const view = await editorWithSuggestions();
  act(() => { view.contentDOM.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true })); });
  expect(view.state.doc.toString()).toBe('apple');
});

it('inserts a newline with Enter while suggestions are open', async () => {
  const view = await editorWithSuggestions();
  act(() => { view.contentDOM.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })); });
  expect(view.state.doc.toString()).toBe('ap\n');
  expect(completionStatus(view.state)).toBeNull();
});

it('indents with Tab when no suggestion is open', () => {
  const result = render(<CodeMirrorCodeEditor code="" onChange={() => {}} themeMode="dark" environmentMode="node-js" sessionId={1} />);
  const view = EditorView.findFromDOM(result.container.querySelector('.cm-editor') as HTMLElement)!;
  act(() => { view.contentDOM.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true })); });
  expect(view.state.doc.toString()).toMatch(/^\s+$/);
});
