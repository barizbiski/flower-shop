import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
import { setSessionExpiredHandler } from '../lib/apiClient';

afterEach(() => {
  cleanup();
  setSessionExpiredHandler(null);
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
