import { act, render, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { EditorView } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { undo } from '@codemirror/commands';
import { syntaxTree } from '@codemirror/language';
import { CodeMirrorCodeEditor, editorLanguage } from './CodeMirrorCodeEditor';
import type { CodeEditorProps } from './editorTypes';
import { CompletionContext, type CompletionSource } from '@codemirror/autocomplete';
import { htmlEmmetCompletions } from './codeMirrorEmmet';

const defaults: CodeEditorProps = {
  code: 'const count = 1;', onChange: () => {}, themeMode: 'dark', environmentMode: 'html-css-js', sessionId: 1, activeFile: 'script.js',
};
const viewFor = (container: HTMLElement) => EditorView.findFromDOM(container.querySelector('.cm-editor') as HTMLElement)!;

describe('CodeMirror prototype', () => {
  it.each([
    ['script.js', 'const learnerCount = 1;\nlearnerC', 'html-css-js'],
    ['App.jsx', 'const Counter = () => <div />;\nCount', 'react-app'],
    ['script.ts', 'const learnerCount: number = 1;\nlearnerC', 'typescript'],
  ] as const)('keeps built-in local-name and snippet completion in %s', async (activeFile, code, environmentMode) => {
    const editor = render(<CodeMirrorCodeEditor {...defaults} activeFile={activeFile} code={code} environmentMode={environmentMode} />);
    const state = viewFor(editor.container).state;
    const context = new CompletionContext(state, state.doc.length, true);
    const sources = state.languageDataAt<CompletionSource>('autocomplete', state.doc.length);
    const results = await Promise.all(sources.map(source => source(context)));
    const labels = results.flatMap(result => result?.options.map(option => option.label) ?? []);
    expect(labels).toContain(activeFile === 'App.jsx' ? 'Counter' : 'learnerCount');
    expect(labels).toContain('for');
  });

  it('does not overwrite newer typing when a controlled value echoes an older edit', () => {
    const onChange = vi.fn();
    const props = { ...defaults, code: 'abc', onChange };
    const editor = render(<CodeMirrorCodeEditor {...props} />);
    act(() => {
      const view = viewFor(editor.container);
      view.dispatch({ changes: { from: 3, insert: '1' }, selection: { anchor: 4 } });
      view.dispatch({ changes: { from: 4, insert: '2' }, selection: { anchor: 5 } });
    });
    editor.rerender(<CodeMirrorCodeEditor {...props} code="abc1" />);
    expect(viewFor(editor.container).state.doc.toString()).toBe('abc12');
    expect(viewFor(editor.container).state.selection.main.head).toBe(5);
    editor.rerender(<CodeMirrorCodeEditor {...props} code="abc12" />);
    onChange.mockClear();
    editor.rerender(<CodeMirrorCodeEditor {...props} code="external" />);
    expect(viewFor(editor.container).state.doc.toString()).toBe('external');
    expect(onChange).not.toHaveBeenCalled();
  });
  it('scopes Emmet to opted-in editable HTML and removes it when disabled', async () => {
    const props = { ...defaults, activeFile: 'index.html', code: 'div.test' };
    const editor = render(<CodeMirrorCodeEditor {...props} enableEmmet />);
    const hasEmmet = () => viewFor(editor.container).state.languageDataAt('autocomplete', 0).includes(htmlEmmetCompletions);
    await waitFor(() => expect(hasEmmet()).toBe(true));
    editor.rerender(<CodeMirrorCodeEditor {...props} enableEmmet={false} />);
    expect(hasEmmet()).toBe(false);
    editor.rerender(<CodeMirrorCodeEditor {...props} enableEmmet readOnly />);
    expect(hasEmmet()).toBe(false);
    editor.rerender(<CodeMirrorCodeEditor {...defaults} enableEmmet />);
    expect(hasEmmet()).toBe(false);
  });
  it('keeps file history across tabs and suppresses controlled-value callbacks', () => {
    const onChange = vi.fn();
    const props = { ...defaults, onChange };
    const editor = render(<CodeMirrorCodeEditor {...props} />);
    act(() => viewFor(editor.container).dispatch({ changes: { from: 14, to: 15, insert: '2' } }));
    expect(onChange).toHaveBeenLastCalledWith('const count = 2;');
    editor.rerender(<CodeMirrorCodeEditor {...props} code="const count = 2;" />);
    editor.rerender(<CodeMirrorCodeEditor {...props} activeFile="style.css" code="body {}" />);
    editor.rerender(<CodeMirrorCodeEditor {...props} code="const count = 2;" />);
    act(() => { undo(viewFor(editor.container)); });
    expect(viewFor(editor.container).state.doc.toString()).toBe('const count = 1;');
    onChange.mockClear();
    editor.rerender(<CodeMirrorCodeEditor {...props} code="const reset = true;" />);
    expect(onChange).not.toHaveBeenCalled();
    expect(viewFor(editor.container).state.doc.toString()).toBe('const reset = true;');
  });

  it('reconfigures read-only and theme without losing the document', () => {
    const editor = render(<CodeMirrorCodeEditor {...defaults} />);
    editor.rerender(<CodeMirrorCodeEditor {...defaults} readOnly themeMode="light" />);
    const view = viewFor(editor.container);
    expect(view.state.facet(EditorState.readOnly)).toBe(true);
    expect(view.state.facet(EditorView.editable)).toBe(false);
    expect(view.state.facet(EditorView.darkTheme)).toBe(false);
    expect(view.state.doc.toString()).toBe(defaults.code);
  });

  it.each([
    ['index.html', '<h1>Hello</h1>', 'html-css-js'],
    ['style.css', 'body { color: red; }', 'html-css-js'],
    ['script.js', 'const x = 1;', 'html-css-js'],
    ['App.jsx', 'const App = () => <h1>Hello</h1>;', 'react-app'],
    ['source.ts', 'const x: number = 1;', 'typescript'],
    ['App.tsx', 'const App = (): any => <h1>Hello</h1>;', 'react-ts'],
  ] as const)('parses %s without syntax errors', (activeFile, code, environmentMode) => {
    const state = EditorState.create({ doc: code, extensions: [editorLanguage({ activeFile, environmentMode })] });
    const errors: string[] = [];
    syntaxTree(state).iterate({ enter: node => { if (node.type.isError) errors.push(node.name); } });
    expect(errors).toEqual([]);
  });
});
