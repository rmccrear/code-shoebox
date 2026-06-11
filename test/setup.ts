import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// React Testing Library doesn't auto-clean up when `globals: true` is used
// without its own afterEach wiring, so do it here.
afterEach(() => {
  cleanup();
  localStorage.clear();
});
