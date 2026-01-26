import { useState, useEffect, useCallback } from 'react';
import { ThemeMode, EnvironmentMode } from '../types';
import { themes } from '../theme';
import { 
  STARTER_CODE, 
  P5_STARTER_CODE, 
  P5_TS_STARTER_CODE,
  REACT_STARTER_CODE, 
  TYPESCRIPT_STARTER_CODE,
  REACT_TS_STARTER_CODE,
  EXPRESS_STARTER_CODE,
  EXPRESS_TS_STARTER_CODE,
  HONO_STARTER_CODE,
  HONO_TS_STARTER_CODE,
  NODE_JS_STARTER_CODE,
  NODE_TS_STARTER_CODE
} from '../constants';

const getStarterCode = (mode: EnvironmentMode): string => {
  switch (mode) {
    case 'p5': return P5_STARTER_CODE;
    case 'p5-ts': return P5_TS_STARTER_CODE;
    case 'react': return REACT_STARTER_CODE;
    case 'typescript': return TYPESCRIPT_STARTER_CODE;
    case 'react-ts': return REACT_TS_STARTER_CODE;
    case 'express': return EXPRESS_STARTER_CODE;
    case 'express-ts': return EXPRESS_TS_STARTER_CODE;
    case 'hono': return HONO_STARTER_CODE;
    case 'hono-ts': return HONO_TS_STARTER_CODE;
    case 'node-js': return NODE_JS_STARTER_CODE;
    case 'node-ts': return NODE_TS_STARTER_CODE;
    default: return STARTER_CODE;
  }
};

export const useSandboxState = (persistenceKey?: string, initialCodeOverride?: string, defaultMode: EnvironmentMode = 'dom') => {
  const STORAGE_PREFIX = persistenceKey ? `cs_${persistenceKey}` : '';
  const getStorageKey = useCallback((key: string) => `${STORAGE_PREFIX}_${key}`, [STORAGE_PREFIX]);

  // Generic loader for simple string/enum values
  const loadState = <T extends string>(keySuffix: string, fallback: T): T => {
    if (!persistenceKey || typeof window === 'undefined') return fallback;
    try {
      const saved = localStorage.getItem(getStorageKey(keySuffix));
      return (saved as T) || fallback;
    } catch { return fallback; }
  };

  // Specialized loader for code which depends on the mode and override
  const loadCode = useCallback((mode: EnvironmentMode): string => {
    const fallback = initialCodeOverride ?? getStarterCode(mode);
    if (!persistenceKey || typeof window === 'undefined') return fallback;
    try {
      const saved = localStorage.getItem(getStorageKey(`code_${mode}`));
      return saved || fallback;
    } catch { return fallback; }
  }, [persistenceKey, getStorageKey, initialCodeOverride]);

  // State Initialization
  const [environmentMode, setEnvironmentMode] = useState<EnvironmentMode>(() => loadState('env_mode', defaultMode));
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => loadState('theme_mode', 'dark'));
  const [activeThemeName, setActiveThemeName] = useState<string>(() => loadState('theme_name', themes[0].name));
  const [code, setCode] = useState<string>(() => loadCode(environmentMode));
  // Seed with a random number to avoid collision on initial render across multiple instances
  const [sessionId, setSessionId] = useState<number>(() => Math.floor(Math.random() * 1000000));

  // Persistence Effects
  useEffect(() => {
    if (!persistenceKey) return;
    localStorage.setItem(getStorageKey('env_mode'), environmentMode);
    localStorage.setItem(getStorageKey('theme_mode'), themeMode);
    localStorage.setItem(getStorageKey('theme_name'), activeThemeName);
    localStorage.setItem(getStorageKey(`code_${environmentMode}`), code);
  }, [environmentMode, themeMode, activeThemeName, code, persistenceKey, getStorageKey]);

  // Actions
  const switchMode = useCallback((newMode: EnvironmentMode) => {
    if (newMode === environmentMode) return;
    setEnvironmentMode(newMode);
    setCode(loadCode(newMode));
    setSessionId(prev => prev + 1);
  }, [environmentMode, loadCode]);

  const resetCode = useCallback(() => {
    const starter = initialCodeOverride ?? getStarterCode(environmentMode);
    setCode(starter);
    setSessionId(prev => prev + 1);
  }, [environmentMode, initialCodeOverride]);

  return {
    environmentMode,
    themeMode,
    activeThemeName,
    code,
    sessionId,
    setEnvironmentMode: switchMode,
    setThemeMode,
    setActiveThemeName,
    setCode,
    resetCode
  };
};