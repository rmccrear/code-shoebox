import { act, fireEvent, render, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { executeCodeInSandbox } from '../runtime/runner';
import { OutputFrame } from './OutputFrame';

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
const mockedExecuteCodeInSandbox = vi.mocked(executeCodeInSandbox);

const renderOutputFrame = (props: Partial<ComponentProps<typeof OutputFrame>> = {}) =>
  render(
    <OutputFrame
      runTrigger={0}
      code="console.log('hello')"
      themeMode="dark"
      environmentMode="dom"
      {...props}
    />
  );

const loadFrame = (container: HTMLElement) => {
  const iframe = container.querySelector('iframe');
  if (!iframe?.contentWindow) throw new Error('OutputFrame iframe did not render');
  vi.spyOn(iframe.contentWindow, 'postMessage').mockImplementation(() => undefined);
  fireEvent.load(iframe);
  const channel = channels[channels.length - 1];
  if (!channel) throw new Error('OutputFrame did not create a MessageChannel');
  return { iframe, channel };
};

describe('OutputFrame', () => {
  beforeEach(() => {
    channels = [];
    vi.stubGlobal('MessageChannel', FakeMessageChannel);
    mockedExecuteCodeInSandbox.mockClear();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('executes code when runTrigger changes', () => {
    const { rerender } = renderOutputFrame({ code: 'console.log("run")' });

    rerender(
      <OutputFrame
        runTrigger={1}
        code="console.log('run')"
        themeMode="dark"
        environmentMode="dom"
      />
    );

    expect(mockedExecuteCodeInSandbox).toHaveBeenCalledWith(expect.anything(), "console.log('run')");
  });

  it('executes DOM code with the exact fixture payload', () => {
    const { rerender } = renderOutputFrame({
      fixtureHtml: '<p id="status">Waiting</p>',
      fixtureCss: '#status { color: green; }',
    });

    rerender(
      <OutputFrame
        runTrigger={1}
        code="document.getElementById('status').textContent = 'Ready';"
        themeMode="dark"
        environmentMode="dom"
        fixtureHtml={'<p id="status">Waiting</p>'}
        fixtureCss="#status { color: green; }"
      />
    );

    expect(mockedExecuteCodeInSandbox).toHaveBeenCalledWith(
      expect.anything(),
      "document.getElementById('status').textContent = 'Ready';",
      {
        fixtureHtml: '<p id="status">Waiting</p>',
        fixtureCss: '#status { color: green; }',
      }
    );
  });

  it('does not forward fixture execution data outside DOM mode', () => {
    const { rerender } = renderOutputFrame({
      environmentMode: 'typescript',
      fixtureHtml: '<p>ignored</p>',
      fixtureCss: 'p { color: red; }',
    });

    rerender(
      <OutputFrame
        runTrigger={1}
        code="console.log('typed')"
        themeMode="dark"
        environmentMode="typescript"
        fixtureHtml="<p>ignored</p>"
        fixtureCss="p { color: red; }"
      />
    );

    expect(mockedExecuteCodeInSandbox).toHaveBeenCalledWith(expect.anything(), "console.log('typed')");
  });

  it('keeps the iframe channel and waits for the next run after fixture props change', () => {
    const { container, rerender } = renderOutputFrame({
      fixtureHtml: '<p>First</p>',
      fixtureCss: 'p { color: red; }',
    });
    const { iframe, channel } = loadFrame(container);

    rerender(
      <OutputFrame
        runTrigger={0}
        code="console.log('latest')"
        themeMode="dark"
        environmentMode="dom"
        fixtureHtml="<p>Latest</p>"
        fixtureCss="p { color: blue; }"
      />
    );

    expect(container.querySelector('iframe')).toBe(iframe);
    expect(channels).toHaveLength(1);
    expect(channel.port1.closed).toBe(false);
    expect(mockedExecuteCodeInSandbox).not.toHaveBeenCalled();

    rerender(
      <OutputFrame
        runTrigger={1}
        code="console.log('latest')"
        themeMode="dark"
        environmentMode="dom"
        fixtureHtml="<p>Latest</p>"
        fixtureCss="p { color: blue; }"
      />
    );

    expect(mockedExecuteCodeInSandbox).toHaveBeenCalledWith(
      expect.anything(),
      "console.log('latest')",
      { fixtureHtml: '<p>Latest</p>', fixtureCss: 'p { color: blue; }' }
    );
  });

  it('hides the iframe and keeps the console for headless modes', () => {
    renderOutputFrame({ environmentMode: 'node-js' });

    expect(screen.getByTitle('Headless Execution')).toHaveClass('hidden');
    expect(screen.getByText('Console (0)')).toBeInTheDocument();
  });

  it('shows HTML modes as live preview without the console panel', () => {
    renderOutputFrame({ environmentMode: 'html', code: '<h1>Hello</h1>' });

    expect(screen.getByTitle('Code Output')).not.toHaveClass('hidden');
    expect(screen.queryByText(/Console/)).not.toBeInTheDocument();
  });

  it('debounces HTML live preview updates', () => {
    vi.useFakeTimers();
    const { rerender } = renderOutputFrame({ environmentMode: 'html', code: '<h1>One</h1>' });

    rerender(
      <OutputFrame
        runTrigger={0}
        code="<h1>Two</h1>"
        themeMode="dark"
        environmentMode="html"
      />
    );

    act(() => {
      vi.advanceTimersByTime(499);
    });
    expect(mockedExecuteCodeInSandbox).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(mockedExecuteCodeInSandbox).toHaveBeenCalledTimes(1);
    expect(mockedExecuteCodeInSandbox).toHaveBeenCalledWith(expect.anything(), '<h1>Two</h1>');
  });

  it('keeps html-js manual-run and exposes its console', () => {
    vi.useFakeTimers();
    const firstBundle = '{"__csFiles__":1,"files":{"index.html":"<button>Go</button>","script.js":"console.log(1)"}}';
    const nextBundle = '{"__csFiles__":1,"files":{"index.html":"<button>Launch</button>","script.js":"console.log(2)"}}';
    const { container, rerender } = renderOutputFrame({ environmentMode: 'html-js', code: firstBundle });

    expect(screen.getByTitle('Code Output')).not.toHaveClass('hidden');
    expect(screen.getByText('Console (0)')).toBeInTheDocument();
    loadFrame(container);
    expect(mockedExecuteCodeInSandbox).not.toHaveBeenCalled();

    rerender(
      <OutputFrame
        runTrigger={0}
        code={nextBundle}
        themeMode="dark"
        environmentMode="html-js"
      />
    );
    act(() => vi.advanceTimersByTime(500));
    expect(mockedExecuteCodeInSandbox).not.toHaveBeenCalled();

    rerender(
      <OutputFrame
        runTrigger={1}
        code={nextBundle}
        themeMode="dark"
        environmentMode="html-js"
      />
    );
    expect(mockedExecuteCodeInSandbox).toHaveBeenCalledTimes(1);
    expect(mockedExecuteCodeInSandbox).toHaveBeenCalledWith(expect.anything(), nextBundle);
  });

  it('keeps html-css-js manual-run and exposes its console', () => {
    vi.useFakeTimers();
    const firstBundle = '{"__csFiles__":1,"files":{"index.html":"<button>Go</button>","style.css":"button{}","script.js":"console.log(1)"}}';
    const nextBundle = '{"__csFiles__":1,"files":{"index.html":"<button>Launch</button>","style.css":"button{color:blue}","script.js":"console.log(2)"}}';
    const { container, rerender } = renderOutputFrame({ environmentMode: 'html-css-js', code: firstBundle });

    expect(screen.getByTitle('Code Output')).not.toHaveClass('hidden');
    expect(screen.getByText('Console (0)')).toBeInTheDocument();
    loadFrame(container);
    expect(mockedExecuteCodeInSandbox).not.toHaveBeenCalled();

    rerender(
      <OutputFrame
        runTrigger={0}
        code={nextBundle}
        themeMode="dark"
        environmentMode="html-css-js"
      />
    );
    act(() => vi.advanceTimersByTime(500));
    expect(mockedExecuteCodeInSandbox).not.toHaveBeenCalled();

    rerender(
      <OutputFrame
        runTrigger={1}
        code={nextBundle}
        themeMode="dark"
        environmentMode="html-css-js"
      />
    );
    expect(mockedExecuteCodeInSandbox).toHaveBeenCalledTimes(1);
    expect(mockedExecuteCodeInSandbox).toHaveBeenCalledWith(expect.anything(), nextBundle);
  });

  it('keeps message handling alive when debugMode toggles', () => {
    const { container, rerender } = renderOutputFrame({ debugMode: false });
    const { channel } = loadFrame(container);

    act(() => {
      channel.port2.postMessage({ type: 'CONSOLE_LOG', payload: 'first log' });
    });
    expect(screen.getByText('first log')).toBeInTheDocument();

    rerender(
      <OutputFrame
        runTrigger={0}
        code="console.log('hello')"
        themeMode="dark"
        environmentMode="dom"
        debugMode
      />
    );

    expect(channels).toHaveLength(1);
    expect(channel.port1.closed).toBe(false);

    act(() => {
      channel.port2.postMessage({ type: 'CONSOLE_LOG', payload: 'second log' });
    });

    expect(screen.getByText('first log')).toBeInTheDocument();
    expect(screen.getByText('second log')).toBeInTheDocument();
  });
});
