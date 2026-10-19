import type { EnvironmentMode, ThemeMode } from '../types';

export interface CodeEditorProps {
  createTypeScriptWorker?: () => Worker;
  workspaceFiles?: Readonly<Record<string, string>>;
  code: string;
  onChange: (value: string | undefined) => void;
  themeMode: ThemeMode;
  environmentMode: EnvironmentMode;
  sessionId: number;
  activeFile?: string;
  enableEmmet?: boolean;
  readOnly?: boolean;
}
