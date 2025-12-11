import React, { useMemo } from 'react';
import Editor, { OnMount } from "@monaco-editor/react";
import { ThemeMode } from '../types';

interface CodeEditorProps {
  code: string;
  onChange: (value: string | undefined) => void;
  themeMode: ThemeMode;
  sessionId: number;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ code, onChange, themeMode, sessionId }) => {
  // Construct a deterministic path based on the sessionId.
  // When sessionId changes (on reset/mode switch), this path changes,
  // guaranteeing a fresh model in Monaco.
  const modelPath = useMemo(() => `sandbox-session-${sessionId}.js`, [sessionId]);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editor.focus();
  };

  return (
    <div className="h-full w-full overflow-hidden">
      <Editor
        key={modelPath} // Force full re-render of Editor component when path changes
        height="100%"
        path={modelPath}
        defaultLanguage="javascript"
        theme={themeMode === 'dark' ? 'vs-dark' : 'light'}
        // Use defaultValue instead of value to make it "uncontrolled" during its lifecycle.
        // We rely on remounting (via key/path change) to handle resets.
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