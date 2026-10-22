import { afterEach, describe, expect, it } from "vitest";
import { EditorState } from "@codemirror/state";
import { EditorView, runScopeHandlers } from "@codemirror/view";
import { html } from "@codemirror/lang-html";
import { CompletionContext } from "@codemirror/autocomplete";
import {
  expandAbbreviation,
} from "@emmetio/codemirror6-plugin";

import { basicSetup } from 'codemirror';
import { undo, redo } from '@codemirror/commands';
import { codeMirrorEmmet, htmlEmmetCompletions } from './codeMirrorEmmet';
import { codeMirrorKeys } from './codeMirrorKeys';

const views: EditorView[] = [];
afterEach(() => views.splice(0).forEach(view => view.destroy()));

function editor(text: string, prefix = "", existing = false, readOnly = false) {
  let state = EditorState.create({
    doc: prefix + (existing ? text : ""),
    selection: { anchor: prefix.length + (existing ? text.length : 0) },
    extensions: [html(), basicSetup, codeMirrorKeys, codeMirrorEmmet(), EditorState.readOnly.of(readOnly)],
  });
  // Tracking must see real incremental input, including partial tag names.
  for (const character of existing ? "" : text) {
    const pos = state.selection.main.head;
    state = state.update({
      changes: { from: pos, insert: character },
      selection: { anchor: pos + character.length },
      userEvent: "input.type",
    }).state;
  }
  const view = new EditorView({ state, parent: document.body });
  views.push(view);
  return view;
}

function completion(view: EditorView) {
  return htmlEmmetCompletions(new CompletionContext(view.state, view.state.selection.main.head, false));
}
function tab(view: EditorView) {
  return runScopeHandlers(view, new KeyboardEvent("keydown", { key: "Tab" }), "editor");
}

describe("selective automatic HTML Emmet", () => {
  it.each(['div|erse', 'a|bout', 'div|-widget', 'div|2', 'div|é', '.card|inal'])(
    "does not expand a prefix inside saved text %s", async marked => {
      const text = marked.replace('|', '');
      const view = editor(text, '', true);
      view.dispatch({ selection: { anchor: marked.indexOf('|') } });
      expect(await completion(view)).toBeNull();
      expect(tab(view)).toBe(false);
      expect(view.state.doc.toString()).toBe(text);
    },
  );

  it.each(['<p>The result is 2 > a|</p>', '<p>Hello > div|</p>', '2 > .card|'])(
    "does not treat a literal greater-than sign as a tag boundary in %s", async marked => {
      const text = marked.replace('|', '');
      const view = editor(text, '', true);
      view.dispatch({ selection: { anchor: marked.indexOf('|') } });
      expect(await completion(view)).toBeNull();
      expect(tab(view)).toBe(false);
      expect(view.state.doc.toString()).toBe(text);
    },
  );

  it.each(['<p> span|</p>', '<ul><li>Hello</li> span|</ul>', '<div><br> span|</div>'])(
    "allows abbreviations after a parsed tag and whitespace in %s", async marked => {
      const view = editor(marked.replace('|', ''), '', true);
      view.dispatch({ selection: { anchor: marked.indexOf('|') } });
      expect(await completion(view)).not.toBeNull();
      expect(tab(view)).toBe(true);
      expect(view.state.doc.toString()).toBe(marked.replace('span|', '<span></span>'));
    },
  );

  it("previews an implicit tag in its parent HTML context", () => {
    const view = editor(".item", "<ul>");
    expect(completion(view)?.options[0].info).toContain('<li class="item">');
    expect(tab(view)).toBe(true);
    expect(view.state.doc.toString()).toContain('<li class="item">');
  });

  it("keeps snippet navigation and expansion undo/redo", () => {
    const view = editor("ul>li.item*3", "", true);
    expect(tab(view)).toBe(true);
    const expansion = view.state.doc.toString();
    expect(undo(view)).toBe(true);
    expect(view.state.doc.toString()).toBe("ul>li.item*3");
    expect(redo(view)).toBe(true);
    expect(view.state.doc.toString()).toBe(expansion);
  });

  it("moves between list-item snippet fields with Tab", () => {
    const view = editor("ul>li.item*3", "", true);
    tab(view);
    const first = view.state.selection.main.from;
    view.dispatch({ changes: { from: first, insert: "One" }, selection: { anchor: first + 3 } });
    expect(tab(view)).toBe(true);
    const second = view.state.selection.main.from;
    expect(second).toBeGreaterThan(first + 3);
    view.dispatch({ changes: { from: second, insert: "Two" }, selection: { anchor: second + 3 } });
    expect(view.state.doc.toString()).toContain('class="item">One</li>');
    expect(view.state.doc.toString()).toContain('class="item">Two</li>');
  });

  it.each(["<!-- ", '<div title="', '<script>', '<style>'])("ignores the HTML context %s", async prefix => {
    const view = editor("div", prefix);
    expect(await completion(view)).toBeNull();
    expect(tab(view)).toBe(false);
    expect(view.state.doc.toString()).toBe(prefix + "div");
  });

  it("does not offer or expand abbreviations in read-only state", async () => {
    const view = editor("div", "", true, true);
    expect(await completion(view)).toBeNull();
    expect(tab(view)).toBe(false);
    expect(view.state.doc.toString()).toBe("div");
  });

  it.each(["div", "ul>li.item*3"])("expands saved/pasted %s without a live tracker", text => {
    const view = editor(text, "<ul><li>Hello</li></ul>\n\n", true);
    expect(tab(view)).toBe(true);
    expect(view.state.doc.toString()).not.toBe("<ul><li>Hello</li></ul>\n\n" + text);
  });

  it.each(["hello", "my-widget", "This is a"])("leaves saved/pasted %s alone", text => {
    const view = editor(text, "", true);
    expect(tab(view)).toBe(false);
    expect(view.state.doc.toString()).toBe(text);
  });

  it.each(["hello", "world", "greeting", "my-widget", "hello.world", "ul>greeting", "divv", "div:typo"])(
    "leaves %s alone in both suggestions and the Tab handler", async text => {
      const view = editor(text);
      expect(await completion(view)).toBeNull();
      expect(tab(view)).toBe(false);
      expect(view.state.doc.toString()).toBe(text);
    },
  );

  it.each(["div", "ul>li.item*3", ".card", "#main", "a:link", "input:text", "div{Hello world}", "!", "DIV", "nav>h2{Menu}+ul>li*3"])(
    "keeps %s available and expands with Tab", async text => {
      const view = editor(text);
      expect(await completion(view)).not.toBeNull();
      expect(tab(view)).toBe(true);
      expect(view.state.doc.toString()).toContain("<");
      if (text === "ul>li.item*3") expect(view.state.doc.toString().match(/<li /g)).toHaveLength(3);
    },
  );

  it.each(["a", "strong", "div", ".card", "ul>li*3"])(
    "does not expand %s at the end of prose", async text => {
      const view = editor(text, "<p>This is ");
      expect(await completion(view)).toBeNull();
      expect(tab(view)).toBe(false);
    },
  );

  it("expands a tag on a new line after an existing list", async () => {
    const prefix = "<!-- Delete this comment, then type the abbreviation here. -->\n<ul>\n  <li>Hello</li>\n  <li>Hello</li>\n  <li>Hello</li>\n</ul>\n\n";
    const view = editor("div", prefix);
    expect(await completion(view)).not.toBeNull();
    expect(tab(view)).toBe(true);
    expect(view.state.doc.toString()).toBe(prefix + "<div></div>");
  });

  it("allows an abbreviation immediately after an opening tag", () => {
    const view = editor("span", "<p>");
    expect(tab(view)).toBe(true);
    expect(view.state.doc.toString()).toBe("<p><span></span>");
  });

  it("keeps explicit custom-tag expansion available", () => {
    const view = editor("my-widget");
    expect(expandAbbreviation(view)).toBe(true);
    expect(view.state.doc.toString()).toBe("<my-widget></my-widget>");
  });

  it("does not leave a stale suggestion after a standard tag becomes an ordinary word", async () => {
    const view = editor("div");
    const initial = await completion(view);
    expect(initial).not.toBeNull();
    const pos = view.state.selection.main.head;
    view.dispatch({ changes: { from: pos, insert: "erse" }, selection: { anchor: pos + 4 } });
    expect(await completion(view)).toBeNull();
    expect(initial!.update!(initial!, 0, 3, new CompletionContext(view.state, pos + 4, false))).toBeNull();
    expect(tab(view)).toBe(false);
  });
});
