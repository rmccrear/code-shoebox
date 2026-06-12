import { act, fireEvent, render, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ServerOutput } from './ServerOutput';

vi.mock('../runtime/runner', () => ({
  getSandboxHtml: vi.fn(() => '<!doctype html><html><body></body></html>'),
  executeCodeInSandbox: vi.fn(),
  SANDBOX_ATTRIBUTES: 'allow-scripts',
}));

class FakeMessagePort {
  onmessage: ((event: { data: any }) => void) | null = null;
  peer: FakeMessagePort | null = null;
  sent: any[] = [];
  closed = false;

  postMessage(data: any) {
    this.sent.push(data);
    if (this.peer && !this.peer.closed) {
      this.peer.onmessage?.({ data });
    }
  }

  close() {
    this.closed = true;
    this.onmessage = null;
  }

  start() {}

  addEventListener(type: string, listener: (event: { data: any }) => void) {
    if (type === 'message') this.onmessage = listener;
  }

  removeEventListener() {
    this.onmessage = null;
  }
}

class FakeMessageChannel {
  port1 = new FakeMessagePort();
  port2 = new FakeMessagePort();

  constructor() {
    this.port1.peer = this.port2;
    this.port2.peer = this.port1;
    channels.push(this);
  }
}

let channels: FakeMessageChannel[] = [];

const renderServerOutput = (props: Partial<ComponentProps<typeof ServerOutput>> = {}) => {
  const view = render(
    <ServerOutput
      runTrigger={0}
      code=""
      themeMode="dark"
      environmentMode="express"
      onTriggerRun={() => {}}
      {...props}
    />
  );
  const iframe = view.container.querySelector('iframe');
  if (!iframe?.contentWindow) throw new Error('ServerOutput iframe did not render');
  vi.spyOn(iframe.contentWindow, 'postMessage').mockImplementation(() => undefined);
  fireEvent.load(iframe);
  const channel = channels[channels.length - 1];
  if (!channel) throw new Error('ServerOutput did not create a MessageChannel');
  return { ...view, iframe, channel };
};

const postFromSandbox = (channel: FakeMessageChannel, data: any) => {
  act(() => {
    channel.port2.postMessage(data);
  });
};

describe('ServerOutput', () => {
  beforeEach(() => {
    channels = [];
    vi.stubGlobal('MessageChannel', FakeMessageChannel);
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('queues a request and triggers a run when Send is clicked', () => {
    const onTriggerRun = vi.fn();
    renderServerOutput({ onTriggerRun });

    fireEvent.click(screen.getByRole('button', { name: 'Send' }));

    expect(onTriggerRun).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Starting...' })).toBeDisabled();
  });

  it('dispatches the queued request when the sandbox reports SERVER_READY', () => {
    const { channel } = renderServerOutput();
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));

    postFromSandbox(channel, { type: 'SERVER_READY' });

    expect(channel.port1.sent).toContainEqual({
      type: 'SIMULATE_REQUEST',
      payload: { method: 'GET', url: '/' },
    });
    expect(screen.getByText('Processing...')).toBeInTheDocument();
  });

  it('renders a completed response', () => {
    const { channel } = renderServerOutput();
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));
    postFromSandbox(channel, { type: 'SERVER_READY' });

    postFromSandbox(channel, {
      type: 'REQUEST_COMPLETE',
      payload: { status: 200, data: { ok: true } },
    });

    expect(screen.getByText('200 OK')).toBeInTheDocument();
    expect(screen.getByText(/"ok": true/)).toBeInTheDocument();
    expect(screen.queryByText('Processing...')).not.toBeInTheDocument();
  });

  it('renders runtime errors received through the window fallback listener', () => {
    const { iframe } = renderServerOutput();
    const message = new MessageEvent('message', {
      data: { type: 'RUNTIME_ERROR', payload: 'boom' },
      source: iframe.contentWindow,
    });
    expect(message.source).toBe(iframe.contentWindow);

    act(() => {
      window.dispatchEvent(message);
    });

    expect(screen.getByText('Runtime Error')).toBeInTheDocument();
    expect(screen.getByText('boom', { selector: 'pre' })).toBeInTheDocument();
  });

  it('times out while waiting for SERVER_READY', () => {
    vi.useFakeTimers();
    renderServerOutput();
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(screen.getByText(/Server startup timed out/, { selector: 'pre' })).toBeInTheDocument();
  });

  it('times out when a dispatched request never completes', () => {
    vi.useFakeTimers();
    const { channel } = renderServerOutput();
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));
    postFromSandbox(channel, { type: 'SERVER_READY' });

    act(() => {
      vi.advanceTimersByTime(10000);
    });

    expect(screen.getByText(/Request timed out/, { selector: 'pre' })).toBeInTheDocument();
  });

  it('caps console logs at 500 entries', () => {
    const { channel } = renderServerOutput();

    act(() => {
      for (let i = 0; i < 510; i += 1) {
        channel.port2.postMessage({ type: 'CONSOLE_LOG', payload: `log-${i}` });
      }
    });

    expect(screen.getByText('Console (500)')).toBeInTheDocument();
    expect(screen.queryByText('log-9')).not.toBeInTheDocument();
    expect(screen.getByText('log-10')).toBeInTheDocument();
    expect(screen.getByText('log-509')).toBeInTheDocument();
  });
});
