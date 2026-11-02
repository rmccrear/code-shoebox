import { describe, expect, it, vi } from 'vitest';
import { getSandboxHtml } from './runner';
import { FORMAT_RUNTIME_VALUE_SOURCE, KERNEL_SCRIPTS } from './templates/common';

// The kernel and the page bridge are strings serialized into srcdoc, so these
// tests evaluate the same source with a stand-in window and console (issue #29).
const describeRuntimeValue = new Function(
  `${FORMAT_RUNTIME_VALUE_SOURCE}\nreturn describeRuntimeValue;`
)() as (value: unknown) => { kind: string; text: string };

const silentConsole = () => ({ log: vi.fn(), error: vi.fn(), warn: vi.fn(), info: vi.fn() });

describe('describeRuntimeValue', () => {
  it('keeps the JavaScript type of each primitive', () => {
    expect(describeRuntimeValue('1')).toEqual({ kind: 'string', text: '1' });
    expect(describeRuntimeValue(1)).toEqual({ kind: 'number', text: '1' });
    expect(describeRuntimeValue(NaN)).toEqual({ kind: 'number', text: 'NaN' });
    expect(describeRuntimeValue(BigInt(2))).toEqual({ kind: 'bigint', text: '2' });
    expect(describeRuntimeValue(true)).toEqual({ kind: 'boolean', text: 'true' });
    expect(describeRuntimeValue(null)).toEqual({ kind: 'null', text: 'null' });
    expect(describeRuntimeValue(undefined)).toEqual({ kind: 'undefined', text: 'undefined' });
    expect(describeRuntimeValue(Symbol('s'))).toEqual({ kind: 'symbol', text: 'Symbol(s)' });
  });

  it('describes functions, objects, and errors with the existing text', () => {
    function greet() { return 'hi'; }
    expect(describeRuntimeValue(greet)).toEqual({ kind: 'function', text: String(greet) });
    expect(describeRuntimeValue({ qty: '1' })).toEqual({ kind: 'object', text: '{\n  "qty": "1"\n}' });
    expect(describeRuntimeValue([1, 2])).toEqual({ kind: 'object', text: '[\n  1,\n  2\n]' });
    expect(describeRuntimeValue(new TypeError('bad'))).toEqual({ kind: 'error', text: 'TypeError: bad' });
  });
});

describe('kernel console hook', () => {
  it('posts the joined string as payload and one typed part per argument', () => {
    const postMessage = vi.fn();
    const fakeWindow = { parent: { postMessage }, addEventListener: vi.fn() } as Record<string, unknown>;
    const fakeConsole = silentConsole();
    new Function('window', 'console', 'document', KERNEL_SCRIPTS)(fakeWindow, fakeConsole, {});
    postMessage.mockClear();

    fakeConsole.log('1', 1, true, null, undefined);

    expect(postMessage).toHaveBeenCalledWith({
      type: 'CONSOLE_LOG',
      payload: '1 1 true null undefined',
      parts: [
        { kind: 'string', text: '1' },
        { kind: 'number', text: '1' },
        { kind: 'boolean', text: 'true' },
        { kind: 'null', text: 'null' },
        { kind: 'undefined', text: 'undefined' }
      ]
    }, '*');

    fakeConsole.warn('careful', 2);
    expect(postMessage).toHaveBeenLastCalledWith({
      type: 'CONSOLE_WARN',
      payload: 'careful 2',
      parts: [{ kind: 'string', text: 'careful' }, { kind: 'number', text: '2' }]
    }, '*');

    // Non-console messages keep their old shape.
    (fakeWindow.onerror as (...args: unknown[]) => void)('boom', '', 3, 4, null);
    expect(postMessage).toHaveBeenLastCalledWith(
      { type: 'RUNTIME_ERROR', payload: 'Error: boom (Line 3, Column 4)' },
      '*'
    );
  });
});

describe('html-js page bridge', () => {
  const pageBridgeSource = (html: string) => {
    const match = html.match(/const PAGE_BRIDGE = ("(?:[^"\\]|\\.)*");/);
    if (!match) throw new Error('PAGE_BRIDGE literal not found');
    return JSON.parse(match[1]) as string;
  };

  it('posts typed parts from the page frame', () => {
    const postMessage = vi.fn();
    const fakeWindow = { parent: { postMessage }, addEventListener: vi.fn() };
    const fakeConsole = silentConsole();
    const fakeDocument = { readyState: 'complete', body: {} };
    new Function('window', 'console', 'document', pageBridgeSource(getSandboxHtml('html-js')))(
      fakeWindow, fakeConsole, fakeDocument
    );

    fakeConsole.log('1', 1);

    expect(postMessage).toHaveBeenLastCalledWith({
      type: 'CONSOLE_LOG',
      payload: '1 1',
      parts: [{ kind: 'string', text: '1' }, { kind: 'number', text: '1' }]
    }, '*');
  });

  it('relays parts from the page frame to the host', () => {
    for (const mode of ['html-js', 'html-js-fetch', 'html-css-js', 'html-js-css-media'] as const) {
      expect(getSandboxHtml(mode), `mode=${mode}`).toContain(
        'sendPayload(data.type, String(data.payload), Array.isArray(data.parts) ? data.parts : undefined)'
      );
    }
  });
});
