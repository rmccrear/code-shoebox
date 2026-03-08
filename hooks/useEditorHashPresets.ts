import { useCallback, useEffect, useRef } from 'react';
import { getPresetHashForMode, resolvePresetFromHash } from '../demoPresets';
import { EnvironmentMode } from '../types';

interface UseEditorHashPresetsParams {
  setView: (view: 'editor' | 'demo') => void;
  setIsPredictionMode: (value: boolean) => void;
  setEnvironmentMode: (mode: EnvironmentMode) => void;
  setCode: (code: string) => void;
  bumpEditorMountKey: () => void;
}

export const useEditorHashPresets = ({
  setView,
  setIsPredictionMode,
  setEnvironmentMode,
  setCode,
  bumpEditorMountKey
}: UseEditorHashPresetsParams) => {
  const handlersRef = useRef({
    setView,
    setIsPredictionMode,
    setEnvironmentMode,
    setCode,
    bumpEditorMountKey
  });

  useEffect(() => {
    handlersRef.current = {
      setView,
      setIsPredictionMode,
      setEnvironmentMode,
      setCode,
      bumpEditorMountKey
    };
  }, [setView, setIsPredictionMode, setEnvironmentMode, setCode, bumpEditorMountKey]);

  const applyPresetFromHash = useCallback((rawHash: string) => {
    const preset = resolvePresetFromHash(rawHash);
    if (!preset) return false;

    const handlers = handlersRef.current;
    handlers.setView('editor');
    handlers.setIsPredictionMode(false);
    handlers.setEnvironmentMode(preset.mode);
    handlers.setCode(preset.code);
    handlers.bumpEditorMountKey();
    return true;
  }, []);

  const syncHashForMode = useCallback((mode: EnvironmentMode) => {
    const nextHash = getPresetHashForMode(mode);
    const currentHash = window.location.hash.replace(/^#/, '');

    if (nextHash) {
      if (currentHash !== nextHash) {
        window.location.hash = nextHash;
      } else {
        applyPresetFromHash(nextHash);
      }
      return true;
    }

    if (currentHash) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
    return false;
  }, [applyPresetFromHash]);

  useEffect(() => {
    const applyFromCurrentHash = () => {
      const rawHash = window.location.hash.replace(/^#/, '');
      if (!rawHash) return;
      applyPresetFromHash(rawHash);
    };

    applyFromCurrentHash();
    window.addEventListener('hashchange', applyFromCurrentHash);
    return () => window.removeEventListener('hashchange', applyFromCurrentHash);
  }, [applyPresetFromHash]);

  return { syncHashForMode, applyPresetFromHash };
};
