// components/CodeEditor.tsx
import { lazy, Suspense, useContext } from "react";

// components/EditorBackendContext.ts
import { createContext } from "react";
var EditorBackendContext = createContext("codemirror");

// components/CodeEditor.tsx
import { jsx } from "react/jsx-runtime";
var Monaco = lazy(() => import("./MonacoCodeEditor-7DYHM6J2.js").then((module) => ({ default: module.MonacoCodeEditor })));
var CodeMirror = lazy(() => import("./CodeMirrorCodeEditor-YQTHKQQR.js").then((module) => ({ default: module.CodeMirrorCodeEditor })));
var CodeEditor = (props) => {
  const backend = useContext(EditorBackendContext);
  const Implementation = backend === "codemirror" ? CodeMirror : Monaco;
  return /* @__PURE__ */ jsx(Suspense, { fallback: /* @__PURE__ */ jsx("div", { className: "h-full w-full flex items-center justify-center text-sm opacity-50", children: "Loading Editor..." }), children: /* @__PURE__ */ jsx(Implementation, { ...props }, `${backend}-${props.environmentMode}-${props.sessionId}`) });
};
export {
  CodeEditor
};
