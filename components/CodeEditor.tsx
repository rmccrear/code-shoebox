import React, { lazy, Suspense, useContext } from 'react';
import { EditorBackendContext } from './EditorBackendContext';
import type { CodeEditorProps } from './editorTypes';

const Monaco = lazy(() => import('./MonacoCodeEditor').then(module => ({ default: module.MonacoCodeEditor })));
const CodeMirror = lazy(() => import('./CodeMirrorCodeEditor').then(module => ({ default: module.CodeMirrorCodeEditor })));

export const CodeEditor: React.FC<CodeEditorProps> = props => {
  const backend = useContext(EditorBackendContext);
  const Implementation = backend === 'codemirror' ? CodeMirror : Monaco;
  return (
    <Suspense fallback={<div className="h-full w-full flex items-center justify-center text-sm opacity-50">Loading Editor...</div>}>
      <Implementation key={`${backend}-${props.environmentMode}-${props.sessionId}`} {...props} />
    </Suspense>
  );
};
