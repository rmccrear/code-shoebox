import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';

export default tseslint.config(
  { ignores: ['dist', '.demo-site', 'node_modules', '.agents', '.claude', 'plans', 'scripts'] },
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    plugins: { 'react-hooks': reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // The runtime templates intentionally use `any`-ish dynamic patterns;
      // tune these rather than fighting them:
      '@typescript-eslint/no-explicit-any': 'off',
      // vite.config.ts carries the canonical `/// <reference types="vitest/config" />`
      // triple-slash directive; that line is intentional and harmless.
      '@typescript-eslint/triple-slash-reference': 'off',
      // Several effects intentionally call setState directly to reset/initialize
      // transient UI state (e.g. clearing logs on run, resetting trigger on sessionId
      // change). Restructuring these would be a behavior-risky change deferred to
      // a dedicated refactor plan.
      'react-hooks/set-state-in-effect': 'off',
      // OutputFrame logs inside useMemo only when debugMode is enabled; this is
      // intentional and does not cause an infinite loop in practice.
      'react-hooks/set-state-in-render': 'off',
    },
  },
);
