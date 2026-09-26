import { render, waitFor } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CodeEditor } from './CodeEditor';
import { registerHtmlEmmetForModel } from './emmet';
import { prepareJsxHighlighting } from './jsxHighlighting';

const model = { uri: { path: '/sandbox.html' } };
const onDidDispose = vi.fn();
const fakeEditor = {
  focus: vi.fn(),
  layout: vi.fn(),
  getModel: vi.fn(() => model),
  onDidDispose,
  onDidFocusEditorText: vi.fn(),
};
const fakeMonaco = {
  editor: { remeasureFonts: vi.fn(), setTheme: vi.fn() },
  languages: {
    typescript: {
      javascriptDefaults: {
        setCompilerOptions: vi.fn(),
        addExtraLib: vi.fn(),
      },
      ScriptTarget: { ES2020: 7 },
    },
  },
};

vi.mock('@monaco-editor/react', () => ({
  __esModule: true,
  default: ({ beforeMount, onMount, language, path }: any) => {
    beforeMount?.(fakeMonaco);
    onMount(fakeEditor, fakeMonaco);
    return <textarea aria-label="Code editor" data-language={language} data-path={path} />;
  },
}));

vi.mock('./emmet', () => ({
  registerHtmlEmmetForModel: vi.fn(() => Promise.resolve(vi.fn())),
}));

vi.mock('./jsxHighlighting', () => ({
  prepareJsxHighlighting: vi.fn(() => Promise.resolve()),
}));

const renderEditor = (props: Partial<ComponentProps<typeof CodeEditor>> = {}) => render(
  <CodeEditor
    code=""
    onChange={() => {}}
    themeMode="dark"
    environmentMode="html"
    sessionId={1}
    {...props}
  />
);

describe('CodeEditor Emmet opt-in', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('registers Emmet for an opted-in editable HTML model', () => {
    renderEditor({ enableEmmet: true });

    expect(registerHtmlEmmetForModel).toHaveBeenCalledWith(fakeMonaco, model);
    expect(onDidDispose).toHaveBeenCalledWith(expect.any(Function));
  });

  it('does not register Emmet by default', () => {
    renderEditor();

    expect(registerHtmlEmmetForModel).not.toHaveBeenCalled();
  });

  it('does not register Emmet for non-HTML or read-only models', () => {
    renderEditor({ environmentMode: 'dom', enableEmmet: true });
    renderEditor({ enableEmmet: true, readOnly: true });

    expect(registerHtmlEmmetForModel).not.toHaveBeenCalled();
  });

  it('uses a JSX JavaScript model for react-app', () => {
    const { getByLabelText } = renderEditor({ environmentMode: 'react-app', sessionId: 7 });
    const editor = getByLabelText('Code editor');

    expect(editor).toHaveAttribute('data-language', 'jsx');
    expect(editor).toHaveAttribute('data-path', 'sandbox-react-app-7.jsx');
    expect(prepareJsxHighlighting).toHaveBeenCalledWith(fakeMonaco);
  });

  it('uses separate JSX and CSS models for react-app files', () => {
    const jsx = renderEditor({ environmentMode: 'react-app', sessionId: 8, activeFile: 'App.jsx' });
    expect(jsx.getByLabelText('Code editor')).toHaveAttribute('data-language', 'jsx');
    expect(jsx.getByLabelText('Code editor')).toHaveAttribute('data-path', 'sandbox-react-app-8-App.jsx');
    jsx.unmount();

    const css = renderEditor({ environmentMode: 'react-app', sessionId: 8, activeFile: 'App.css' });
    expect(css.getByLabelText('Code editor')).toHaveAttribute('data-language', 'css');
    expect(css.getByLabelText('Code editor')).toHaveAttribute('data-path', 'sandbox-react-app-8-App.css');
  });

  it('re-applies the current theme after the lazy JSX highlighter loads', async () => {
    renderEditor({ environmentMode: 'react-app', themeMode: 'light' });

    await waitFor(() => expect(fakeMonaco.editor.setTheme).toHaveBeenCalledWith('light'));
  });
});
