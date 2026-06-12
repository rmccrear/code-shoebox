import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CodingEnvironment } from './CodingEnvironment';
import type { EnvironmentMode } from '../types';

vi.mock('../runtime/runner', () => ({
  getSandboxHtml: vi.fn(() => '<!doctype html><html><body></body></html>'),
  executeCodeInSandbox: vi.fn(),
  SANDBOX_ATTRIBUTES: 'allow-scripts',
}));

vi.mock('@monaco-editor/react', () => ({
  __esModule: true,
  default: ({ value, onChange, options }: any) => (
    <textarea
      aria-label="Code editor"
      value={value}
      onChange={(event) => onChange(event.currentTarget.value)}
      readOnly={options?.readOnly}
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

const renderCodingEnvironment = (environmentMode: EnvironmentMode) =>
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
    />
  );

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
});
