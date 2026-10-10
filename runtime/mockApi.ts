import type { EnvironmentMode, MockApiConfig } from '../types';

/** Fetch lessons always mock; React workspaces opt in through host configuration. */
export const isMockApiEnabled = (mode: EnvironmentMode, mockApi?: MockApiConfig): boolean =>
  mode === 'fetch' || mode === 'html-js-fetch' || (mode === 'react-app' && mockApi !== undefined);
