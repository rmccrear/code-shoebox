import { describe, expect, it, vi } from 'vitest';
import { getSandboxHtml } from './runner';
import { FORMAT_RUNTIME_VALUE_SOURCE, KERNEL_SCRIPTS } from './templates/common';
import { CONSOLE_VALUE_SOURCE } from './templates/consoleValue';

// The kernel and the page bridge are strings serialized into srcdoc, so these
// tests evaluate the same source with a stand-in window and console (issue #29 follow-up).
type Segment = { kind: string; text: string };
type Value = {
  preview: Segment[];
  open?: Segment[];
  close?: Segment[];
  children?: Array<{ name?: string; subtle?: boolean; value: Value }>;
  truncated?: boolean;
};
type Part = { kind: string; text: string; value?: Value };

const { describeRuntimeValue, describeConsoleArgs } = new Function(
  `${FORMAT_RUNTIME_VALUE_SOURCE}\nreturn { describeRuntimeValue, describeConsoleArgs };`
)() as {
  describeRuntimeValue: (value: unknown) => Part;
  describeConsoleArgs: (args: unknown[]) => { payload: string; parts: Part[] };
};

/** The plain-text `payload` Chrome would show for one console.log call. */
const text = (...args: unknown[]) => describeConsoleArgs(args).payload;
const tree = (value: unknown) => describeRuntimeValue(value).value as Value;
const segText = (segments: Segment[] | undefined) => (segments ?? []).map((s) => s.text).join('');
/** Child rows as `name: preview`, the way the expanded console reads. */
const rows = (value: Value) =>
  (value.children ?? []).map((child) =>
    (child.name === undefined ? '' : child.name + ': ') + segText(child.value.preview));
const kindOf = (segments: Segment[], textValue: string) => segments.find((s) => s.text === textValue)?.kind;

const silentConsole = () => ({ log: vi.fn(), error: vi.fn(), warn: vi.fn(), info: vi.fn() });

describe('console primitives', () => {
  it('keeps the JavaScript type of each primitive', () => {
    expect(describeRuntimeValue('1')).toEqual({ kind: 'string', text: '1' });
    expect(describeRuntimeValue(1)).toEqual({ kind: 'number', text: '1' });
    expect(describeRuntimeValue(NaN)).toEqual({ kind: 'number', text: 'NaN' });
    expect(describeRuntimeValue(-0)).toEqual({ kind: 'number', text: '-0' });
    expect(describeRuntimeValue(-Infinity)).toEqual({ kind: 'number', text: '-Infinity' });
    expect(describeRuntimeValue(BigInt(5))).toEqual({ kind: 'bigint', text: '5n' });
    expect(describeRuntimeValue(true)).toEqual({ kind: 'boolean', text: 'true' });
    expect(describeRuntimeValue(null)).toEqual({ kind: 'null', text: 'null' });
    expect(describeRuntimeValue(undefined)).toEqual({ kind: 'undefined', text: 'undefined' });
    expect(describeRuntimeValue(Symbol('s'))).toEqual({ kind: 'symbol', text: 'Symbol(s)' });
  });

  it('joins top-level arguments with one space and leaves strings unquoted', () => {
    expect(text('1', 1, true, null, undefined, BigInt(5))).toBe('1 1 true null undefined 5n');
    expect(text('Total:', 3)).toBe('Total: 3');
    expect(text("it's\nfine")).toBe("it's\nfine");
  });
});

describe('console arrays', () => {
  it('prefixes the length only when it is above one', () => {
    expect(text([1, 2, 3])).toBe('(3) [1, 2, 3]');
    expect(text([1])).toBe('[1]');
    expect(text([])).toBe('[]');
    expect(text(['milk', 'tea', 'coffee', 'bread'])).toBe("(4) ['milk', 'tea', 'coffee', 'bread']");
    expect(text([undefined, null, NaN])).toBe('(3) [undefined, null, NaN]');
  });

  it('abbreviates nested values', () => {
    expect(text([{ id: 1, name: 'Ash' }, { id: 2, name: 'Misty' }])).toBe('(2) [{…}, {…}]');
    expect(text([[1, 2], {}, () => 1, new Map(), new Set([1])])).toBe('(5) [Array(2), {…}, ƒ, Map(0), Set(1)]');
  });

  it('shows holes as empty', () => {
    expect(text([1, , 3])).toBe('(3) [1, empty, 3]');
    expect(text(new Array(2))).toBe('(2) [empty × 2]');
    expect(text([1, , , 4, ,])).toBe('(5) [1, empty × 2, 4, empty]');
  });

  it('stops the preview after 100 items', () => {
    const preview = text(Array.from({ length: 120 }, (_, i) => i));
    expect(preview.startsWith('(120) [0, 1, 2,')).toBe(true);
    expect(preview.endsWith('98, 99, …]')).toBe(true);
  });

  it('lists named array properties after the items', () => {
    const list = Object.assign([1, 2], { total: 3 });
    expect(text(list)).toBe('(2) [1, 2, total: 3]');
  });
});

describe('console objects', () => {
  it('prints Chrome one-line previews', () => {
    expect(text({ qty: '1' })).toBe("{qty: '1'}");
    expect(text({})).toBe('{}');
    expect(text({ qty: '1', name: 'Ash' })).toBe("{qty: '1', name: 'Ash'}");
    expect(text({ list: [1, 2], inner: { a: 1 }, empty: {} })).toBe('{list: Array(2), inner: {…}, empty: {…}}');
  });

  it('shows five properties then an ellipsis', () => {
    expect(text({ a: 1, b: 2, c: 3, d: 4, e: 5, f: 6 })).toBe('{a: 1, b: 2, c: 3, d: 4, e: 5, …}');
    expect(text({ a: 1, b: 2, c: 3, d: 4, e: 5 })).toBe('{a: 1, b: 2, c: 3, d: 4, e: 5}');
    expect(rows(tree({ a: 1, b: 2, c: 3, d: 4, e: 5, f: 6 }))).toHaveLength(6);
  });

  it('chooses quotes and escapes strings inside previews', () => {
    expect(text({ s: "it's" })).toBe(`{s: "it's"}`);
    expect(text({ s: 'say "hi"' })).toBe(`{s: 'say "hi"'}`);
    expect(text({ s: `both ' and "` })).toBe('{s: `both \' and "`}');
    expect(text({ s: 'a\nb' })).toBe("{s: 'a\\nb'}");
    expect(text({ s: 'a'.repeat(150) })).toBe(`{s: '${'a'.repeat(99)}…'}`);
  });

  it('names keys the way Chrome does', () => {
    expect(text({ 'first-name': 'Ash', [Symbol('id')]: 1, ' padded': 2 })).toBe(
      `{first-name: 'Ash', " padded": 2, [Symbol(id)]: 1}`
    );
  });

  it('names class instances and lists functions last', () => {
    class Person { name = 'Ash'; greet() { return 'hi'; } }
    expect(text(new Person())).toBe("Person {name: 'Ash'}");
    expect(text({ greet() { return 1; }, a: 1 })).toBe('{a: 1, greet: ƒ}');
  });

  it('does not run getters', () => {
    const getter = vi.fn(() => 1);
    const value = { get total() { return getter(); }, qty: 2 };
    expect(text(value)).toBe('{qty: 2}');
    expect(rows(tree(value))).toEqual(['qty: 2', 'total: (...)']);
    expect(getter).not.toHaveBeenCalled();
  });

  it('prints Map, Set, Date, RegExp, Promise and Error', () => {
    expect(text(new Map([['a', 1], ['b', 2]]))).toBe("Map(2) {'a' => 1, 'b' => 2}");
    expect(text(new Set([1, 2]))).toBe('Set(2) {1, 2}');
    expect(text({ m: new Map([['a', 1]]), s: new Set() })).toBe('{m: Map(1), s: Set(0)}');
    const date = new Date(0);
    expect(text(date)).toBe(date.toString());
    expect(text(/a+/g)).toBe('/a+/g');
    expect(text(Promise.resolve(1))).toBe('Promise {<pending>}');
    expect(describeRuntimeValue(new TypeError('bad'))).toEqual({ kind: 'error', text: 'TypeError: bad' });
    expect(text({ error: new Error('boom') })).toBe('{error: Error: boom}');
  });
});

describe('console functions', () => {
  it('shows a leading function keyword as ƒ', () => {
    const greet = new Function('return function greet(name) { return name; }')();
    const later = new Function('return async function later() {}')();
    const arrow = new Function('return (a) => a * 2')();
    const Klass = new Function('return class Pet {}')();
    expect(describeRuntimeValue(greet)).toMatchObject({ kind: 'function', text: 'ƒ greet(name) { return name; }' });
    expect(text(later)).toBe('async ƒ later() {}');
    expect(text(arrow)).toBe('(a) => a * 2');
    expect(text(Klass)).toBe('class Pet {}');
    expect(kindOf(tree(greet).preview, 'ƒ')).toBe('fnprefix');
    expect(rows(tree({ greet }))).toEqual(['greet: ƒ greet(name)']);
  });
});

describe('console DOM nodes', () => {
  const page = () => {
    document.body.innerHTML = [
      '<input id="tickets" type="number">',
      '<div class="card main"><h2>Ash</h2><p>Hi <b>there</b></p></div>'
    ].join('');
  };

  it('prints elements as HTML text', () => {
    page();
    expect(text(document.getElementById('tickets'))).toBe('<input id="tickets" type="number">');
    expect(text(document.querySelector('h2'))).toBe('<h2>Ash</h2>');
    expect(text(document.querySelector('.card'))).toBe('<div class="card main">…</div>');
    expect(text(document)).toBe('#document');
    expect(text(document.querySelector('h2')!.firstChild)).toBe('"Ash"');
  });

  it('uses selector titles inside previews', () => {
    page();
    expect(text({ input: document.getElementById('tickets'), card: document.querySelector('.card') }))
      .toBe('{input: input#tickets, card: div.card.main}');
    expect(text(document.querySelectorAll('h2, p'))).toBe('NodeList(2) [h2, p]');
  });

  it('expands an element to its child nodes', () => {
    page();
    const card = tree(document.querySelector('.card'));
    expect(segText(card.open)).toBe('<div class="card main">');
    expect(segText(card.close)).toBe('</div>');
    expect(rows(card)).toEqual(['<h2>Ash</h2>', '<p>…</p>']);
    const paragraph = card.children![1].value;
    expect(rows(paragraph)).toEqual(['"Hi"', '<b>there</b>']);
    expect(tree(document.getElementById('tickets')).children).toBeUndefined();
  });
});

describe('console tree', () => {
  it('snapshots an array of records', () => {
    const value = tree([{ id: 1, name: 'Ash' }, { id: 2, name: 'Misty' }]);
    expect(rows(value)).toEqual(["0: {id: 1, name: 'Ash'}", "1: {id: 2, name: 'Misty'}", 'length: 2']);
    expect(value.children![2].subtle).toBe(true);
    expect(rows(value.children![0].value)).toEqual(['id: 1', 'name: "Ash"']);
    expect(value.children![0].value.children![0].value.children).toBeUndefined();
    expect(JSON.parse(JSON.stringify(value))).toEqual(value);
  });

  it('sorts expanded properties naturally, enumerable first', () => {
    expect(rows(tree({ b: 1, a2: 2, a10: 3, _x: 4 }))).toEqual(['a2: 2', 'a10: 3', 'b: 1', '_x: 4']);
  });

  it('expands Map and Set entries', () => {
    const map = tree(new Map([['a', { n: 1 }]]));
    expect(rows(map)).toEqual(['[[Entries]]: ', 'size: 1']);
    expect(rows(map.children![0].value)).toEqual(["0: {'a' => {…}}"]);
    expect(rows(map.children![0].value.children![0].value)).toEqual(['key: "a"', 'value: {n: 1}']);
    expect(rows(tree(new Set(['x'])).children![0].value)).toEqual(['0: "x"']);
  });

  it('marks circular references as leaves', () => {
    const self: Record<string, unknown> = { a: 1 };
    self.self = self;
    expect(text(self)).toBe('{a: 1, self: {…}}');
    const circular = tree(self).children![1];
    expect(segText(circular.value.preview)).toBe('{a: 1, self: {…}} [circular]');
    expect(circular.value.children).toBeUndefined();
  });

  it('stops at the depth limit', () => {
    let nested: Record<string, unknown> = { leaf: true };
    for (let i = 0; i < 10; i++) nested = { next: nested };
    let node = tree(nested);
    let depth = 0;
    while (node.children && node.children.length) {
      node = node.children[0].value;
      depth++;
    }
    expect(depth).toBe(6);
    expect(node.truncated).toBe(true);
  });

  it('stops at the node limit per console call', () => {
    const big = Array.from({ length: 50 }, () => Array.from({ length: 100 }, (_, i) => i));
    const { parts } = describeConsoleArgs([big, big]);
    const count = (value: Value): number =>
      (value.children ?? []).reduce((sum, child) => sum + 1 + count(child.value), 0);
    expect(count(parts[0].value!) + count(parts[1].value!)).toBe(2000);
    expect(parts[1].value!.truncated).toBe(true);
  });

  it('survives values that throw when inspected', () => {
    const hostile = new Proxy({}, { ownKeys() { throw new Error('nope'); } });
    expect(describeRuntimeValue(hostile).kind).toBe('object');
  });
});

describe('console value source', () => {
  it('cannot close or confuse the kernel script element', () => {
    expect(CONSOLE_VALUE_SOURCE).not.toMatch(/<\/script/i);
    expect(CONSOLE_VALUE_SOURCE).not.toContain('<!--');
    expect(CONSOLE_VALUE_SOURCE).not.toContain('`');
  });
});

describe('kernel console hook', () => {
  it('posts the Chrome-style text as payload and one typed part per argument', () => {
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

    fakeConsole.log({ qty: '1' });
    const message = postMessage.mock.lastCall![0];
    expect(message.payload).toBe("{qty: '1'}");
    expect(message.parts[0]).toMatchObject({ kind: 'object', text: "{qty: '1'}" });
    expect(rows(message.parts[0].value)).toEqual(['qty: "1"']);

    fakeConsole.warn('careful', 2);
    expect(postMessage).toHaveBeenLastCalledWith({
      type: 'CONSOLE_WARN',
      payload: 'careful 2',
      parts: [{ kind: 'string', text: 'careful' }, { kind: 'number', text: '2' }]
    }, '*');

    // Non-console messages keep their old shape and text.
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

  it('posts typed parts and trees from the page frame', () => {
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

    fakeConsole.log([{ id: 1 }]);
    const message = postMessage.mock.lastCall![0];
    expect(message.payload).toBe('[{…}]');
    expect(rows(message.parts[0].value)).toEqual(['0: {id: 1}', 'length: 1']);
    expect(() => structuredClone(message)).not.toThrow();
  });

  it('relays parts, trees included, from the page frame to the host', () => {
    for (const mode of ['html-js', 'html-js-fetch', 'html-css-js', 'html-js-css-media'] as const) {
      expect(getSandboxHtml(mode), `mode=${mode}`).toContain(
        'sendPayload(data.type, String(data.payload), Array.isArray(data.parts) ? data.parts : undefined)'
      );
    }
  });
});
