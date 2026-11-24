import { EditorState, Prec, type Extension } from '@codemirror/state';
import { keymap, type EditorView } from '@codemirror/view';
import { htmlLanguage } from '@codemirror/lang-html';
import { syntaxTree } from '@codemirror/language';
import { nextSnippetField, type CompletionContext, type CompletionResult } from '@codemirror/autocomplete';
import { emmetConfig, expandAbbreviation, EmmetKnownSyntax } from '@emmetio/codemirror6-plugin';
import expand, { extract, markupAbbreviation } from 'emmet';

const standardHtmlTags = new Set((
  'a abbr address area article aside audio b base bdi bdo blockquote body br button ' +
  'canvas caption cite code col colgroup data datalist dd del details dfn dialog div dl dt ' +
  'em embed fieldset figcaption figure footer form h1 h2 h3 h4 h5 h6 head header hgroup hr html ' +
  'i iframe img input ins kbd label legend li link main map mark menu meta meter nav noscript ' +
  'object ol optgroup option output p picture pre progress q rp rt ruby s samp script search ' +
  'section select selectedcontent slot small source span strong style sub summary sup ' +
  'table tbody td template textarea tfoot th thead time title tr track u ul var video wbr'
).split(' '));

function htmlAbbreviation(state: EditorState, pos: number) {
  if (state.facet(EditorState.readOnly) || !htmlLanguage.isActiveAt(state, pos)) return null;
  const tree = syntaxTree(state);
  // HTML language data is also available inside tags and comments. Only offer
  // markup in text positions, never attribute values, comments or embedded JS/CSS.
  let parentTag: string | undefined;
  for (let node = tree.resolveInner(pos, -1); node; node = node.parent!) {
    if (['OpenTag', 'CloseTag', 'SelfClosingTag', 'Comment', 'DoctypeDecl', 'ProcessingInst'].includes(node.name)) return null;
    if (!parentTag && node.name === 'Element') {
      const name = node.getChild('OpenTag')?.getChild('TagName');
      if (name) parentTag = state.doc.sliceString(name.from, name.to);
    }
  }
  const line = state.doc.lineAt(pos);
  // Moving into saved text must not turn a word prefix (div|erse) into markup.
  if (/^[\p{L}\p{M}\p{N}_:-]/u.test(line.text.slice(pos - line.from))) return null;
  const extracted = extract(line.text, pos - line.from, { type: 'markup', lookAhead: false });
  if (!extracted) return null;
  const from = line.from + extracted.start;
  const prefix = line.text.slice(0, extracted.start).trimEnd();
  // A tag-name word in prose ("This is a") should remain text. An abbreviation
  // at the start of a line or directly after a tag is an explicit editing intent.
  if (prefix.trim()) {
    const boundary = line.from + prefix.length;
    let node = tree.resolveInner(boundary, -1);
    while (node && !['OpenTag', 'CloseTag', 'SelfClosingTag'].includes(node.name)) node = node.parent!;
    // A literal > in text is not a tag boundary ("The result is 2 > a").
    if (!node || node.to !== boundary) return null;
  }

  try {
    const ast = markupAbbreviation(extracted.abbreviation);
    const knownNodes = (nodes: typeof ast.children): boolean => nodes.every(node =>
      (!node.name || node.name === '!' || standardHtmlTags.has(node.name.split(':')[0].toLowerCase())) &&
      knownNodes(node.children)
    );
    if (!ast.children.length || !knownNodes(ast.children)) return null;
    const preview = expand(extracted.abbreviation, {
      syntax: 'html',
      context: parentTag ? { name: parentTag } : undefined,
    });
    // Preserve real aliases such as a:link, but reject an unknown colon suffix
    // that Emmet would turn into a nonstandard tag such as <div:typo>.
    const tags = [...preview.matchAll(/<\/?([a-z][a-z0-9:-]*)(?=[\s/>])/gi)];
    if (!tags.every(match => standardHtmlTags.has(match[1].toLowerCase()))) return null;
    return { from, to: line.from + extracted.end, abbreviation: extracted.abbreviation, preview };
  } catch {
    return null;
  }
}

function expandHtmlAbbreviation(view: EditorView): boolean {
  const selection = view.state.selection.main;
  if (!selection.empty || !htmlAbbreviation(view.state, selection.head)) return false;
  // The public command handles HTML context, indentation and snippet fields.
  // It extracts from the current document, so saved/pasted text works too.
  return expandAbbreviation(view);
}

export function htmlEmmetCompletions(context: CompletionContext): CompletionResult | null {
  const abbreviation = htmlAbbreviation(context.state, context.pos);
  if (!abbreviation) return null;
  return {
    from: abbreviation.from,
    to: abbreviation.to,
    filter: false,
    options: [{
      label: 'Emmet abbreviation',
      type: 'emmet',
      boost: 99,
      info: abbreviation.preview,
      apply: view => { expandHtmlAbbreviation(view); },
    }],
    // Recheck the policy as text changes: div -> diverse must close the old
    // suggestion rather than leave a stale option that Tab could accept.
    update: (_current, _from, _to, nextContext) => htmlEmmetCompletions(nextContext),
  };
}

export function codeMirrorEmmet(): Extension {
  return Prec.high([
    emmetConfig.of({ syntax: EmmetKnownSyntax.html }),
    keymap.of([
      { key: 'Tab', run: nextSnippetField },
      { key: 'Tab', run: expandHtmlAbbreviation },
    ]),
    // Keep this state-local. The host installs it only for opted-in, editable
    // HTML files; no global provider or private Emmet tracker is needed.
    EditorState.languageData.of(() => [{ autocomplete: htmlEmmetCompletions }]),
  ]);
}
