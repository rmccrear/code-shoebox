import { describe, it, expect } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useSandboxState } from './useSandboxState';
import { HTML_STARTER_CODE } from '../constants';

describe('useSandboxState', () => {
  it('defaults to dom mode with the dom starter code', () => {
    const { result } = renderHook(() => useSandboxState('lesson-1'));
    expect(result.current.environmentMode).toBe('dom');
    expect(result.current.code.length).toBeGreaterThan(0);
  });

  it('honors a provided default mode', () => {
    const { result } = renderHook(() => useSandboxState('lesson-1', undefined, 'p5'));
    expect(result.current.environmentMode).toBe('p5');
  });

  it('persists per-mode code to localStorage when a key is given', () => {
    const { result } = renderHook(() => useSandboxState('lesson-1'));
    act(() => result.current.setCode('const answer = 42;'));
    expect(localStorage.getItem('cs_lesson-1_code_dom')).toBe('const answer = 42;');
    expect(localStorage.getItem('cs_lesson-1_env_mode')).toBe('dom');
  });

  it('switching modes loads that mode\'s starter code and bumps sessionId', () => {
    const { result } = renderHook(() => useSandboxState('lesson-1'));
    const initialSession = result.current.sessionId;
    const domCode = result.current.code;

    act(() => result.current.setEnvironmentMode('p5'));

    expect(result.current.environmentMode).toBe('p5');
    expect(result.current.code).not.toBe(domCode);
    expect(result.current.sessionId).toBe(initialSession + 1);
  });

  it('switching to html mode loads its starter and persists under its own key', () => {
    const { result } = renderHook(() => useSandboxState('lesson-1'));
    act(() => result.current.setEnvironmentMode('html'));
    expect(result.current.code).toBe(HTML_STARTER_CODE);
    act(() => result.current.setCode('<h1>mine</h1>'));
    expect(localStorage.getItem('cs_lesson-1_code_html')).toBe('<h1>mine</h1>');
  });

  it('restores previously saved code when switching back to a mode', () => {
    const { result } = renderHook(() => useSandboxState('lesson-1'));
    act(() => result.current.setCode('// my dom work'));
    act(() => result.current.setEnvironmentMode('p5'));
    act(() => result.current.setEnvironmentMode('dom'));
    expect(result.current.code).toBe('// my dom work');
  });

  it('resetCode reverts to starter code and bumps sessionId', () => {
    const { result } = renderHook(() => useSandboxState('lesson-1'));
    const starter = result.current.code;
    const session = result.current.sessionId;
    act(() => result.current.setCode('// scribbles'));
    act(() => result.current.resetCode());
    expect(result.current.code).toBe(starter);
    expect(result.current.sessionId).toBe(session + 1);
  });

  it('is ephemeral (no persistence) when no key is provided', () => {
    const { result } = renderHook(() => useSandboxState());
    act(() => result.current.setCode('// nothing should persist'));
    // No cs_* keys should have been written.
    const keys = Object.keys(localStorage).filter((k) => k.startsWith('cs_'));
    expect(keys).toEqual([]);
  });

  it('falls back to the default mode when localStorage holds an unknown mode', () => {
    localStorage.setItem('cs_lesson-x_env_mode', 'sql');
    const { result } = renderHook(() => useSandboxState('lesson-x'));
    expect(result.current.environmentMode).toBe('dom');
  });

  it('honors a valid persisted mode', () => {
    localStorage.setItem('cs_lesson-y_env_mode', 'p5');
    const { result } = renderHook(() => useSandboxState('lesson-y'));
    expect(result.current.environmentMode).toBe('p5');
  });
});
