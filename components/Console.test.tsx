import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Console, LogEntry, toLogParts } from './Console';

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
    expect(spans[1].style.color).toBe('rgb(26, 26, 166)');
    expect(spans[2].style.color).toBe('rgb(26, 26, 166)');
    expect(spans[3].style.color).toBe('rgb(128, 134, 139)');
    expect(spans[4].style.color).toBe('rgb(128, 134, 139)');
    expect(spans[0].parentElement?.textContent).toBe('>1 1 true null undefined');
  });

  it('uses the dark palette in dark mode', () => {
    const { container } = renderLogs([typedLog], 'dark');
    const spans = Array.from(container.querySelectorAll<HTMLElement>('[data-log-kind]'));

    expect(spans[1].style.color).toBe('rgb(153, 128, 255)');
    expect(spans[3].style.color).toBe('rgb(154, 160, 166)');
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
  });
});

describe('toLogParts', () => {
  it('accepts well-formed parts', () => {
    expect(toLogParts([{ kind: 'number', text: '1', extra: true }])).toEqual([{ kind: 'number', text: '1' }]);
    expect(toLogParts([])).toEqual([]);
  });

  it('drops anything malformed', () => {
    expect(toLogParts(undefined)).toBeUndefined();
    expect(toLogParts('1')).toBeUndefined();
    expect(toLogParts([{ kind: 'number', text: 1 }])).toBeUndefined();
    expect(toLogParts([{ kind: 'html', text: '<b>' }])).toBeUndefined();
    expect(toLogParts([null])).toBeUndefined();
  });
});
