import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ApiServerPanel } from './ApiServerPanel';

describe('ApiServerPanel', () => {
  it('documents query routes, default latency, canned POST behavior, and network errors', () => {
    render(
      <ApiServerPanel
        themeMode="dark"
        mockApi={{
          defaultDelayMs: 1000,
          routes: [
            { method: 'GET', path: '/api/readings', query: { limit: '4' }, body: [{ aqi: 42 }] },
            { method: 'POST', path: '/api/messages', status: 201, delayMs: 250, body: { ok: true } },
            { method: 'GET', path: '/api/offline', networkError: true, errorMessage: 'Connection lost' },
          ],
        }}
      />
    );

    expect(screen.getByText('Mock API — no network request')).toBeInTheDocument();
    expect(screen.getByText('/api/readings?limit=4')).toBeInTheDocument();
    expect(screen.getAllByText('1000 ms')).toHaveLength(2);
    expect(screen.getByText('250 ms')).toBeInTheDocument();
    expect(screen.getByText('accepted, not inspected')).toBeInTheDocument();
    expect(screen.getByText('Connection lost')).toBeInTheDocument();
  });

  it('renders an empty state when no routes are configured', () => {
    render(<ApiServerPanel themeMode="light" />);
    expect(screen.getByText(/No mock API routes/)).toBeInTheDocument();
  });
});
