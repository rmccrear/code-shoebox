import * as react from 'react';
import react__default from 'react';

interface ThemeColors {
    primary: string;
    primaryForeground: string;
    ring: string;
    sidebarPrimary: string;
    sidebarPrimaryForeground: string;
    sidebarRing: string;
    background?: string;
    foreground?: string;
    [key: string]: string | undefined;
}
interface Theme {
    name: string;
    light: ThemeColors;
    dark: ThemeColors;
}
declare const baseTheme: Theme;
declare const borisTheme: Theme;
declare const modernLabTheme: Theme;
declare const themes: Theme[];

interface ExecutionMessage {
    type: 'EXECUTE_CODE';
    payload: string;
}
type ThemeMode = 'light' | 'dark';
type EnvironmentMode = 'html' | 'html-css' | 'html-js' | 'html-css-js' | 'dom' | 'p5' | 'p5-ts' | 'p5play' | 'react' | 'typescript' | 'react-ts' | 'express' | 'express-ts' | 'node-js' | 'node-ts' | 'hono' | 'hono-ts';
interface EditorProps {
    initialCode: string;
    onChange: (code: string) => void;
    theme?: ThemeMode;
}
interface CodeShoeboxProps {
    code: string;
    onCodeChange: (code: string) => void;
    environmentMode: EnvironmentMode;
    /** Trusted host-authored markup restored before each run in dom mode. */
    fixtureHtml?: string;
    /** Trusted host-authored styles restored with fixtureHtml in dom mode. */
    fixtureCss?: string;
    themeMode: ThemeMode;
    theme: Theme;
    sessionId?: number;
    prediction_prompt?: react__default.ReactNode;
    /** Enables verbose system logging for debugging communication issues */
    debugMode?: boolean;
}

declare const CodeShoebox: react__default.FC<CodeShoeboxProps>;

declare const useSandboxState: (persistenceKey?: string, initialCodeOverride?: string, defaultMode?: EnvironmentMode) => {
    environmentMode: EnvironmentMode;
    themeMode: ThemeMode;
    activeThemeName: string;
    code: string;
    sessionId: number;
    setEnvironmentMode: (newMode: EnvironmentMode) => void;
    setThemeMode: react.Dispatch<react.SetStateAction<ThemeMode>>;
    setActiveThemeName: react.Dispatch<react.SetStateAction<string>>;
    setCode: react.Dispatch<react.SetStateAction<string>>;
    resetCode: () => void;
};

/**
 * Generates a deterministic persistence key based on:
 * 1. The current browser URL path.
 * 2. A unique identifier (e.g., the prompt/question text).
 * 3. The initial code (optional, to distinguish exercises with identical prompts).
 *
 * @param identifier The unique text identifying this specific editor (e.g., the prompt).
 * @param initialCode Optional code snippet to ensure uniqueness if prompts are identical.
 * @param prefix Optional prefix to namespace the key (default: 'auto').
 * @returns A unique hash string to be passed to useSandboxState.
 */
declare const useAutoKey: (identifier: string, initialCode?: string, prefix?: string) => string;

export { CodeShoebox, type CodeShoeboxProps, type EditorProps, type EnvironmentMode, type ExecutionMessage, type Theme, type ThemeColors, type ThemeMode, baseTheme, borisTheme, modernLabTheme, themes, useAutoKey, useSandboxState };
