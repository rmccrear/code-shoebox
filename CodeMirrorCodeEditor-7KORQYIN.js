// components/CodeMirrorCodeEditor.tsx
import { useEffect, useMemo, useRef } from "react";
import { basicSetup } from "codemirror";
import { Annotation, Compartment, EditorState, StateEffect, Transaction } from "@codemirror/state";
import { EditorView, keymap as keymap2 } from "@codemirror/view";
import { indentWithTab } from "@codemirror/commands";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { javascript } from "@codemirror/lang-javascript";
import { oneDark } from "@codemirror/theme-one-dark";

// components/codeMirrorKeys.ts
import { Prec } from "@codemirror/state";
import { keymap } from "@codemirror/view";
import { acceptCompletion, autocompletion, closeCompletion, completionKeymap } from "@codemirror/autocomplete";
var codeMirrorKeys = [
  autocompletion({ defaultKeymap: false }),
  Prec.highest(keymap.of([
    ...completionKeymap.filter((binding) => binding.key !== "Enter"),
    { key: "Tab", run: acceptCompletion },
    { key: "Enter", run: (view) => {
      closeCompletion(view);
      return false;
    } }
  ]))
];

// components/CodeMirrorCodeEditor.tsx
import { jsx } from "react/jsx-runtime";
var externalChange = Annotation.define();
function editorFilename({ activeFile, environmentMode }) {
  if (activeFile) return `/${activeFile}`;
  if (environmentMode === "html") return "/index.html";
  if (environmentMode === "react-ts") return "/App.tsx";
  if (["react", "react-app"].includes(environmentMode)) return "/App.jsx";
  return ["typescript", "express-ts", "hono-ts", "p5-ts", "node-ts"].includes(environmentMode) ? "/script.ts" : "/script.js";
}
function editorLanguage({ activeFile, environmentMode }) {
  if (activeFile?.endsWith(".html") || environmentMode === "html") return html();
  if (activeFile?.endsWith(".css")) return css();
  const typescript = activeFile ? /\.tsx?$/.test(activeFile) : ["typescript", "react-ts", "express-ts", "hono-ts", "p5-ts", "node-ts"].includes(environmentMode);
  const jsx2 = activeFile ? /\.[jt]sx$/.test(activeFile) : ["react", "react-app", "react-ts"].includes(environmentMode);
  return javascript({ typescript, jsx: jsx2 });
}
var CodeMirrorCodeEditor = (props) => {
  const { code, onChange, activeFile, environmentMode, themeMode, readOnly = false, enableEmmet = false } = props;
  const parent = useRef(null);
  const controller = useRef(null);
  const callback = useRef(onChange);
  useEffect(() => {
    callback.current = onChange;
  }, [onChange]);
  const emmetSupport = useMemo(() => new Compartment(), []);
  const path = editorFilename({ activeFile, environmentMode });
  const wantsEmmet = enableEmmet && !readOnly && path.endsWith(".html");
  const extensions = useMemo(() => [
    codeMirrorKeys,
    basicSetup,
    emmetSupport.of([]),
    keymap2.of([indentWithTab]),
    editorLanguage({ activeFile, environmentMode }),
    EditorView.lineWrapping,
    EditorState.readOnly.of(readOnly),
    EditorView.editable.of(!readOnly),
    EditorView.contentAttributes.of({ "aria-label": "Code editor" }),
    EditorView.theme({
      "&": { height: "100%", fontSize: "14px", backgroundColor: themeMode === "dark" ? "#1e1e1e" : "#fffffe" },
      ".cm-scroller": { overflow: "auto", fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace", lineHeight: "24px" },
      ".cm-content": { padding: "16px 0", textAlign: "left" },
      ".cm-gutters": { backgroundColor: themeMode === "dark" ? "#1e1e1e" : "#fffffe", border: "none" }
    }, { dark: themeMode === "dark" }),
    ...themeMode === "dark" ? [oneDark] : []
  ], [activeFile, environmentMode, readOnly, themeMode, emmetSupport]);
  useEffect(() => {
    const listener = EditorView.updateListener.of((update) => {
      if (update.docChanged && !update.transactions.some((transaction) => transaction.annotation(externalChange))) {
        const code2 = update.state.doc.toString();
        const current2 = controller.current;
        if (current2?.file) {
          const pending = current2.pendingLocalChanges.get(current2.file) ?? [];
          current2.pendingLocalChanges.set(current2.file, [...pending, code2].slice(-8));
        }
        callback.current(code2);
      }
    });
    const view = new EditorView({ parent: parent.current, extensions: [listener] });
    const current = { view, files: /* @__PURE__ */ new Map(), pendingLocalChanges: /* @__PURE__ */ new Map(), listener };
    controller.current = current;
    return () => {
      view.destroy();
      controller.current = null;
    };
  }, []);
  useEffect(() => {
    if (!wantsEmmet) return;
    const current = controller.current;
    let canceled = false;
    void import("./codeMirrorEmmet-BMZOYDLO.js").then(({ codeMirrorEmmet }) => {
      if (canceled) return;
      current.emmet = codeMirrorEmmet();
      current.view.dispatch({ effects: emmetSupport.reconfigure(current.emmet) });
      parent.current.dataset.emmetStatus = "ready";
    }).catch((error) => {
      if (!canceled) console.error("[CodeShoebox] Emmet failed to initialize.", error);
    });
    return () => {
      canceled = true;
      current.emmet = void 0;
    };
  }, [wantsEmmet, emmetSupport]);
  useEffect(() => {
    const current = controller.current;
    const file = activeFile ?? "source";
    const assistanceKey = `${path}-${wantsEmmet}`;
    parent.current.dataset.emmetStatus = wantsEmmet ? current.emmet ? "ready" : "loading" : "disabled";
    const config = [...extensions, current.listener];
    const assistance = [
      emmetSupport.reconfigure(wantsEmmet && current.emmet ? current.emmet : [])
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
    const pending = current.pendingLocalChanges.get(file) ?? [];
    const echoed = pending.indexOf(code);
    if (echoed >= 0) current.pendingLocalChanges.set(file, pending.slice(echoed + 1));
    else if (current.view.state.doc.toString() !== code) {
      current.pendingLocalChanges.delete(file);
      current.view.dispatch({
        changes: { from: 0, to: current.view.state.doc.length, insert: code },
        annotations: [externalChange.of(true), Transaction.addToHistory.of(false)]
      });
    }
  }, [activeFile, code, extensions, path, wantsEmmet, emmetSupport]);
  return /* @__PURE__ */ jsx("div", { ref: parent, "data-editor-backend": "codemirror", className: "h-full w-full overflow-hidden" });
};
export {
  CodeMirrorCodeEditor,
  editorFilename,
  editorLanguage
};
