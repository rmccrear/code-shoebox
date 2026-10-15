import { createContext } from 'react';

// The CodeMirror QA release defaults to CodeMirror; the demo can compare Monaco.
export type EditorBackend = 'monaco' | 'codemirror';
export const EditorBackendContext = createContext<EditorBackend>('codemirror');
