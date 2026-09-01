import { fireEvent, render, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CodingEnvironment } from './CodingEnvironment';
import type { EnvironmentMode } from '../types';
import {
  HTML_CSS_JS_FILE_NAMES,
  HTML_JS_FILE_NAMES,
  parseFileBundle,
  serializeFileBundle,
} from '../runtime/fileBundle';

vi.mock('../runtime/runner', () => ({
  getSandboxHtml: vi.fn(() => '<!doctype html><html><body></body></html>'),
  executeCodeInSandbox: vi.fn(),
  SANDBOX_ATTRIBUTES: 'allow-scripts',
}));

vi.mock('@monaco-editor/react', () => ({
  __esModule: true,
  default: ({ value, onChange, options, language, path }: any) => (
    <textarea
      aria-label="Code editor"
      value={value}
      onChange={(event) => onChange(event.currentTarget.value)}
      readOnly={options?.readOnly}
      data-language={language}
      data-path={path}
    />
  ),
}));

class FakeMessagePort {
  onmessage: ((event: { data: any }) => void) | null = null;
  peer: FakeMessagePort | null = null;

  postMessage(data: any) {
    if (this.peer) this.peer.onmessage?.({ data });
  }

  close() {
    this.onmessage = null;
  }
}

class FakeMessageChannel {
  port1 = new FakeMessagePort();
  port2 = new FakeMessagePort();

  constructor() {
    this.port1.peer = this.port2;
    this.port2.peer = this.port1;
  }
}

const renderCodingEnvironment = (
  environmentMode: EnvironmentMode,
  props: Partial<ComponentProps<typeof CodingEnvironment>> = {}
) =>
  render(
    <CodingEnvironment
      code=""
      onChange={() => {}}
      onRun={() => {}}
      isRunning={false}
      runTrigger={0}
      themeMode="dark"
      environmentMode={environmentMode}
      sessionId={1}
      {...props}
    />
  );

const getFileTabNames = () => screen.queryAllByRole('button')
  .map((button) => button.textContent?.trim())
  .filter((name): name is string => !!name && /\.(?:js|html|css)$/.test(name));

describe('CodingEnvironment routing', () => {
  beforeEach(() => {
    vi.stubGlobal('MessageChannel', FakeMessageChannel);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('routes Express modes to ServerOutput', () => {
    renderCodingEnvironment('express');

    expect(screen.getByText('GET')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('/api/inventory')).toBeInTheDocument();
  });

  it('routes Hono modes to ServerOutput', () => {
    renderCodingEnvironment('hono');

    expect(screen.getByText('GET')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('/api/inventory')).toBeInTheDocument();
  });

  it('routes DOM modes to OutputFrame', () => {
    renderCodingEnvironment('dom');

    expect(screen.getByTitle('Code Output')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /run code/i })).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('/api/inventory')).not.toBeInTheDocument();
  });

  it('keeps plain DOM mode as one JavaScript editor without file tabs', async () => {
    renderCodingEnvironment('dom', { code: 'console.log("plain")' });

    expect(getFileTabNames()).toEqual([]);
    expect(await screen.findByLabelText('Code editor')).toHaveValue('console.log("plain")');
    expect(screen.getByLabelText('Code editor')).not.toHaveAttribute('readonly');
  });

  it('keeps prediction source static before and after Run and executes only the host code', () => {
    const source = 'const saved = "Ada";\n\nconsole.log(saved);';
    const onChange = vi.fn();
    const onRun = vi.fn();
    const rendered = renderCodingEnvironment('node-js', {
      code: source,
      onChange,
      onRun,
      predictionPrompt: 'What will this print?',
    });

    const runButton = screen.getByRole('button', { name: 'RUN CODE' });
    const viewer = screen.getByLabelText('Read-only code: node-js.script');
    expect(screen.queryByLabelText('Code editor')).not.toBeInTheDocument();
    expect(viewer.querySelector('code')?.textContent).toBe(source);
    expect(viewer).toHaveAttribute('data-language', 'javascript');
    expect(runButton).toBeDisabled();

    fireEvent.change(screen.getByPlaceholderText('What will happen when the code runs?'), {
      target: { value: 'Ada' },
    });
    expect(runButton).toBeEnabled();
    fireEvent.click(runButton);

    expect(onRun).toHaveBeenCalledTimes(1);
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.queryByLabelText('Code editor')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Read-only code: node-js.script').querySelector('code')?.textContent)
      .toBe(source);
    expect(screen.getByPlaceholderText('What will happen when the code runs?')).toBeDisabled();

    rendered.rerender(
      <CodingEnvironment
        code={source}
        onChange={onChange}
        onRun={onRun}
        isRunning={false}
        runTrigger={1}
        themeMode="dark"
        environmentMode="node-js"
        sessionId={1}
      />
    );
    expect(screen.queryByText('Knowledge Check')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Code editor')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Read-only code: node-js.script').querySelector('code')?.textContent)
      .toBe(source);
  });

  it('switches immutable prediction source between bounded code-file tabs', () => {
    const onChange = vi.fn();
    const code = serializeFileBundle({
      'index.html': '<button id="save">Save</button><script src="script.js"></script>',
      'script.js': 'console.log("saved")',
    });
    renderCodingEnvironment('html-js', {
      code,
      onChange,
      predictionPrompt: 'What happens after Run?',
    });

    const htmlViewer = screen.getByLabelText('Read-only code: index.html');
    expect(htmlViewer.querySelector('code')?.textContent)
      .toBe('<button id="save">Save</button><script src="script.js"></script>');
    expect(htmlViewer).toHaveAttribute('data-language', 'html');
    expect(screen.queryByLabelText('Code editor')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'script.js' }));
    const scriptViewer = screen.getByLabelText('Read-only code: script.js');
    expect(scriptViewer.querySelector('code')?.textContent).toBe('console.log("saved")');
    expect(scriptViewer).toHaveAttribute('data-language', 'javascript');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('continues to mount editable Monaco for non-prediction activities', async () => {
    const onChange = vi.fn();
    renderCodingEnvironment('node-js', {
      code: 'console.log("editable")',
      onChange,
    });

    const editor = await screen.findByLabelText('Code editor');
    expect(editor).not.toHaveAttribute('readonly');
    fireEvent.change(editor, { target: { value: 'console.log("changed")' } });
    expect(onChange).toHaveBeenCalledWith('console.log("changed")');
    expect(screen.queryByLabelText(/Read-only code:/)).not.toBeInTheDocument();
  });

  it('shows editable script.js and a read-only API Server panel in fetch mode', async () => {
    const onChange = vi.fn();
    renderCodingEnvironment('fetch', {
      code: 'let response = await fetch("/api/readings");',
      onChange,
      mockApi: {
        routes: [{ method: 'GET', path: '/api/readings', body: [{ aqi: 42 }] }],
      },
    });

    expect(screen.getByRole('button', { name: 'script.js' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'API Server' })).toHaveAttribute('title', 'Read-only mock API');
    expect(await screen.findByLabelText('Code editor')).toHaveValue('let response = await fetch("/api/readings");');

    fireEvent.click(screen.getByRole('button', { name: 'API Server' }));
    expect(screen.queryByLabelText('Code editor')).not.toBeInTheDocument();
    expect(screen.getByText('/api/readings')).toBeInTheDocument();
    expect(screen.getByText('Mock API — no network request')).toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('allows a fetch run to be restarted while a mock request is pending', () => {
    const onRun = vi.fn();
    renderCodingEnvironment('fetch', { isRunning: true, onRun });

    const runAgain = screen.getByRole('button', { name: 'RUN AGAIN' });
    expect(runAgain).toBeEnabled();
    fireEvent.click(runAgain);
    expect(onRun).toHaveBeenCalledTimes(1);
  });

  it('shows editable HTML and JavaScript plus the locked API Server in html-js-fetch mode', async () => {
    const onChange = vi.fn();
    const code = serializeFileBundle({
      'index.html': '<p id="status">Loading</p><script src="script.js"></script>',
      'script.js': 'let response = await fetch("/api/readings");',
    });
    renderCodingEnvironment('html-js-fetch', {
      code,
      onChange,
      mockApi: { routes: [{ method: 'GET', path: '/api/readings', body: [{ aqi: 42 }] }] },
    });

    const workspaceTabNames = screen.getAllByRole('button')
      .map((button) => button.textContent?.trim())
      .filter((name) => ['index.html', 'script.js', 'API Server'].includes(name ?? ''));
    expect(workspaceTabNames).toEqual(['index.html', 'script.js', 'API Server']);

    fireEvent.change(await screen.findByLabelText('Code editor'), {
      target: { value: '<p id="status">Waiting</p><script src="script.js"></script>' },
    });
    expect(parseFileBundle(onChange.mock.calls[0][0], HTML_JS_FILE_NAMES)['script.js'])
      .toBe('let response = await fetch("/api/readings");');

    fireEvent.click(screen.getByRole('button', { name: 'script.js' }));
    expect(screen.getByLabelText('Code editor')).toHaveValue('let response = await fetch("/api/readings");');

    fireEvent.click(screen.getByRole('button', { name: 'API Server' }));
    expect(screen.queryByLabelText('Code editor')).not.toBeInTheDocument();
    expect(screen.getByText('/api/readings')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'API Server' })).toHaveAttribute('title', 'Read-only mock API');
  });

  it('allows an html-js-fetch run to be restarted while a request is pending', () => {
    const onRun = vi.fn();
    renderCodingEnvironment('html-js-fetch', { isRunning: true, onRun });

    const runAgain = screen.getByRole('button', { name: 'RUN AGAIN' });
    expect(runAgain).toBeEnabled();
    fireEvent.click(runAgain);
    expect(onRun).toHaveBeenCalledTimes(1);
  });

  it('shows script.js and a locked index.html tab for an HTML fixture', () => {
    renderCodingEnvironment('dom', {
      code: 'document.body.dataset.ready = "yes";',
      fixtureHtml: '<main id="lesson">Fixture</main>',
    });

    expect(getFileTabNames()).toEqual(['script.js', 'index.html']);
    expect(screen.getByRole('button', { name: 'index.html' })).toHaveAttribute('title', 'Fixed fixture');
  });

  it('shows exactly three bounded files for DOM HTML and CSS fixtures', () => {
    renderCodingEnvironment('dom', {
      fixtureHtml: '<main>Fixture</main>',
      fixtureCss: 'main { color: tomato; }',
    });

    expect(getFileTabNames()).toEqual(['script.js', 'index.html', 'style.css']);
  });

  it('switches DOM fixture tabs between editable JavaScript and read-only host files', async () => {
    const onChange = vi.fn();
    renderCodingEnvironment('dom', {
      code: 'const status = document.getElementById("status");',
      fixtureHtml: '<p id="status">Waiting</p>',
      fixtureCss: '#status { color: green; }',
      onChange,
    });
    let editor = await screen.findByLabelText('Code editor');

    expect(editor).toHaveValue('const status = document.getElementById("status");');
    expect(editor).not.toHaveAttribute('readonly');
    expect(editor).toHaveAttribute('data-language', 'javascript');

    fireEvent.click(screen.getByRole('button', { name: 'index.html' }));
    editor = screen.getByLabelText('Code editor');
    expect(editor).toHaveValue('<p id="status">Waiting</p>');
    expect(editor).toHaveAttribute('readonly');
    expect(editor).toHaveAttribute('data-language', 'html');

    fireEvent.click(screen.getByRole('button', { name: 'style.css' }));
    editor = screen.getByLabelText('Code editor');
    expect(editor).toHaveValue('#status { color: green; }');
    expect(editor).toHaveAttribute('readonly');
    expect(editor).toHaveAttribute('data-language', 'css');

    fireEvent.click(screen.getByRole('button', { name: 'script.js' }));
    editor = screen.getByLabelText('Code editor');
    expect(editor).toHaveValue('const status = document.getElementById("status");');
    expect(editor).not.toHaveAttribute('readonly');
    fireEvent.change(editor, { target: { value: 'console.log("edited")' } });
    expect(onChange).toHaveBeenCalledWith('console.log("edited")');
  });

  it('preserves the two editable html-css files and serialized change envelope', async () => {
    const onChange = vi.fn();
    const code = serializeFileBundle({
      'index.html': '<h1>Page</h1>',
      'style.css': 'h1 { color: blue; }',
    });
    renderCodingEnvironment('html-css', { code, onChange });
    let editor = await screen.findByLabelText('Code editor');

    expect(getFileTabNames()).toEqual(['index.html', 'style.css']);
    expect(editor).toHaveValue('<h1>Page</h1>');
    expect(editor).not.toHaveAttribute('readonly');

    fireEvent.click(screen.getByRole('button', { name: 'style.css' }));
    editor = screen.getByLabelText('Code editor');
    expect(editor).toHaveValue('h1 { color: blue; }');
    expect(editor).not.toHaveAttribute('readonly');
    fireEvent.change(editor, { target: { value: 'h1 { color: green; }' } });

    expect(parseFileBundle(onChange.mock.calls[0][0])).toEqual({
      'index.html': '<h1>Page</h1>',
      'style.css': 'h1 { color: green; }',
    });
  });

  it('preserves two editable html-js files with filename-specific languages', async () => {
    const onChange = vi.fn();
    const code = serializeFileBundle({
      'index.html': '<button id="go">Go</button><script src="script.js"></script>',
      'script.js': 'document.getElementById("go").focus();',
    });
    renderCodingEnvironment('html-js', { code, onChange });
    let editor = await screen.findByLabelText('Code editor');

    expect(getFileTabNames()).toEqual(['index.html', 'script.js']);
    expect(editor).toHaveValue('<button id="go">Go</button><script src="script.js"></script>');
    expect(editor).not.toHaveAttribute('readonly');
    expect(editor).toHaveAttribute('data-language', 'html');

    fireEvent.change(editor, { target: { value: '<button id="go">Launch</button><script src="script.js"></script>' } });
    const htmlEdit = parseFileBundle(onChange.mock.calls[0][0], HTML_JS_FILE_NAMES);
    expect(htmlEdit['script.js']).toBe('document.getElementById("go").focus();');

    fireEvent.click(screen.getByRole('button', { name: 'script.js' }));
    editor = screen.getByLabelText('Code editor');
    expect(editor).toHaveValue('document.getElementById("go").focus();');
    expect(editor).not.toHaveAttribute('readonly');
    expect(editor).toHaveAttribute('data-language', 'javascript');

    fireEvent.change(editor, { target: { value: 'console.log("launched")' } });
    const jsEdit = parseFileBundle(onChange.mock.calls[1][0], HTML_JS_FILE_NAMES);
    expect(jsEdit['index.html']).toContain('<button id="go">');
    expect(jsEdit['script.js']).toBe('console.log("launched")');
  });

  it('preserves three editable html-css-js files with filename-specific languages', async () => {
    const onChange = vi.fn();
    const code = serializeFileBundle({
      'index.html': '<button id="go">Go</button><link rel="stylesheet" href="style.css"><script src="script.js"></script>',
      'style.css': 'button { color: blue; }',
      'script.js': 'document.getElementById("go").focus();',
    });
    renderCodingEnvironment('html-css-js', { code, onChange });
    let editor = await screen.findByLabelText('Code editor');

    expect(getFileTabNames()).toEqual(['index.html', 'style.css', 'script.js']);
    expect(editor).toHaveAttribute('data-language', 'html');
    fireEvent.change(editor, { target: { value: '<button id="go">Launch</button>' } });
    const htmlEdit = parseFileBundle(onChange.mock.calls[0][0], HTML_CSS_JS_FILE_NAMES);
    expect(htmlEdit['style.css']).toBe('button { color: blue; }');
    expect(htmlEdit['script.js']).toBe('document.getElementById("go").focus();');

    fireEvent.click(screen.getByRole('button', { name: 'style.css' }));
    editor = screen.getByLabelText('Code editor');
    expect(editor).not.toHaveAttribute('readonly');
    expect(editor).toHaveAttribute('data-language', 'css');
    fireEvent.change(editor, { target: { value: 'button { color: green; }' } });
    const cssEdit = parseFileBundle(onChange.mock.calls[1][0], HTML_CSS_JS_FILE_NAMES);
    expect(cssEdit['index.html']).toContain('<button id="go">');
    expect(cssEdit['script.js']).toBe('document.getElementById("go").focus();');

    fireEvent.click(screen.getByRole('button', { name: 'script.js' }));
    editor = screen.getByLabelText('Code editor');
    expect(editor).not.toHaveAttribute('readonly');
    expect(editor).toHaveAttribute('data-language', 'javascript');
    fireEvent.change(editor, { target: { value: 'console.log("launched")' } });
    const jsEdit = parseFileBundle(onChange.mock.calls[2][0], HTML_CSS_JS_FILE_NAMES);
    expect(jsEdit['index.html']).toContain('<button id="go">');
    expect(jsEdit['style.css']).toBe('button { color: blue; }');
    expect(jsEdit['script.js']).toBe('console.log("launched")');
  });

  it('adds a fourth read-only Media tab without changing the three-file envelope', async () => {
    const onChange = vi.fn();
    const code = serializeFileBundle({
      'index.html': '<main>Media lesson</main><link rel="stylesheet" href="style.css"><script src="script.js"></script>',
      'style.css': 'main { color: navy; }',
      'script.js': 'console.log("media lesson")',
    });
    renderCodingEnvironment('html-js-css-media', {
      code,
      onChange,
      mediaAssets: [
        { kind: 'image', name: 'Poster', src: '/poster.jpg', alt: 'Lesson poster' },
        { kind: 'audio', name: 'Chime', src: '/chime.mp3' },
      ],
    });

    const workspaceTabNames = screen.getAllByRole('button')
      .map((button) => button.textContent?.trim())
      .filter((name) => ['index.html', 'style.css', 'script.js', 'Media'].includes(name ?? ''));
    expect(workspaceTabNames).toEqual(['index.html', 'style.css', 'script.js', 'Media']);

    fireEvent.click(screen.getByRole('button', { name: 'Media' }));
    expect(screen.queryByLabelText('Code editor')).not.toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Poster/ })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: /Chime/ }));
    expect(onChange).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'style.css' }));
    const editor = await screen.findByLabelText('Code editor');
    expect(editor).toHaveValue('main { color: navy; }');
    fireEvent.change(editor, { target: { value: 'main { color: teal; }' } });
    expect(parseFileBundle(onChange.mock.calls[0][0], HTML_CSS_JS_FILE_NAMES)).toEqual({
      'index.html': '<main>Media lesson</main><link rel="stylesheet" href="style.css"><script src="script.js"></script>',
      'style.css': 'main { color: teal; }',
      'script.js': 'console.log("media lesson")',
    });
  });
});
