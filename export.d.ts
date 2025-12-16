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
type EnvironmentMode = 'dom' | 'p5' | 'react' | 'typescript' | 'react-ts' | 'express' | 'express-ts';
interface EditorProps {
    initialCode: string;
    onChange: (code: string) => void;
    theme?: ThemeMode;
}

interface CodeShoeboxProps {
    /** The current code to display in the editor */
    code: string;
    /** Callback when code changes */
    onCodeChange: (code: string) => void;
    /** The execution environment (DOM, p5, React) */
    environmentMode: EnvironmentMode;
    /** The theme definition object containing colors */
    theme: Theme;
    /** Light or Dark mode */
    themeMode: ThemeMode;
    /**
     * A unique key/id for the session.
     * Changing this value forces the editor to reset (clearing history/undo stack).
     */
    sessionId?: number;
    /**
     * Optional prompt to display in a prediction panel.
     * If present, code editing is disabled and output is blurred until user enters a prediction.
     */
    prediction_prompt?: string;
}
declare const CodeShoebox: react__default.FC<CodeShoeboxProps>;

/**
 * Manages the state of a CodeShoebox instance.
 * @param persistenceKey (Optional) If provided, state is saved to localStorage under this namespace.
 *                       If omitted, state is ephemeral (lost on refresh).
 */
declare const useSandboxState: (persistenceKey?: string) => {
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
