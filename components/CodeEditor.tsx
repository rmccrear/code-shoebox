
import React, { useMemo } from 'react';
import Editor, { OnMount } from "@monaco-editor/react";
import { ThemeMode, EnvironmentMode } from '../types';

interface CodeEditorProps {
  code: string;
  onChange: (value: string | undefined) => void;
  themeMode: ThemeMode;
  environmentMode: EnvironmentMode;
  sessionId: number;
  readOnly?: boolean;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ 
  code, 
  onChange, 
  themeMode, 
  environmentMode, 
  sessionId,
  readOnly = false 
}) => {
  // Construct a deterministic path based on the sessionId and environment mode.
  // Using the correct file extension (.ts/.tsx) is crucial for Monaco to enable 
  // relevant TypeScript language features and error reporting.
  const modelPath = useMemo(() => {
    switch (environmentMode) {
      case 'typescript': return `sandbox-session-${sessionId}.ts`;
      case 'react-ts': return `sandbox-session-${sessionId}.tsx`;
      case 'react': return `sandbox-session-${sessionId}.jsx`;
      case 'p5': return `sandbox-session-${sessionId}.js`;
      default: return `sandbox-session-${sessionId}.js`;
    }
  }, [sessionId, environmentMode]);

  const language = useMemo(() => {
    if (environmentMode === 'typescript' || environmentMode === 'react-ts') return 'typescript';
    return 'javascript';
  }, [environmentMode]);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editor.focus();
    
    // Configure compiler options for TS
    if (language === 'typescript') {
        monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
            jsx: monaco.languages.typescript.JsxEmit.React,
            target: monaco.languages.typescript.ScriptTarget.ES2020,
            allowNonTsExtensions: true,
            moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
            noLib: false 
        });
        
        // Add a basic shim for React types to prevent "Cannot find module 'react'" 
        // which can be distracting when the environment supports it via CDN.
        if (environmentMode === 'react-ts') {
             monaco.languages.typescript.typescriptDefaults.addExtraLib(
                `
                declare module 'react' { var x: any; export = x; }
                declare module 'react-dom/client' { var x: any; export = x; }
                `,
                'react-shim.d.ts'
             );
        }
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
          readOnly: readOnly,
          minimap: { enabled: false },
          fontSize: 14,
          wordWrap: 'on',
          automaticLayout: true,
          padding: { top: 16, bottom: 16 },
          scrollBeyondLastLine: false,
          fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
          fixedOverflowWidgets: true,
          renderValidationDecorations: 'on',
        }}
      />
    </div>
  );
};
