import { createTypeScriptDiagnostics } from './typeScriptDiagnostics';
import type { DiagnosticRequest, DiagnosticResponse } from './typeScriptDiagnostics';
import { standardLibraries } from './typescriptLibraries';

let checker: ReturnType<typeof createTypeScriptDiagnostics> | undefined;
let mode: DiagnosticRequest['mode'];
self.onmessage = ({ data }: MessageEvent<DiagnosticRequest>) => {
  let response: DiagnosticResponse;
  try {
    if (mode !== data.mode || !checker) {
      checker?.dispose();
      checker = createTypeScriptDiagnostics(data.mode, standardLibraries);
      mode = data.mode;
    }
    response = { id: data.id, diagnostics: checker.diagnostics(data) };
  } catch (error) {
    response = { id: data.id, error: error instanceof Error ? error.message : String(error) };
  }
  self.postMessage(response);
};
