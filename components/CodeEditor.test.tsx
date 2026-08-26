import { render } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CodeEditor } from './CodeEditor';
import { registerHtmlEmmetForModel } from './emmet';

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
  editor: { remeasureFonts: vi.fn() },
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
  default: ({ onMount, language }: any) => {
    onMount(fakeEditor, fakeMonaco);
    return <textarea aria-label="Code editor" data-language={language} />;
  },
}));

vi.mock('./emmet', () => ({
  registerHtmlEmmetForModel: vi.fn(() => Promise.resolve(vi.fn())),
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
});
