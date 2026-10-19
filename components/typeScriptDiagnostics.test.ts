import { describe, expect, it } from 'vitest';
import { createTypeScriptDiagnostics } from './typeScriptDiagnostics';
import ts from 'typescript';
const compilerDirectory = ts.getDefaultLibFilePath({}).replace(/[/\\][^/\\]+$/, '');
const imports = ts.sys.readFile('components/typescriptLibraries.ts')!;
const standardLibraries = Object.fromEntries([...imports.matchAll(/'typescript\/lib\/([^']+)\?raw'/g)].map(match => [`/${match[1]}`, ts.sys.readFile(`${compilerDirectory}/${match[1]}`)!]));

describe('optional TypeScript diagnostics', () => {
  it('checks syntax, assignments, names and members, then clears corrected errors', () => {
    const checker = createTypeScriptDiagnostics('node-ts', standardLibraries);
    const codes = (code: string) => checker.diagnostics({ path: '/script.ts', code }).map(item => item.source);
    expect(codes('const count: number = "wrong";')).toContain('TS2322');
    expect(codes('const count: number = ;')).toContain('TS1109');
    expect(codes('missingValue;')).toContain('TS2304');
    expect(codes('const count = 1; count.toUpperCase();')).toContain('TS2339');
    expect(codes('const count: number = 1; console.log(count);')).toEqual([]);
    checker.dispose();
  });
  it('isolates console/browser environments and includes teaching declarations', () => {
    const node = createTypeScriptDiagnostics('node-ts', standardLibraries);
    const browser = createTypeScriptDiagnostics('typescript', standardLibraries);
    expect(node.diagnostics({path:'/source.ts',code:'document.title = "hello";'}).map(item=>item.source)).toContain('TS2584');
    expect(browser.diagnostics({path:'/source.ts',code:'document.title = "hello";'})).toEqual([]);
    const react = createTypeScriptDiagnostics('react-ts', standardLibraries);
    expect(react.diagnostics({path:'/App.tsx',code:'import React from "react"; const App = () => <div>Hello</div>;'})).toEqual([]);
    expect(react.diagnostics({path:'/App.tsx',code:'import React, {useState} from "react"; const [n,setN] = useState(1); setN("wrong");'}).some(item=>item.source==='TS2345')).toBe(true);
    node.dispose(); browser.dispose(); react.dispose();
  });
  it('resolves local imports and removes deleted workspace files', () => {
    const checker = createTypeScriptDiagnostics('typescript', standardLibraries);
    const request = {path:'/main.ts',code:'import {value} from "./data"; const n: number = value;',files:{'data.ts':'export const value = "wrong";'}};
    expect(checker.diagnostics(request).map(item=>item.source)).toContain('TS2322');
    expect(checker.diagnostics({...request,files:{'data.ts':'export const value = 1;'}})).toEqual([]);
    expect(checker.diagnostics({...request,files:{}}).map(item=>item.source)).toContain('TS2307');
    expect(checker.diagnostics(request).map(item=>item.source)).toContain('TS2322');
    checker.dispose();
  });
});
