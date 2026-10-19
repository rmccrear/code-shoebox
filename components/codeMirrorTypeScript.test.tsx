import { act, render, waitFor } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { CodeMirrorCodeEditor } from './CodeMirrorCodeEditor';
import type { CodeEditorProps } from './editorTypes';

class FakeWorker {
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror = null;
  onmessageerror = null;
  terminate = vi.fn();
  postMessage = vi.fn(({id}: {id:number}) => { queueMicrotask(()=>this.onmessage?.({data:{id,diagnostics:[]}} as MessageEvent)); });
}
const base: CodeEditorProps = {code:'const n: number = 1;',onChange:()=>{},environmentMode:'node-ts',themeMode:'dark',sessionId:1};

it('starts only in editable TypeScript contexts and terminates when disabled', async () => {
  const worker = new FakeWorker();
  const factory = vi.fn(()=>worker as unknown as Worker);
  const editor=render(<CodeMirrorCodeEditor {...base} createTypeScriptWorker={factory} environmentMode="node-js" />);
  await act(async()=>{});
  expect(factory).not.toHaveBeenCalled();
  editor.rerender(<CodeMirrorCodeEditor {...base} createTypeScriptWorker={factory} readOnly />);
  await act(async()=>{});
  expect(factory).not.toHaveBeenCalled();
  editor.rerender(<CodeMirrorCodeEditor {...base} createTypeScriptWorker={factory} />);
  await waitFor(()=>expect(factory).toHaveBeenCalledTimes(1));
  editor.rerender(<CodeMirrorCodeEditor {...base} createTypeScriptWorker={()=>worker as unknown as Worker} code="const n: number = 2;" />);
  expect(factory).toHaveBeenCalledTimes(1);
  editor.rerender(<CodeMirrorCodeEditor {...base} />);
  await waitFor(()=>expect(worker.terminate).toHaveBeenCalled());
});

it('keeps editing available when the host worker factory fails', async () => {
  const error = vi.spyOn(console, 'error').mockImplementation(() => {});
  try {
    const editor = render(<CodeMirrorCodeEditor {...base} createTypeScriptWorker={() => { throw new Error('Asset unavailable'); }} />);
    await waitFor(() => expect(editor.container.querySelector('[data-typescript-status="failed"]')).not.toBeNull());
    expect(editor.container.querySelector('.cm-content')).toHaveAttribute('contenteditable', 'true');
    expect(error).toHaveBeenCalled();
  } finally { error.mockRestore(); }
});
