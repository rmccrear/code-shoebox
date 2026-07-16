import { fireEvent, render, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CodingEnvironment } from './CodingEnvironment';
import type { EnvironmentMode } from '../types';
import { parseFileBundle, serializeFileBundle } from '../runtime/fileBundle';

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

  it('keeps plain DOM mode as one JavaScript editor without file tabs', () => {
    renderCodingEnvironment('dom', { code: 'console.log("plain")' });

    expect(getFileTabNames()).toEqual([]);
    expect(screen.getByLabelText('Code editor')).toHaveValue('console.log("plain")');
    expect(screen.getByLabelText('Code editor')).not.toHaveAttribute('readonly');
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

  it('switches DOM fixture tabs between editable JavaScript and read-only host files', () => {
    const onChange = vi.fn();
    renderCodingEnvironment('dom', {
      code: 'const status = document.getElementById("status");',
      fixtureHtml: '<p id="status">Waiting</p>',
      fixtureCss: '#status { color: green; }',
      onChange,
    });
    let editor = screen.getByLabelText('Code editor');

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

  it('preserves the two editable html-css files and serialized change envelope', () => {
    const onChange = vi.fn();
    const code = serializeFileBundle({
      'index.html': '<h1>Page</h1>',
      'style.css': 'h1 { color: blue; }',
    });
    renderCodingEnvironment('html-css', { code, onChange });
    let editor = screen.getByLabelText('Code editor');

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
});
