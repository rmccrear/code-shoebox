import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { MockApiConfig } from '../../types';
import { FETCH_MOCK_SETUP } from './fetch';

type FetchMockWindow = Window & {
  __installFetchMock: (config: MockApiConfig, runSignal: AbortSignal) => void;
};

const installMock = (config: MockApiConfig, runSignal = new AbortController().signal) => {
  new Function(FETCH_MOCK_SETUP)();
  (window as unknown as FetchMockWindow).__installFetchMock(config, runSignal);
};

describe('fetch tutorial mock', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('waits 1000 ms by default and returns a genuine JSON Response', async () => {
    installMock({
      routes: [{ method: 'GET', path: '/api/readings', body: [{ city: 'Portland', aqi: 38 }] }],
    });

    let settled = false;
    const pending = window.fetch('/api/readings').then((response) => {
      settled = true;
      return response;
    });

    await vi.advanceTimersByTimeAsync(999);
    expect(settled).toBe(false);
    await vi.advanceTimersByTimeAsync(1);

    const response = await pending;
    expect(response).toBeInstanceOf(Response);
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('application/json');
    await expect(response.json()).resolves.toEqual([{ city: 'Portland', aqi: 38 }]);
  });

  it('prefers an exact query fixture and otherwise ignores the query string', async () => {
    installMock({
      defaultDelayMs: 0,
      routes: [
        { method: 'GET', path: '/api/readings', body: ['fallback'] },
        { method: 'GET', path: '/api/readings', query: { limit: '1' }, body: ['exact'] },
      ],
    });

    const exactPromise = window.fetch('/api/readings?limit=1');
    const fallbackPromise = window.fetch('/api/readings?limit=4');
    await vi.runAllTimersAsync();
    await expect((await exactPromise).json()).resolves.toEqual(['exact']);
    await expect((await fallbackPromise).json()).resolves.toEqual(['fallback']);
  });

  it('resolves unmatched routes as JSON 404 responses', async () => {
    installMock({ defaultDelayMs: 0, routes: [] });

    const pending = window.fetch('/api/missing');
    await vi.runAllTimersAsync();
    const response = await pending;

    expect(response.ok).toBe(false);
    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({ error: 'No mock route for GET /api/missing' });
  });

  it('rejects declared network errors and absolute URL strings', async () => {
    installMock({
      defaultDelayMs: 0,
      routes: [{ method: 'GET', path: '/api/offline', networkError: true, errorMessage: 'Connection lost' }],
    });

    const offline = window.fetch('/api/offline');
    const offlineExpectation = expect(offline).rejects.toThrow('Connection lost');
    await vi.runAllTimersAsync();
    await offlineExpectation;
    await expect(window.fetch('https://example.com/api/readings')).rejects.toThrow(
      'Network access is disabled in Fetch tutorial mode'
    );
  });

  it('respects learner cancellation during the simulated delay', async () => {
    installMock({
      routes: [{ method: 'GET', path: '/api/readings', body: [] }],
    });
    const controller = new AbortController();
    const pending = window.fetch('/api/readings', { signal: controller.signal });
    const abortExpectation = expect(pending).rejects.toMatchObject({ name: 'AbortError' });

    await vi.advanceTimersByTimeAsync(100);
    controller.abort();

    await abortExpectation;
  });

  it('lets a rerun abort an earlier request while a new run completes', async () => {
    const config: MockApiConfig = {
      defaultDelayMs: 1000,
      routes: [{ method: 'GET', path: '/api/readings', body: ['ready'] }],
    };
    const firstRun = new AbortController();
    installMock(config, firstRun.signal);
    const staleRequest = window.fetch('/api/readings');
    const staleExpectation = expect(staleRequest).rejects.toMatchObject({ name: 'AbortError' });

    firstRun.abort();
    const secondRun = new AbortController();
    installMock(config, secondRun.signal);
    const currentRequest = window.fetch('/api/readings');
    await vi.runAllTimersAsync();

    await staleExpectation;
    await expect((await currentRequest).json()).resolves.toEqual(['ready']);
  });
});
