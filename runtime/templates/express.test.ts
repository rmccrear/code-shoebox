import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { EXPRESS_MOCK_SETUP } from './express';

declare global {
  interface Window {
    appInstance: any;
    express: any;
    sendPayload?: any;
  }
}

const bootMock = () => {
  vi.useFakeTimers();
  window.sendPayload = vi.fn();
  Function(EXPRESS_MOCK_SETUP)();
};

describe('EXPRESS_MOCK_SETUP', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    bootMock();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
    delete (window as any).appInstance;
    delete (window as any).express;
    delete window.sendPayload;
  });

  it('resolves a registered GET route', async () => {
    window.appInstance.get('/hello', (_req: any, res: any) => res.json({ ok: true }));

    const out = await window.appInstance._handleRequest('GET', '/hello');

    expect(out.status).toBe(200);
    expect(out.data).toEqual({ ok: true });
  });

  it('returns 404 for unknown routes', async () => {
    const out = await window.appInstance._handleRequest('GET', '/nope');

    expect(out.status).toBe(404);
  });

  it('resolves 500 when a sync handler throws', async () => {
    window.appInstance.get('/boom', () => {
      throw new Error('sync-boom');
    });

    const out = await window.appInstance._handleRequest('GET', '/boom');

    expect(out.status).toBe(500);
    expect(out.data.error).toBe('sync-boom');
  });

  it('resolves 500 when an async handler rejects', async () => {
    window.appInstance.get('/aboom', async () => {
      throw new Error('async-boom');
    });

    const out = await window.appInstance._handleRequest('GET', '/aboom');

    expect(out.status).toBe(500);
    expect(out.data.error).toBe('async-boom');
  });
});
