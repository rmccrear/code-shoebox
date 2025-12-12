
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
  // Construct a deterministic path.
  // We include 'environmentMode' in the path to ensure that switching modes (e.g. DOM -> p5) 
  // generates a unique model URI even if the sessionId (0) stays the same.
  const modelPath = useMemo(() => {
    const basePath = `sandbox-${environmentMode}-${sessionId}`;
    switch (environmentMode) {
      case 'typescript': return `${basePath}.ts`;
      case 'react-ts': return `${basePath}.tsx`;
      case 'react': return `${basePath}.jsx`;
      case 'p5': return `${basePath}.js`;
      default: return `${basePath}.js`;
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
        
        // Add a basic shim for React types
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
        
        // Use 'value' instead of 'defaultValue' to ensure the editor content 
        // always reflects the current state, even if the sessionId doesn't change.
        value={code}
        
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
