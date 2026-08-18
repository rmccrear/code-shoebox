import { afterEach, describe, it, expect, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useSandboxState } from './useSandboxState';
import {
  HTML_STARTER_CODE,
  HTML_CSS_STARTER_CODE,
  HTML_JS_STARTER_CODE,
  HTML_CSS_JS_STARTER_CODE,
  HTML_JS_CSS_MEDIA_STARTER_CODE,
} from '../constants';
import { HTML_CSS_JS_FILE_NAMES, HTML_JS_FILE_NAMES, parseFileBundle } from '../runtime/fileBundle';

const storageNamespace = (persistenceKey: string) => Object.fromEntries(
  Object.entries(localStorage).filter(([key]) => key.startsWith(`cs_${persistenceKey}_`)),
);

afterEach(() => {
  vi.restoreAllMocks();
});

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

  it('continues persisting when a mounted hook rerenders with the same key', () => {
    const { result, rerender } = renderHook(
      ({ persistenceKey }) => useSandboxState(persistenceKey),
      { initialProps: { persistenceKey: 'lesson-stable' } },
    );

    act(() => result.current.setCode('// first stable edit'));
    rerender({ persistenceKey: 'lesson-stable' });
    act(() => result.current.setCode('// second stable edit'));

    expect(localStorage.getItem('cs_lesson-stable_code_dom')).toBe('// second stable edit');
  });

  it('blocks all writes to both namespaces after A to B on one mounted hook', () => {
    localStorage.setItem('cs_lesson-a_env_mode', 'dom');
    localStorage.setItem('cs_lesson-a_theme_mode', 'dark');
    localStorage.setItem('cs_lesson-a_theme_name', 'Base (Indigo)');
    localStorage.setItem('cs_lesson-a_code_dom', '// saved A');
    localStorage.setItem('cs_lesson-b_env_mode', 'dom');
    localStorage.setItem('cs_lesson-b_theme_mode', 'light');
    localStorage.setItem('cs_lesson-b_theme_name', 'GitHub Light');
    localStorage.setItem('cs_lesson-b_code_dom', '// saved B');
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { result, rerender } = renderHook(
      ({ persistenceKey }) => useSandboxState(persistenceKey),
      { initialProps: { persistenceKey: 'lesson-a' } },
    );

    act(() => result.current.setCode('// latest A edit'));
    const namespaceA = storageNamespace('lesson-a');
    const namespaceB = storageNamespace('lesson-b');

    rerender({ persistenceKey: 'lesson-b' });
    act(() => {
      result.current.setCode('// edit after A to B');
      result.current.setThemeMode('light');
    });

    expect(storageNamespace('lesson-a')).toEqual(namespaceA);
    expect(storageNamespace('lesson-b')).toEqual(namespaceB);
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it('keeps persistence disabled after A to B to A on one mounted hook', () => {
    localStorage.setItem('cs_return-a_code_dom', '// saved A');
    localStorage.setItem('cs_return-b_code_dom', '// saved B');
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { result, rerender } = renderHook(
      ({ persistenceKey }) => useSandboxState(persistenceKey),
      { initialProps: { persistenceKey: 'return-a' } },
    );

    act(() => result.current.setCode('// latest A edit'));
    const namespaceA = storageNamespace('return-a');
    const namespaceB = storageNamespace('return-b');

    rerender({ persistenceKey: 'return-b' });
    act(() => result.current.setCode('// edit after A to B'));
    rerender({ persistenceKey: 'return-a' });
    act(() => result.current.setCode('// edit after A to B to A'));

    expect(storageNamespace('return-a')).toEqual(namespaceA);
    expect(storageNamespace('return-b')).toEqual(namespaceB);
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it('allows normal keyed remounts without a lifecycle warning', () => {
    localStorage.setItem('cs_lesson-b_code_dom', '// saved B');
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const firstMount = renderHook(() => useSandboxState('lesson-a'));
    act(() => firstMount.result.current.setCode('// saved A'));
    firstMount.unmount();

    const secondMount = renderHook(() => useSandboxState('lesson-b'));

    expect(secondMount.result.current.code).toBe('// saved B');
    expect(warn).not.toHaveBeenCalled();
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

  it('switching to html-css loads a starter that is a valid two-file bundle', () => {
    const { result } = renderHook(() => useSandboxState('lesson-1'));
    act(() => result.current.setEnvironmentMode('html-css'));
    expect(result.current.code).toBe(HTML_CSS_STARTER_CODE);
    const files = parseFileBundle(result.current.code);
    expect(files['index.html']).toContain('<link rel="stylesheet" href="style.css">');
    expect(files['style.css'].trim().length).toBeGreaterThan(0);
    expect(localStorage.getItem('cs_lesson-1_code_html-css')).toBe(HTML_CSS_STARTER_CODE);
  });

  it('switching to html-js loads and persists a linked two-file starter', () => {
    const { result } = renderHook(() => useSandboxState('lesson-1'));
    act(() => result.current.setEnvironmentMode('html-js'));

    expect(result.current.code).toBe(HTML_JS_STARTER_CODE);
    const files = parseFileBundle(result.current.code, HTML_JS_FILE_NAMES);
    expect(files['index.html']).toContain('<script src="script.js"></script>');
    expect(files['script.js'].trim().length).toBeGreaterThan(0);
    expect(localStorage.getItem('cs_lesson-1_code_html-js')).toBe(HTML_JS_STARTER_CODE);
  });

  it('switching to html-css-js loads and persists a linked three-file starter', () => {
    const { result } = renderHook(() => useSandboxState('lesson-1'));
    act(() => result.current.setEnvironmentMode('html-css-js'));

    expect(result.current.code).toBe(HTML_CSS_JS_STARTER_CODE);
    const files = parseFileBundle(result.current.code, HTML_CSS_JS_FILE_NAMES);
    expect(files['index.html']).toContain('<link rel="stylesheet" href="style.css">');
    expect(files['index.html']).toContain('<script src="script.js"></script>');
    expect(files['style.css'].trim().length).toBeGreaterThan(0);
    expect(files['script.js'].trim().length).toBeGreaterThan(0);
    expect(localStorage.getItem('cs_lesson-1_code_html-css-js')).toBe(HTML_CSS_JS_STARTER_CODE);
  });

  it('switching to html-js-css-media loads a linked three-file starter under its own key', () => {
    const { result } = renderHook(() => useSandboxState('lesson-1'));
    act(() => result.current.setEnvironmentMode('html-js-css-media'));

    expect(result.current.code).toBe(HTML_JS_CSS_MEDIA_STARTER_CODE);
    const files = parseFileBundle(result.current.code, HTML_CSS_JS_FILE_NAMES);
    expect(files['index.html']).toContain('<link rel="stylesheet" href="style.css">');
    expect(files['index.html']).toContain('<script src="script.js"></script>');
    expect(files['index.html']).toContain('id="media-gallery"');
    expect(files['style.css'].trim().length).toBeGreaterThan(0);
    expect(files['script.js'].trim().length).toBeGreaterThan(0);
    expect(localStorage.getItem('cs_lesson-1_code_html-js-css-media')).toBe(HTML_JS_CSS_MEDIA_STARTER_CODE);
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
