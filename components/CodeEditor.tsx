
import React, { useMemo } from 'react';
import Editor, { OnMount } from "@monaco-editor/react";
import { ThemeMode, EnvironmentMode } from '../types';

interface CodeEditorProps {
  code: string;
  onChange: (value: string | undefined) => void;
  themeMode: ThemeMode;
  environmentMode: EnvironmentMode;
  sessionId: number;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ code, onChange, themeMode, environmentMode, sessionId }) => {
  // Construct a deterministic path based on the sessionId.
  const modelPath = useMemo(() => `sandbox-session-${sessionId}.js`, [sessionId]);

  const language = useMemo(() => {
    if (environmentMode === 'typescript' || environmentMode === 'react-ts') return 'typescript';
    return 'javascript';
  }, [environmentMode]);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editor.focus();
    
    // Optional: Configure compiler options for TS if strict checks are desired in the editor
    if (language === 'typescript') {
        monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
            jsx: monaco.languages.typescript.JsxEmit.React,
            target: monaco.languages.typescript.ScriptTarget.ES2020,
            allowNonTsExtensions: true,
            noLib: false // Include default libs
        });
    }
  };

  return (
    <div className="h-full w-full overflow-hidden">
      <Editor
        key={modelPath} // Force full re-render of Editor component when path changes
        height="100%"
        path={modelPath}
        defaultLanguage={language}
        theme={themeMode === 'dark' ? 'vs-dark' : 'light'}
        defaultValue={code}
        onChange={onChange}
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          wordWrap: 'on',
          automaticLayout: true,
          padding: { top: 16, bottom: 16 },
          scrollBeyondLastLine: false,
          fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
        }}
      />
    </div>
  );
};
