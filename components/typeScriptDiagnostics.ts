import ts from 'typescript';
import type { EnvironmentMode } from '../types';
import { CONSOLE_SHIM, getEditorDeclarations } from './editorDeclarations';

export interface DiagnosticRequest {
  id: number;
  mode: EnvironmentMode;
  path: string;
  code: string;
  files?: Readonly<Record<string, string>>;
}
export interface TypeDiagnostic {
  from: number;
  to: number;
  severity: 'error' | 'warning' | 'info';
  message: string;
  source: string;
}
export type DiagnosticResponse = { id: number; diagnostics: TypeDiagnostic[] } | { id: number; error: string };

const consoleModes = new Set<EnvironmentMode>(['node-ts', 'express-ts', 'hono-ts']);
const normalize = (path: string) => path.startsWith('/') ? path : `/${path}`;

// No network, Node filesystem, npm type acquisition or learner-code execution.
export function createTypeScriptDiagnostics(mode: EnvironmentMode, libraries: Readonly<Record<string, string>>) {
  const browser = !consoleModes.has(mode);
  const files = new Map(Object.entries(libraries).map(([path, code]) => [path, { code, version: 0 }]));
  const extras = getEditorDeclarations(mode).map(file => ({ path: normalize(file.path), code: file.source }));
  if (mode === 'react-ts') extras.push({ path: '/jsx-shim.d.ts', code: 'declare namespace JSX { interface Element {} interface IntrinsicElements { [name: string]: any; } }' });
  if (!browser) extras.push({ path: '/console-shim.d.ts', code: CONSOLE_SHIM });
  for (const file of extras) files.set(file.path, { code: file.code, version: 0 });
  let project = new Set<string>();
  let revision = 0;
  const options: ts.CompilerOptions = {
    target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.NodeJs, jsx: ts.JsxEmit.React,
    lib: browser ? ['lib.es2020.d.ts', 'lib.dom.d.ts', 'lib.dom.iterable.d.ts'] : ['lib.es2020.d.ts'],
    strict: true, noEmit: true, skipLibCheck: true, allowJs: true, checkJs: false,
    allowSyntheticDefaultImports: true, types: [],
  };
  const service = ts.createLanguageService({
    getCompilationSettings: () => options,
    getScriptFileNames: () => [...project, ...extras.map(file => file.path)],
    getScriptVersion: path => String(files.get(path)?.version ?? 0),
    getScriptSnapshot: path => {
      const file = files.get(path);
      return file ? ts.ScriptSnapshot.fromString(file.code) : undefined;
    },
    getCurrentDirectory: () => '/',
    getDefaultLibFileName: () => '/lib.es2020.d.ts',
    fileExists: path => files.has(path),
    readFile: path => files.get(path)?.code,
    readDirectory: () => [],
    getDirectories: () => [],
    directoryExists: path => path === '/' || [...files.keys()].some(file => file.startsWith(path.replace(/\/$/, '') + '/')),
  });
  return {
    diagnostics(request: Pick<DiagnosticRequest, 'path' | 'code' | 'files'>): TypeDiagnostic[] {
      const path = normalize(request.path);
      const next = new Map(Object.entries(request.files ?? {}).filter(([name]) => /\.[jt]sx?$/.test(name)).map(([name, code]) => [normalize(name), code]));
      next.set(path, request.code);
      for (const old of project) if (!next.has(old)) files.delete(old);
      project = new Set(next.keys());
      for (const [name, code] of next) {
        const previous = files.get(name);
        if (previous?.code !== code) files.set(name, { code, version: ++revision });
      }
      return [...service.getSyntacticDiagnostics(path), ...service.getSemanticDiagnostics(path)].map(diagnostic => {
        const from = Math.min(request.code.length, diagnostic.start ?? 0);
        return {
          from, to: Math.min(request.code.length, from + (diagnostic.length ?? 0)),
          severity: diagnostic.category === ts.DiagnosticCategory.Error ? 'error' : diagnostic.category === ts.DiagnosticCategory.Warning ? 'warning' : 'info',
          message: ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'), source: `TS${diagnostic.code}`,
        };
      });
    },
    dispose: () => service.dispose(),
  };
}
