import { beforeEach, describe, expect, it, vi } from 'vitest';
import { prepareJsxHighlighting } from './jsxHighlighting';

const highlighter = { id: 'highlighter' };
const createHighlighterCore = vi.fn(() => Promise.resolve(highlighter));
const createJavaScriptRegexEngine = vi.fn(() => ({ id: 'javascript-regex-engine' }));
const shikiToMonaco = vi.fn();

vi.mock('@shikijs/core', () => ({ createHighlighterCore }));
vi.mock('@shikijs/engine-javascript', () => ({ createJavaScriptRegexEngine }));
vi.mock('@shikijs/langs/jsx', () => ({ default: [{ name: 'jsx' }] }));
vi.mock('@shikijs/themes/dark-plus', () => ({ default: { name: 'dark-plus', type: 'dark' } }));
vi.mock('@shikijs/themes/light-plus', () => ({ default: { name: 'light-plus', type: 'light' } }));
vi.mock('@shikijs/monaco', () => ({ shikiToMonaco }));

const createMonaco = () => {
  const languages: Array<{ id: string }> = [];
  return {
    languages: {
      getLanguages: vi.fn(() => languages),
      register: vi.fn((language: { id: string }) => languages.push(language)),
    },
  };
};

describe('prepareJsxHighlighting', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('registers JSX immediately and installs Shiki once per Monaco runtime', async () => {
    const monaco = createMonaco();

    const firstSetup = prepareJsxHighlighting(monaco as never);
    const secondSetup = prepareJsxHighlighting(monaco as never);

    expect(monaco.languages.register).toHaveBeenCalledWith({
      id: 'jsx',
      extensions: ['.jsx'],
      aliases: ['JSX'],
    });
    expect(firstSetup).toBe(secondSetup);

    await firstSetup;

    expect(createJavaScriptRegexEngine).toHaveBeenCalledOnce();
    expect(createHighlighterCore).toHaveBeenCalledWith(expect.objectContaining({
      langs: [[{ name: 'jsx' }]],
      themes: [
        { name: 'vs-dark', type: 'dark' },
        { name: 'light', type: 'light' },
      ],
    }));
    expect(shikiToMonaco).toHaveBeenCalledWith(highlighter, monaco);
  });
});
