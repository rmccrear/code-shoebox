// components/codeMirrorTypeScript.ts
import { linter } from "@codemirror/lint";
function startTypeScriptDiagnostics(createWorker, mode, onError, onReady) {
  const worker = createWorker();
  let nextId = 0;
  let disposed = false;
  let generation = 0;
  let failed = false;
  const pending = /* @__PURE__ */ new Map();
  function fail(error) {
    if (failed || disposed) return;
    failed = true;
    worker.terminate();
    for (const request of pending.values()) {
      clearTimeout(request.timer);
      request.reject(error);
    }
    pending.clear();
    onError(error);
  }
  worker.onmessage = ({ data }) => {
    const request = pending.get(data.id);
    if (!request) return;
    clearTimeout(request.timer);
    pending.delete(data.id);
    if ("error" in data) {
      request.reject(new Error(data.error));
      fail(new Error(data.error));
    } else {
      onReady();
      request.resolve(data.diagnostics);
    }
  };
  worker.onerror = (event) => {
    event.preventDefault();
    fail(new Error(event.message || "TypeScript worker failed"));
  };
  worker.onmessageerror = () => fail(new Error("Invalid TypeScript worker response"));
  return {
    extension(path, workspace) {
      const activeGeneration = ++generation;
      return linter(async (view) => {
        if (disposed || failed || activeGeneration !== generation) return [];
        const code = view.state.doc.toString();
        const files = workspace();
        const id = ++nextId;
        try {
          const diagnostics = await new Promise((resolve, reject) => {
            const timer = setTimeout(() => fail(new Error("TypeScript worker timed out")), 3e4);
            pending.set(id, { resolve, reject, timer });
            const request = { id, mode, path, code, files };
            try {
              worker.postMessage(request);
            } catch (error) {
              fail(error instanceof Error ? error : new Error(String(error)));
            }
          });
          return disposed || activeGeneration !== generation || view.state.doc.toString() !== code || workspace() !== files ? [] : diagnostics;
        } catch {
          return [];
        }
      }, { delay: 400 });
    },
    dispose() {
      disposed = true;
      worker.terminate();
      worker.onmessage = worker.onerror = worker.onmessageerror = null;
      for (const request of pending.values()) {
        clearTimeout(request.timer);
        request.resolve([]);
      }
      pending.clear();
    }
  };
}
export {
  startTypeScriptDiagnostics
};
