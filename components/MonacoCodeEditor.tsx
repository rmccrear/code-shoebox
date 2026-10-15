
import React, { useEffect, useMemo, useRef } from 'react';
import Editor, { BeforeMount, OnMount } from "@monaco-editor/react";
import { EnvironmentMode } from '../types';
import { registerHtmlEmmetForModel } from './emmet';
import { prepareJsxHighlighting } from './jsxHighlighting';
import type { CodeEditorProps } from './editorTypes';
import { CONSOLE_SHIM, getEditorDeclarations } from './editorDeclarations';

const EDITOR_FONT_FAMILY = 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';

/**
 * JavaScript environments whose runner shadows `window`, `document`, and `root`
 * with `null`. Monaco's default JS lib set includes `lib.dom.d.ts`, so without
 * this distinction the editor advertises a DOM the runtime has deliberately
 * removed — and `let name = "Ada"` merges with the deprecated `window.name`,
 * striking through the learner's own variable.
 */
const CONSOLE_ONLY_JS_MODES: EnvironmentMode[] = ['node-js', 'express', 'hono'];

/**
 * Points the shared JavaScript language service at the lib set that matches
 * this editor's environment.
 *
 * Monaco's language defaults are global to the runtime, not per-model, so a
 * host page holding both a `node-js` and a `dom` sandbox can only have one
 * configuration live at a time. We therefore re-apply on focus as well as on
 * mount: whichever editor the learner is actually typing in is the one
 * configured correctly.
 */
const applyJavaScriptLibs = (monaco: any, environmentMode: EnvironmentMode) => {
  const consoleOnly = CONSOLE_ONLY_JS_MODES.includes(environmentMode);
  const ts = monaco.languages.typescript;

  ts.javascriptDefaults.setCompilerOptions({
    target: ts.ScriptTarget.ES2020,
    allowNonTsExtensions: true,
    allowJs: true,
    lib: consoleOnly ? ['es2020'] : ['es2020', 'dom'],
  });

  // Replaces any previously registered shim under the same path.
  ts.javascriptDefaults.addExtraLib(
    consoleOnly ? CONSOLE_SHIM : '',
    'ts:code-shoebox-console.d.ts'
  );
};

export const MonacoCodeEditor: React.FC<CodeEditorProps> = ({
  code,
  onChange,
  themeMode,
  environmentMode,
  sessionId,
  activeFile,
  enableEmmet = false,
  readOnly = false
}) => {
  const editorTheme = themeMode === 'dark' ? 'vs-dark' : 'light';
  const editorThemeRef = useRef(editorTheme);
  useEffect(() => {
    editorThemeRef.current = editorTheme;
  }, [editorTheme]);

  // Construct a deterministic path.
  const modelPath = useMemo(() => {
    const basePath = `sandbox-${environmentMode}-${sessionId}`;
    // Multi-file modes get one Monaco model per file, preserving per-file
    // undo history across tab switches.
    if (activeFile) return `${basePath}-${activeFile}`;
    switch (environmentMode) {
      case 'typescript':
      case 'express-ts':
      case 'hono-ts':
      case 'p5-ts':
      case 'node-ts':
        return `${basePath}.ts`;
      case 'react-ts':
        return `${basePath}.tsx`;
      case 'html':
        return `${basePath}.html`;
      case 'react':
      case 'react-app':
        return `${basePath}.jsx`;
      case 'p5':
        return `${basePath}.js`;
      default:
        return `${basePath}.js`;
    }
  }, [sessionId, environmentMode, activeFile]);

  const language = useMemo(() => {
    if (activeFile?.endsWith('.html')) return 'html';
    if (activeFile?.endsWith('.css')) return 'css';
    if (activeFile?.endsWith('.js')) return 'javascript';
    if (activeFile?.endsWith('.jsx')) return 'jsx';
    if (environmentMode === 'html') return 'html';
    if (environmentMode === 'react-app') return 'jsx';
    const tsModes: EnvironmentMode[] = ['typescript', 'react-ts', 'express-ts', 'hono-ts', 'node-ts', 'p5-ts'];
    if (tsModes.includes(environmentMode)) return 'typescript';
    return 'javascript';
  }, [environmentMode, activeFile]);

  const handleBeforeMount: BeforeMount = (monaco) => {
    if (language !== 'jsx') return;

    void prepareJsxHighlighting(monaco)
      .then(() => monaco.editor.setTheme(editorThemeRef.current))
      .catch((error) => {
        console.error('[CodeShoebox] Failed to enable JSX syntax highlighting.', error);
      });
  };

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editor.focus();

    const refreshEditorMetrics = () => {
      monaco.editor.remeasureFonts();
      editor.layout();
    };

    refreshEditorMetrics();
    window.requestAnimationFrame(refreshEditorMetrics);
    window.setTimeout(refreshEditorMetrics, 250);
    document.fonts?.ready
      .then(refreshEditorMetrics)
      .catch(() => undefined);

    if (enableEmmet && language === 'html' && !readOnly) {
      const model = editor.getModel();
      if (model) {
        let editorDisposed = false;
        let disposeEmmet: (() => void) | undefined;

        void registerHtmlEmmetForModel(monaco, model).then((dispose) => {
          if (editorDisposed) dispose();
          else disposeEmmet = dispose;
        }).catch((error) => {
          if (!editorDisposed) console.error('[CodeShoebox] Failed to enable Emmet.', error);
        });

        editor.onDidDispose(() => {
          editorDisposed = true;
          disposeEmmet?.();
        });
      }
    }

    // Match the JS lib set to this environment, and re-assert it whenever this
    // editor regains focus — the language defaults are shared across every
    // editor on the page, so the last one touched has to win.
    if (language === 'javascript') {
      applyJavaScriptLibs(monaco, environmentMode);
      editor.onDidFocusEditorText(() => applyJavaScriptLibs(monaco, environmentMode));
    }

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

        for (const { source, path } of getEditorDeclarations(environmentMode)) {
          monaco.languages.typescript.typescriptDefaults.addExtraLib(source, path);
        }
    }
  };

  return (
    <div className="monaco-editor-container h-full w-full overflow-hidden">
      <Editor
        key={`${modelPath}-${enableEmmet ? 'emmet' : 'plain'}`} // Re-register editor features when the opt-in changes.
        height="100%"
        path={modelPath}
        language={language}
        theme={editorTheme}
        value={code}
        onChange={onChange}
        beforeMount={handleBeforeMount}
        onMount={handleEditorDidMount}
        loading={<div className="h-full w-full flex items-center justify-center text-sm opacity-50">Loading Editor...</div>}
        options={{
          readOnly: readOnly,
          minimap: { enabled: false },
          fontSize: 14,
          wordWrap: 'on',
          automaticLayout: true,
          padding: { top: 16, bottom: 16 },
          scrollBeyondLastLine: false,
          fontFamily: EDITOR_FONT_FAMILY,
          fontLigatures: false,
          fixedOverflowWidgets: true,
          renderValidationDecorations: 'on',
          lineHeight: 24,
          letterSpacing: 0,
        }}
      />
    </div>
  );
};
