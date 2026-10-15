import { act, render, waitFor } from '@testing-library/react';
import { EditorView } from '@codemirror/view';
import { undo } from '@codemirror/commands';
import { expect, it } from 'vitest';
import { CodeEditor } from './CodeEditor';

it('defaults to CodeMirror without a provider and resets history for a new session', async () => {
  const editor = (sessionId: number) => (
    <CodeEditor code="const x = 1;" onChange={() => {}} themeMode="dark" environmentMode="node-js" sessionId={sessionId} />
  );
  const result = render(editor(1));
  await waitFor(() => expect(result.container.querySelector('.cm-editor')).not.toBeNull());
  const getView = () => EditorView.findFromDOM(result.container.querySelector('.cm-editor') as HTMLElement)!;
  const oldView = getView();
  act(() => oldView.dispatch({ changes: { from: 10, to: 11, insert: '2' } }));
  result.rerender(editor(2));
  await waitFor(() => expect(getView()).not.toBe(oldView));
  expect(getView().state.doc.toString()).toBe('const x = 1;');
  act(() => { expect(undo(getView())).toBe(false); });
});
