import { EditorState } from '@codemirror/state';
import { expandAbbreviation } from '@emmetio/codemirror6-plugin';
import { html } from '@codemirror/lang-html';
import { expect, it } from 'vitest';
import { codeMirrorEmmet } from './codeMirrorEmmet';

it('expands an HTML abbreviation with a linked snippet selection', () => {
  const code = 'div.emmet-check>span{Hello}';
  let state = EditorState.create({ doc: code, selection: { anchor: code.length }, extensions: [html(), codeMirrorEmmet()] });
  expect(expandAbbreviation({ state, dispatch: transaction => { state = transaction.state; } })).toBe(true);
  expect(state.doc.toString()).toContain('<div class="emmet-check">');
  expect(state.doc.toString()).toContain('<span>Hello</span>');
});
