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
  assistanceKey?: string;
  pendingLocalChanges: Map<string, string[]>;
}

export const CodeMirrorCodeEditor: React.FC<CodeEditorProps> = props => {
  const { code, onChange, activeFile, environmentMode, themeMode, readOnly = false, enableEmmet = false } = props;
  const parent = useRef<HTMLDivElement>(null);
  const controller = useRef<Controller | null>(null);
  const callback = useRef(onChange);
  useEffect(() => { callback.current = onChange; }, [onChange]);
  const emmetSupport = useMemo(() => new Compartment(), []);
  const path = editorFilename({ activeFile, environmentMode });
  const wantsEmmet = enableEmmet && !readOnly && path.endsWith('.html');

  const extensions = useMemo(() => [
    codeMirrorKeys,
    basicSetup,
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
  ], [activeFile, environmentMode, readOnly, themeMode, emmetSupport]);

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
    const assistanceKey = `${path}-${wantsEmmet}`;
    parent.current!.dataset.emmetStatus = wantsEmmet ? current.emmet ? 'ready' : 'loading' : 'disabled';
    const config = [...extensions, current.listener];
    const assistance = [
      emmetSupport.reconfigure(wantsEmmet && current.emmet ? current.emmet : []),
    ];
    if (file !== current.file) {
      if (current.file) current.files.set(current.file, current.view.state);
      const saved = current.files.get(file);
      const nextState = saved ?? EditorState.create({ doc: code, extensions: config });
      current.view.setState(nextState.update({ effects: [StateEffect.reconfigure.of(config), ...assistance] }).state);
      current.file = file;
      current.view.focus();
    } else if (current.extensions !== extensions || current.assistanceKey !== assistanceKey) {
      current.view.dispatch({ effects: [StateEffect.reconfigure.of(config), ...assistance] });
    }
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
  }, [activeFile, code, extensions, path, wantsEmmet, emmetSupport]);

  return <div ref={parent} data-editor-backend="codemirror" className="h-full w-full overflow-hidden" />;
};
