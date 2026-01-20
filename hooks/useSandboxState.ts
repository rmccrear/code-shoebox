
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

// Helper: Get starter code for a specific mode, ensuring it always returns a string
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

/**
 * Manages the state of a CodeShoebox instance.
 * @param persistenceKey (Optional) If provided, state is saved to localStorage under this namespace. 
 *                       If omitted, state is ephemeral (lost on refresh).
 */
export const useSandboxState = (persistenceKey?: string) => {
  const STORAGE_PREFIX = persistenceKey ? `cs_${persistenceKey}` : '';
  const getStorageKey = useCallback((key: string) => `${STORAGE_PREFIX}_${key}`, [STORAGE_PREFIX]);

  // -- Initializers --

  const loadSavedMode = (): EnvironmentMode => {
    if (typeof persistenceKey !== 'string' || typeof window === 'undefined') return 'dom';
    try {
      const saved = localStorage.getItem(getStorageKey('env_mode'));
      return (saved as EnvironmentMode) || 'dom';
    } catch { return 'dom'; }
  };

  const loadSavedThemeMode = (): ThemeMode => {
    if (typeof persistenceKey !== 'string' || typeof window === 'undefined') return 'dark';
    try {
      const saved = localStorage.getItem(getStorageKey('theme_mode'));
      return (saved as ThemeMode) || 'dark';
    } catch { return 'dark'; }
  };

  const loadSavedThemeName = (): string => {
    if (typeof persistenceKey !== 'string' || typeof window === 'undefined') return themes[0].name;
    try {
      return localStorage.getItem(getStorageKey('theme_name')) || themes[0].name;
    } catch { return themes[0].name; }
  };

  // Wrapped in useCallback to provide a stable reference and ensures string return type
  const loadSavedCode = useCallback((mode: EnvironmentMode): string => {
    const starter = getStarterCode(mode);
    if (typeof persistenceKey !== 'string' || typeof window === 'undefined') return starter;
    try {
      const key = getStorageKey(`code_${mode}`);
      const saved = localStorage.getItem(key);
      return typeof saved === 'string' ? saved : starter;
    } catch { return starter; }
  }, [persistenceKey, getStorageKey]);

  // -- State --
  const [environmentMode, setEnvironmentMode] = useState<EnvironmentMode>(loadSavedMode);
  const [themeMode, setThemeMode] = useState<ThemeMode>(loadSavedThemeMode);
  const [activeThemeName, setActiveThemeName] = useState<string>(loadSavedThemeName);
  
  // Initialize code state
  // If persistenceKey is missing, we just load the starter code for the default mode ('dom')
  const [code, setCode] = useState<string>(() => {
    return loadSavedCode(environmentMode); 
  });
  
  const [sessionId, setSessionId] = useState<number>(0);

  // -- Effects (Persistence) --

  useEffect(() => {
    if (typeof persistenceKey !== 'string') return;
    localStorage.setItem(getStorageKey('env_mode'), environmentMode);
  }, [environmentMode, persistenceKey, getStorageKey]);

  useEffect(() => {
    if (typeof persistenceKey !== 'string') return;
    const key = getStorageKey(`code_${environmentMode}`);
    localStorage.setItem(key, code);
  }, [code, environmentMode, persistenceKey, getStorageKey]);

  useEffect(() => {
    if (typeof persistenceKey !== 'string') return;
    localStorage.setItem(getStorageKey('theme_mode'), themeMode);
  }, [themeMode, persistenceKey, getStorageKey]);

  useEffect(() => {
    if (typeof persistenceKey !== 'string') return;
    localStorage.setItem(getStorageKey('theme_name'), activeThemeName);
  }, [activeThemeName, persistenceKey, getStorageKey]);

  // -- Actions --

  const switchMode = useCallback((newMode: EnvironmentMode) => {
    if (newMode === environmentMode) return;
    
    // 1. Load code for the NEW mode.
    // If persistenceKey is on, this fetches from LS. If off, fetches starter code.
    const savedCode = loadSavedCode(newMode);
    
    setEnvironmentMode(newMode);
    setCode(savedCode);
    setSessionId(prev => prev + 1);
  }, [environmentMode, loadSavedCode]);

  const resetCode = useCallback(() => {
    const starter = getStarterCode(environmentMode);
    setCode(starter);
    setSessionId(prev => prev + 1);
  }, [environmentMode]);

  return {
    environmentMode,
    themeMode,
    activeThemeName,
    code,
    sessionId,
    // Actions
    setEnvironmentMode: switchMode,
    setThemeMode,
    setActiveThemeName,
    setCode,
    resetCode
  };
};
