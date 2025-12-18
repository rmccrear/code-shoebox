
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
      case 'typescript': 
      case 'express-ts':
      case 'node-ts': 
        return `${basePath}.ts`;
      case 'react-ts': 
        return `${basePath}.tsx`;
      case 'react': 
        return `${basePath}.jsx`;
      case 'p5': 
        return `${basePath}.js`;
      default: 
        return `${basePath}.js`;
    }
  }, [sessionId, environmentMode]);

  const language = useMemo(() => {
    const tsModes: EnvironmentMode[] = ['typescript', 'react-ts', 'express-ts', 'node-ts'];
    if (tsModes.includes(environmentMode)) return 'typescript';
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
            noLib: false,
            esModuleInterop: true,
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

        // Add a shim for Express types
        if (environmentMode === 'express-ts') {
            monaco.languages.typescript.typescriptDefaults.addExtraLib(
                `
                declare module 'express' {
                    export interface Request {
                        params: any;
                        query: any;
                        body: any;
                        method: string;
                        url: string;
                    }
                    export interface Response {
                        status(code: number): this;
                        json(data: any): void;
                        send(data: any): void;
                    }
                    export interface Application {
                        get(path: string, handler: (req: Request, res: Response) => void): void;
                        post(path: string, handler: (req: Request, res: Response) => void): void;
                        listen(port: number, cb?: () => void): void;
                    }
                    function express(): Application;
                    export default express;
                }
                `,
                'express.d.ts'
            );
        }
    }
  };

  return (
    <div className="monaco-editor-container h-full w-full overflow-hidden">
      <Editor
        key={modelPath} // Force full re-render of Editor component when path changes
        height="100%"
        path={modelPath}
        language={language}
        theme={themeMode === 'dark' ? 'vs-dark' : 'light'}
        
        // Use 'value' instead of 'defaultValue' to ensure the editor content 
        // always reflects the current state, even if the sessionId doesn't change.
        value={code}
        
        onChange={onChange}
        onMount={handleEditorDidMount}
        
        // Ensure loader is configured (optional, helps if CDN is slow)
        loading={<div className="h-full w-full flex items-center justify-center text-sm opacity-50">Loading Editor...</div>}
        
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
          // Improve styling consistency
          lineHeight: 24,
        }}
      />
    </div>
  );
};
