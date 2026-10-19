import React, { useEffect, useMemo, useRef } from 'react';
import { basicSetup } from 'codemirror';
import { Annotation, Compartment, EditorState, StateEffect, Transaction } from '@codemirror/state';
import type { Extension } from '@codemirror/state';
import { EditorView, keymap } from '@codemirror/view';
import { indentWithTab } from '@codemirror/commands';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import type { CodeEditorProps } from './editorTypes';
import { codeMirrorKeys } from './codeMirrorKeys';
import type { startTypeScriptDiagnostics } from './codeMirrorTypeScript';

const emptyWorkspace: Readonly<Record<string,string>> = {};
const typeScriptModes = new Set(['typescript','react-ts','node-ts','express-ts','hono-ts','p5-ts']);

const externalChange = Annotation.define<boolean>();

export function editorFilename({ activeFile, environmentMode }: Pick<CodeEditorProps, 'activeFile' | 'environmentMode'>) {
  if (activeFile) return `/${activeFile}`;
  if (environmentMode === 'html') return '/index.html';
  if (environmentMode === 'react-ts') return '/App.tsx';
  if (['react', 'react-app'].includes(environmentMode)) return '/App.jsx';
  return ['typescript', 'express-ts', 'hono-ts', 'p5-ts', 'node-ts'].includes(environmentMode) ? '/script.ts' : '/script.js';
}

export function editorLanguage({ activeFile, environmentMode }: Pick<CodeEditorProps, 'activeFile' | 'environmentMode'>): Extension {
  if (activeFile?.endsWith('.html') || environmentMode === 'html') return html();
  if (activeFile?.endsWith('.css')) return css();
  const typescript = activeFile ? /\.tsx?$/.test(activeFile) : ['typescript', 'react-ts', 'express-ts', 'hono-ts', 'p5-ts', 'node-ts'].includes(environmentMode);
  const jsx = activeFile ? /\.[jt]sx$/.test(activeFile) : ['react', 'react-app', 'react-ts'].includes(environmentMode);
  return javascript({ typescript, jsx });
}

interface Controller {
  view: EditorView;
  files: Map<string, EditorState>;
  file?: string;
  listener: Extension;
  extensions?: Extension[];
  emmet?: Extension;
  typescript?: ReturnType<typeof startTypeScriptDiagnostics>;
  path?: string;
  workspaceFiles?: Readonly<Record<string,string>>;
  assistanceKey?: string;
  pendingLocalChanges: Map<string, string[]>;
}

export const CodeMirrorCodeEditor: React.FC<CodeEditorProps> = props => {
  const { code, onChange, activeFile, environmentMode, themeMode, readOnly = false, enableEmmet = false, createTypeScriptWorker, workspaceFiles } = props;
  const parent = useRef<HTMLDivElement>(null);
  const controller = useRef<Controller | null>(null);
  const callback = useRef(onChange);
  const workspace = useRef(workspaceFiles ?? emptyWorkspace);
  const factory = useRef(createTypeScriptWorker);
  useEffect(() => { workspace.current = workspaceFiles ?? emptyWorkspace; }, [workspaceFiles]);
  useEffect(() => { factory.current = createTypeScriptWorker; }, [createTypeScriptWorker]);
  const typeSupport = useMemo(() => new Compartment(), []);
  useEffect(() => { callback.current = onChange; }, [onChange]);
  const emmetSupport = useMemo(() => new Compartment(), []);
  const path = editorFilename({ activeFile, environmentMode });
  const wantsTypeChecking = !!createTypeScriptWorker && !readOnly && typeScriptModes.has(environmentMode) && /\.tsx?$/.test(path);
  const wantsEmmet = enableEmmet && !readOnly && path.endsWith('.html');

  const extensions = useMemo(() => [
    codeMirrorKeys,
    basicSetup,
    typeSupport.of([]),
    emmetSupport.of([]),
    keymap.of([indentWithTab]),
    editorLanguage({ activeFile, environmentMode }),
    EditorView.lineWrapping,
    EditorState.readOnly.of(readOnly),
    EditorView.editable.of(!readOnly),
    EditorView.contentAttributes.of({ 'aria-label': 'Code editor' }),
    EditorView.theme({
      '&': { height: '100%', fontSize: '14px', backgroundColor: themeMode === 'dark' ? '#1e1e1e' : '#fffffe' },
      '.cm-scroller': { overflow: 'auto', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace', lineHeight: '24px' },
      '.cm-content': { padding: '16px 0', textAlign: 'left' },
      '.cm-gutters': { backgroundColor: themeMode === 'dark' ? '#1e1e1e' : '#fffffe', border: 'none' },
    }, { dark: themeMode === 'dark' }),
    ...(themeMode === 'dark' ? [oneDark] : []),
  ], [activeFile, environmentMode, readOnly, themeMode, emmetSupport, typeSupport]);

  useEffect(() => {
    const listener = EditorView.updateListener.of(update => {
      if (update.docChanged && !update.transactions.some(transaction => transaction.annotation(externalChange))) {
        const code = update.state.doc.toString();
        const current = controller.current;
        if (current?.file) {
          const pending = current.pendingLocalChanges.get(current.file) ?? [];
          current.pendingLocalChanges.set(current.file, [...pending, code].slice(-8));
        }
        callback.current(code);
      }
    });
    const view = new EditorView({ parent: parent.current!, extensions: [listener] });
    const current: Controller = { view, files: new Map(), pendingLocalChanges: new Map(), listener };
    controller.current = current;
    return () => {
      view.destroy();
      controller.current = null;
    };
  }, []);

  useEffect(() => {
    const current = controller.current!;
    let canceled = false;
    parent.current!.dataset.typescriptStatus = wantsTypeChecking ? 'loading' : 'disabled';
    if (!wantsTypeChecking) return;
    void import('./codeMirrorTypeScript').then(({ startTypeScriptDiagnostics }) => {
      if (canceled) return;
      current.typescript = startTypeScriptDiagnostics(factory.current!, environmentMode, error => {
        if (canceled) return;
        parent.current!.dataset.typescriptStatus = 'failed';
        current.view.dispatch({ effects: typeSupport.reconfigure([]) });
        console.error('[CodeShoebox] TypeScript diagnostics failed.', error);
      }, () => { if (!canceled) parent.current!.dataset.typescriptStatus = 'ready'; });
      current.view.dispatch({ effects: typeSupport.reconfigure(current.typescript.extension(current.path!, () => workspace.current)) });
    }).catch(error => {
      if (!canceled) {
        parent.current!.dataset.typescriptStatus = 'failed';
        console.error('[CodeShoebox] TypeScript diagnostics failed.', error);
      }
    });
    return () => {
      canceled = true;
      current.typescript?.dispose();
      current.typescript = undefined;
    };
  }, [wantsTypeChecking, environmentMode, typeSupport]);

  useEffect(() => {
    if (!wantsEmmet) return;
    const current = controller.current!;
    let canceled = false;
    void import('./codeMirrorEmmet').then(({ codeMirrorEmmet }) => {
      if (canceled) return;
      current.emmet = codeMirrorEmmet();
      current.view.dispatch({ effects: emmetSupport.reconfigure(current.emmet) });
      parent.current!.dataset.emmetStatus = 'ready';
    }).catch(error => { if (!canceled) console.error('[CodeShoebox] Emmet failed to initialize.', error); });
    return () => { canceled = true; current.emmet = undefined; };
  }, [wantsEmmet, emmetSupport]);

  useEffect(() => {
    const current = controller.current!;
    const file = activeFile ?? 'source';
    current.path = path;
    const assistanceKey = `${path}-${wantsEmmet}-${wantsTypeChecking}`;
    parent.current!.dataset.emmetStatus = wantsEmmet ? current.emmet ? 'ready' : 'loading' : 'disabled';
    const config = [...extensions, current.listener];
    if (file !== current.file || current.extensions !== extensions || current.assistanceKey !== assistanceKey || workspaceFiles !== current.workspaceFiles) {
      const assistance = [
        typeSupport.reconfigure(wantsTypeChecking && current.typescript ? current.typescript.extension(path, () => workspace.current) : []),
        emmetSupport.reconfigure(wantsEmmet && current.emmet ? current.emmet : []),
      ];
      if (file !== current.file) {
        if (current.file) current.files.set(current.file, current.view.state);
        const saved = current.files.get(file);
        const nextState = saved ?? EditorState.create({ doc: code, extensions: config });
        current.view.setState(nextState.update({ effects: [StateEffect.reconfigure.of(config), ...assistance] }).state);
        current.file = file;
        current.view.focus();
      } else {
        current.view.dispatch({ effects: [StateEffect.reconfigure.of(config), ...assistance] });
      }
    }
    current.workspaceFiles = workspaceFiles;
    current.extensions = extensions;
    current.assistanceKey = assistanceKey;
    // React can echo an earlier keystroke after the view has already accepted
    // another one. Acknowledge local echoes without replacing the newer text
    // or moving its cursor. Unrecognized values remain external updates.
    const pending = current.pendingLocalChanges.get(file) ?? [];
    const echoed = pending.indexOf(code);
    if (echoed >= 0) current.pendingLocalChanges.set(file, pending.slice(echoed + 1));
    else if (current.view.state.doc.toString() !== code) {
      current.pendingLocalChanges.delete(file);
      current.view.dispatch({
        changes: { from: 0, to: current.view.state.doc.length, insert: code },
        annotations: [externalChange.of(true), Transaction.addToHistory.of(false)],
      });
    }
  }, [activeFile, code, extensions, path, wantsEmmet, emmetSupport, wantsTypeChecking, typeSupport, workspaceFiles]);

  return <div ref={parent} data-editor-backend="codemirror" className="h-full w-full overflow-hidden" />;
};
