import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Console, LogEntry, LogSegment, LogValue, toLogParts } from './Console';

const renderLogs = (logs: LogEntry[], themeMode: 'light' | 'dark' = 'light') =>
  render(<Console logs={logs} onClear={vi.fn()} themeMode={themeMode} />);

const typedLog: LogEntry = {
  type: 'log',
  content: '1 1 true null undefined',
  parts: [
    { kind: 'string', text: '1' },
    { kind: 'number', text: '1' },
    { kind: 'boolean', text: 'true' },
    { kind: 'null', text: 'null' },
    { kind: 'undefined', text: 'undefined' }
  ],
  timestamp: 0
};

describe('Console typed parts', () => {
  it('renders parts separated by single spaces with DevTools colors', () => {
    const { container } = renderLogs([typedLog]);
    const spans = Array.from(container.querySelectorAll<HTMLElement>('[data-log-kind]'));

    expect(spans.map((span) => span.dataset.logKind)).toEqual(['string', 'number', 'boolean', 'null', 'undefined']);
    expect(spans[0].style.color).toBe('');
    expect(spans[1].style.color).toBe('rgb(8, 66, 160)');
    expect(spans[2].style.color).toBe('rgb(8, 66, 160)');
    expect(spans[3].style.color).toBe('rgba(31, 31, 31, 0.38)');
    expect(spans[4].style.color).toBe('rgba(31, 31, 31, 0.38)');
    expect(spans[0].parentElement?.textContent).toBe('>1 1 true null undefined');
    // Chrome's near-black base text, so the blue reads as blue.
    expect(spans[0].parentElement?.style.color).toBe('rgb(31, 31, 31)');
  });

  it('uses the dark palette in dark mode', () => {
    const { container } = renderLogs([typedLog], 'dark');
    const spans = Array.from(container.querySelectorAll<HTMLElement>('[data-log-kind]'));

    expect(spans[1].style.color).toBe('rgb(153, 128, 255)');
    expect(spans[3].style.color).toBe('rgba(227, 227, 227, 0.38)');
    expect(spans[0].parentElement?.style.color).toBe('rgb(227, 227, 227)');
  });

  it('falls back to content when parts are missing', () => {
    const { container } = renderLogs([{ type: 'log', content: 'plain text', timestamp: 0 }]);

    expect(screen.getByText('plain text')).toBeInTheDocument();
    expect(container.querySelector('[data-log-kind]')).toBeNull();
  });

  it('keeps warn and error rows as plain row-colored text', () => {
    const { container } = renderLogs([
      { ...typedLog, type: 'warn' },
      { ...typedLog, type: 'error' }
    ]);

    expect(container.querySelector('[data-log-kind]')).toBeNull();
    expect(screen.getAllByText('1 1 true null undefined')).toHaveLength(2);
    // The sandbox checker finds error rows by this class.
    expect(container.querySelectorAll('.text-red-500')).toHaveLength(1);
  });
});

const seg = (kind: string, text: string) => ({ kind, text }) as LogSegment;
const records: LogValue = {
  preview: [seg('subtle', '(2) '), seg('text', '['), seg('subtle', '{…}'), seg('text', ', '), seg('subtle', '{…}'), seg('text', ']')],
  children: [
    {
      name: '0',
      value: {
        preview: [seg('text', '{'), seg('subtle', 'id'), seg('text', ': '), seg('number', '1'), seg('text', ', '),
          seg('subtle', 'name'), seg('text', ': '), seg('string', "'Ash'"), seg('text', '}')],
        children: [
          { name: 'id', value: { preview: [seg('number', '1')] } },
          { name: 'name', value: { preview: [seg('string', '"Ash"')] } }
        ]
      }
    },
    { name: '1', value: { preview: [seg('text', '{'), seg('subtle', 'id'), seg('text', ': '), seg('number', '2'), seg('text', '}')], children: [{ name: 'id', value: { preview: [seg('number', '2')] } }] } },
    { name: 'length', subtle: true, value: { preview: [seg('number', '2')] } }
  ]
};
const treeLog = (value: LogValue, text = '(2) [{…}, {…}]'): LogEntry => ({
  type: 'log',
  content: text,
  parts: [{ kind: 'object', text, value }],
  timestamp: 0
});
/** Tree toggles only; the console header also has a Clear button. */
const toggles = () => screen.queryAllByRole('button').filter((button) => button.hasAttribute('aria-expanded'));
const toggleFor = (start: string) => toggles().find((button) => button.textContent?.slice(1).startsWith(start))!;
const rowTexts = (container: HTMLElement) =>
  Array.from(container.querySelectorAll('[data-console-row]')).map((row) => row.textContent);

describe('Console value trees', () => {
  it('renders a collapsed preview with Chrome colors', () => {
    const { container } = renderLogs([treeLog(records)]);
    const toggle = toggleFor('(2) [{…}, {…}]');

    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(toggle.textContent).toBe('▶(2) [{…}, {…}]');
    expect(container.querySelector<HTMLElement>('[data-seg-kind="subtle"]')?.style.color).toBe('rgb(117, 117, 117)');
    expect(rowTexts(container)).toEqual([]);
  });

  it('toggles open to one row per property and nests', () => {
    const { container } = renderLogs([treeLog(records)]);
    const toggle = toggleFor('(2)');

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(toggle.textContent).toBe('▼(2) [{…}, {…}]');
    expect(rowTexts(container)).toEqual(["▶0: {id: 1, name: 'Ash'}", '▶1: {id: 2}', 'length: 2']);

    const names = Array.from(container.querySelectorAll<HTMLElement>('[data-seg-kind="name"]'));
    expect(names[0].style.color).toBe('rgb(142, 0, 75)');
    expect(names[2].style.color).toBe('rgb(117, 117, 117)');

    fireEvent.click(toggleFor('0:'));
    expect(rowTexts(container)).toEqual([
      "▼0: {id: 1, name: 'Ash'}id: 1name: \"Ash\"", 'id: 1', 'name: "Ash"', '▶1: {id: 2}', 'length: 2'
    ]);
    const stringSpan = Array.from(container.querySelectorAll<HTMLElement>('[data-seg-kind="string"]'))
      .find((span) => span.textContent === '"Ash"');
    expect(stringSpan?.style.color).toBe('rgb(220, 54, 46)');

    fireEvent.click(toggle);
    expect(rowTexts(container)).toEqual([]);
  });

  it('uses the dark Chrome palette in trees', () => {
    const { container } = renderLogs([treeLog(records)], 'dark');
    fireEvent.click(toggleFor('(2)'));
    fireEvent.click(toggleFor('0:'));

    const names = Array.from(container.querySelectorAll<HTMLElement>('[data-seg-kind="name"]'));
    expect(names[0].style.color).toBe('rgb(124, 172, 248)');
    const stringSpan = Array.from(container.querySelectorAll<HTMLElement>('[data-seg-kind="string"]'))
      .find((span) => span.textContent === '"Ash"');
    expect(stringSpan?.style.color).toBe('rgb(92, 213, 251)');
    expect(container.querySelector<HTMLElement>('[data-seg-kind="subtle"]')?.style.color).toBe('rgb(143, 143, 143)');
  });

  it('shows element HTML as text, with start and end tags while open', () => {
    const element: LogValue = {
      preview: [seg('node', '<div class="card">'), seg('subtle', '…'), seg('node', '</div>')],
      open: [seg('node', '<div class="card">')],
      close: [seg('node', '</div>')],
      children: [{ value: { preview: [seg('node', '<img src=x onerror="alert(1)">')] } }]
    };
    const { container } = renderLogs([treeLog(element, '<div class="card">…</div>')]);

    expect(container.querySelector('img')).toBeNull();
    fireEvent.click(toggles()[0]);
    expect(toggles()[0].textContent).toBe('▼<div class="card">');
    expect(rowTexts(container)).toEqual(['<img src=x onerror="alert(1)">', '</div>']);
    expect(container.querySelector('img')).toBeNull();
  });

  it('shows truncated subtrees as an ellipsis row', () => {
    const { container } = renderLogs([treeLog({ preview: [seg('subtle', '{…}')], children: [], truncated: true }, '{…}')]);
    fireEvent.click(toggles()[0]);
    expect(rowTexts(container)).toEqual(['…']);
  });

  it('renders a value without children as plain preview text', () => {
    const { container } = renderLogs([treeLog({ preview: [seg('text', '{}')] }, '{}')]);
    expect(toggles()).toEqual([]);
    expect(container.textContent).toContain('>{}');
  });
});

describe('toLogParts', () => {
  it('accepts well-formed parts', () => {
    expect(toLogParts([{ kind: 'number', text: '1', extra: true }])).toEqual([{ kind: 'number', text: '1' }]);
    expect(toLogParts([])).toEqual([]);
  });

  it('keeps well-formed value trees and strips unknown fields', () => {
    const raw = [{ kind: 'object', text: '[1]', value: { ...records, extra: '<b>', children: [...records.children!, { name: 'x', value: { preview: [], onclick: 'x' } }] } }];
    const parts = toLogParts(raw)!;
    expect(parts[0].value?.children).toHaveLength(4);
    expect(parts[0].value).not.toHaveProperty('extra');
    expect(parts[0].value?.children?.[3].value).toEqual({ preview: [] });
  });

  it('drops a malformed tree but keeps the part text', () => {
    for (const value of [
      'tree',
      { preview: 'x' },
      { preview: [{ kind: 'html', text: '<b>' }] },
      { preview: [], children: [{ name: 1, value: { preview: [] } }] },
      { preview: [], children: [{ value: null }] },
      { preview: [], open: [{ kind: 'node' }] }
    ]) {
      expect(toLogParts([{ kind: 'object', text: '{}', value }]), JSON.stringify(value)).toEqual([{ kind: 'object', text: '{}' }]);
    }
  });

  it('refuses trees deeper than the host ceiling', () => {
    let value: Record<string, unknown> = { preview: [] };
    for (let i = 0; i < 20; i++) value = { preview: [], children: [{ name: 'n', value }] };
    expect(toLogParts([{ kind: 'object', text: '{…}', value }])).toEqual([{ kind: 'object', text: '{…}' }]);
  });

  it('drops anything malformed', () => {
    expect(toLogParts(undefined)).toBeUndefined();
    expect(toLogParts('1')).toBeUndefined();
    expect(toLogParts([{ kind: 'number', text: 1 }])).toBeUndefined();
    expect(toLogParts([{ kind: 'html', text: '<b>' }])).toBeUndefined();
    expect(toLogParts([null])).toBeUndefined();
  });
});
