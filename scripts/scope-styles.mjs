import selectorParser from 'postcss-selector-parser';
import valueParser from 'postcss-value-parser';

const ROOT = ':where([data-code-shoebox])';
const SUBJECT = ':where([data-code-shoebox], [data-code-shoebox] *)';
const DOCUMENT_TAGS = new Set(['html', 'body']);
const LEGACY_PSEUDO_ELEMENTS = new Set([':before', ':after', ':first-line', ':first-letter']);
const KEYFRAMES = new Set(['keyframes', '-webkit-keyframes']);
const ANIMATION_KEYWORDS = new Set([
  'none', 'initial', 'inherit', 'unset', 'revert', 'revert-layer',
  'linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out', 'step-start', 'step-end',
  'infinite', 'normal', 'reverse', 'alternate', 'alternate-reverse',
  'forwards', 'backwards', 'both', 'running', 'paused', 'auto',
]);

function insideKeyframes(node) {
  for (let parent = node.parent; parent; parent = parent.parent) {
    if (parent.type === 'atrule' && KEYFRAMES.has(parent.name.toLowerCase())) return true;
  }
  return false;
}

function isDocumentSelector(part) {
  const nodes = part.nodes.filter((node) => node.type !== 'comment');
  return nodes.length === 1 && (
    (nodes[0].type === 'tag' && DOCUMENT_TAGS.has(nodes[0].value.toLowerCase())) ||
    (nodes[0].type === 'pseudo' && nodes[0].value === ':host' && !nodes[0].nodes?.length)
  );
}

function scopeSelector(selector) {
  const ast = selectorParser().astSync(selector);
  ast.each((part) => {
    if (isDocumentSelector(part)) {
      part.replaceWith(selectorParser().astSync(ROOT).first.clone());
      return;
    }

    part.walk((node) => {
      if (node.type === 'nesting' ||
          (node.type === 'tag' && DOCUMENT_TAGS.has(node.value.toLowerCase())) ||
          (node.type === 'pseudo' && [':host', ':root', ':host-context', ':global'].includes(node.value))) {
        throw new Error(`Unsupported document or nested selector: ${selector}`);
      }
    });

    // Constrain the styled element itself, rather than prefixing an ancestor.
    // This covers root utilities and cannot leak through sibling combinators.
    let lastCombinator = -1;
    part.nodes.forEach((node, index) => {
      if (node.type === 'combinator') lastCombinator = index;
    });
    const subject = part.nodes.slice(lastCombinator + 1);
    if (!subject.some((node) => node.type !== 'comment')) {
      throw new Error(`Selector has no subject: ${selector}`);
    }
    const pseudoElement = subject.find((node) => node.type === 'pseudo' &&
      (node.value.startsWith('::') || LEGACY_PSEUDO_ELEMENTS.has(node.value)));
    const boundary = selectorParser().astSync(SUBJECT).first.first.clone();
    if (pseudoElement) {
      boundary.spaces.before = pseudoElement.spaces.before;
      pseudoElement.spaces.before = '';
      part.insertBefore(pseudoElement, boundary);
    } else {
      const last = part.last;
      boundary.spaces.after = last.spaces.after;
      last.spaces.after = '';
      part.append(boundary);
    }
  });
  return ast.toString();
}

/** Scope Tailwind's expanded CSS without changing selector specificity. */
export function scopeStyles() {
  return {
    postcssPlugin: 'code-shoebox-scope-styles',
    Once(root) {
      const animations = new Map();
      root.walkAtRules((rule) => {
        const name = rule.name.toLowerCase();
        if (KEYFRAMES.has(name)) {
          const params = valueParser(rule.params);
          const tokens = params.nodes.filter((node) => node.type !== 'space' && node.type !== 'comment');
          if (tokens.length !== 1 || !['word', 'string'].includes(tokens[0].type)) {
            throw rule.error(`Unsupported keyframe name: ${rule.params}`);
          }
          const oldName = tokens[0].value;
          if (ANIMATION_KEYWORDS.has(oldName.toLowerCase())) {
            throw rule.error(`Ambiguous animation keyword used as keyframe name: ${oldName}`);
          }
          const newName = `code-shoebox-${oldName}`;
          animations.set(oldName, newName);
          tokens[0].value = newName;
          rule.params = params.toString();
        } else if (!['media', 'supports', 'layer', 'container'].includes(name)) {
          throw rule.error(`Unsupported global CSS construct: @${rule.name}`);
        }
      });

      root.walkRules((rule) => {
        if (insideKeyframes(rule)) return;
        // A document font default must not become a component override:
        // controls previously inherited the host font through the document.
        if (selectorParser().astSync(rule.selector).nodes.every(isDocumentSelector)) {
          rule.walkDecls('font-family', (decl) => { decl.value = 'inherit'; });
        }
        // html establishes a local line height; body's inheritance must not
        // undo it when the two document elements map to the same component root.
        if (rule.selector.trim().toLowerCase() === 'body') {
          rule.walkDecls('line-height', (decl) => {
            if (decl.value === 'inherit') decl.remove();
          });
        }
        try {
          rule.selector = scopeSelector(rule.selector);
        } catch (error) {
          throw rule.error(error.message);
        }
      });

      root.walkDecls((decl) => {
        if (!['animation', 'animation-name', '-webkit-animation', '-webkit-animation-name'].includes(decl.prop.toLowerCase())) return;
        const value = valueParser(decl.value);
        // Top-level names only: don't rewrite custom-property names or strings
        // inside functions such as var(). Tailwind emits literal animation names.
        for (const node of value.nodes) {
          if (['word', 'string'].includes(node.type) && animations.has(node.value)) {
            node.value = animations.get(node.value);
          }
        }
        decl.value = value.toString();
      });
    },
  };
}
