import postcss from 'postcss';
import tailwindcss from 'tailwindcss';
import selectorParser from 'postcss-selector-parser';
import { describe, expect, it } from 'vitest';
import { scopeStyles } from '../scripts/scope-styles.mjs';

async function scoped(css: string) {
  return (await postcss([scopeStyles()]).process(css, { from: undefined })).root;
}

describe('distributed CSS isolation', () => {
  it('matches root and descendant utilities but leaves host controls alone', async () => {
    document.body.innerHTML = `<button class="flex">Host</button>
      <div data-code-shoebox class="flex"><button class="flex">Owned</button></div>`;
    const root = await scoped('.flex { display: flex }');
    const selector = (root.first as postcss.Rule).selector;
    expect(document.querySelectorAll(selector)).toHaveLength(2);
    expect(document.body.firstElementChild?.matches(selector)).toBe(false);
  });

  it('does not let a sibling rule target an element outside the boundary', async () => {
    document.body.innerHTML = `<div data-code-shoebox class="trigger"><i></i><b></b></div><b></b>`;
    const root = await scoped('.trigger + b, i + b { color: red }');
    expect(document.querySelectorAll((root.first as postcss.Rule).selector)).toHaveLength(1);
  });

  it('preserves external ancestor variants and escaped arbitrary-value classes', async () => {
    document.body.innerHTML = `<div class="dark"><div data-code-shoebox>
      <b class="dark:bg-black bg-[#123456]"></b></div><b class="dark:bg-black bg-[#123456]"></b></div>`;
    const root = await scoped(String.raw`.dark .dark\:bg-black, .bg-\[\#123456\] { color: red }`);
    expect(document.querySelectorAll((root.first as postcss.Rule).selector)).toHaveLength(1);
  });

  it.each(['::before', '::after', '::backdrop', '::-webkit-inner-spin-button', ':before'])
  ('places the subject boundary before %s', async (pseudo) => {
    const root = await scoped(`input${pseudo} { box-sizing: border-box }`);
    const ast = selectorParser().astSync((root.first as postcss.Rule).selector);
    expect(ast.first.nodes.map(node => node.value)).toEqual(['input', ':where', pseudo]);
  });

  it('retains compound, sibling, and functional selectors inside conditional rules', async () => {
    const root = await scoped('@media (min-width: 640px) { @supports (display: flex) { .list > :not([hidden]) ~ :not([hidden]):hover { margin-top: 1rem } } }');
    let selector = '';
    root.walkRules(rule => { selector = rule.selector; });
    expect(selector).toBe('.list > :not([hidden]) ~ :not([hidden]):hover:where([data-code-shoebox], [data-code-shoebox] *)');
    expect(root.toString()).toContain('@media (min-width: 640px)');
    expect(root.toString()).toContain('@supports (display: flex)');
  });

  it('preserves comma-list formatting without introducing descendant combinators', async () => {
    const root = await scoped('*,\n::before, ::after { box-sizing: border-box } .flex ,\n.grid { display: flex }');
    const rules = root.nodes as postcss.Rule[];
    for (const rule of rules) {
      selectorParser().astSync(rule.selector).each(selector => {
        expect(selector.nodes.some(node => node.type === 'combinator')).toBe(false);
      });
    }
    document.body.innerHTML = '<div data-code-shoebox class="flex"><i></i></div><div class="flex"></div>';
    expect(document.querySelectorAll(rules[1].selector)).toHaveLength(1);
  });

  it('keeps document defaults on the root without body overriding local line height', async () => {
    const root = await scoped('html, :host { line-height: 1.5; font-family: sans-serif } body { margin: 0; line-height: inherit }');
    const rules = root.nodes as postcss.Rule[];
    expect(rules.every(rule => rule.selector.split(',').every(selector => selector.trim() === ':where([data-code-shoebox])'))).toBe(true);
    expect(root.toString()).toContain('line-height: 1.5');
    expect(root.toString()).not.toContain('line-height: inherit');
    expect(root.toString()).toContain('margin: 0');
  });

  it('inherits host fonts when document preflight defaults map to the component root', async () => {
    const root = await scoped('html, :host { font-family: ui-sans-serif, system-ui; line-height: 1.5 } button { font-family: inherit } .font-mono { font-family: monospace }');
    const rules = root.nodes as postcss.Rule[];
    expect(rules[0].nodes.find(node => node.type === 'decl' && node.prop === 'font-family'))
      .toMatchObject({ value: 'inherit' });
    expect(rules[1].toString()).toContain('font-family: inherit');
    expect(rules[2].toString()).toContain('font-family: monospace');
  });

  it('namespaces animation names while keeping keyframe step selectors untouched', async () => {
    const root = await scoped('@keyframes pulse { from { opacity: 1 } 50% { opacity: .5 } to { opacity: 1 } } .animate { animation: pulse 2s cubic-bezier(0, 0, 1, 1) infinite; animation-name: pulse, other; -webkit-animation: pulse 2s }');
    const css = root.toString();
    expect(css).toContain('@keyframes code-shoebox-pulse');
    expect(css).toContain('from { opacity: 1 }');
    expect(css).toContain('50% { opacity: .5 }');
    expect(css).toContain('animation: code-shoebox-pulse 2s cubic-bezier(0, 0, 1, 1) infinite');
    expect(css).toContain('animation-name: code-shoebox-pulse, other');
    expect(css).toContain('-webkit-animation: code-shoebox-pulse 2s');
  });

  it.each(['@font-face { font-family: global }', '@property --global { syntax: "*"; inherits: false }', '@import "global.css";', 'html .x { color: red }', ':root { color: red }', '& .x { color: red }'])
  ('fails instead of leaving unsupported global CSS unscoped: %s', async (css) => {
    await expect(scoped(css)).rejects.toThrow(/Unsupported/);
  });

  it('rejects ambiguous animation keyword names instead of rewriting easing values', async () => {
    await expect(scoped('@keyframes linear { to { opacity: 1 } } .x { animation: 1s linear linear }'))
      .rejects.toThrow(/Ambiguous animation keyword/);
  });

  it('scopes every ordinary rule emitted by Tailwind, including reset and variable initialization', async () => {
    const expanded = await postcss([tailwindcss({ content: [{ raw: 'flex animate-pulse hover:bg-black space-y-1 sm:text-white', extension: 'html' }] })])
      .process('@tailwind base; @tailwind utilities;', { from: undefined });
    const root = await scoped(expanded.css);
    let ordinaryRules = 0;
    root.walkRules(rule => {
      if (rule.parent?.type === 'atrule' && rule.parent.name === 'keyframes') return;
      ordinaryRules++;
      const ast = selectorParser().astSync(rule.selector);
      ast.each(selector => {
        expect(selector.nodes.some(node => node.type === 'pseudo' && node.value === ':where' && node.toString().includes('[data-code-shoebox]'))).toBe(true);
      });
    });
    expect(ordinaryRules).toBeGreaterThan(30);
    expect(root.toString()).not.toContain('@keyframes pulse');
  });
});
