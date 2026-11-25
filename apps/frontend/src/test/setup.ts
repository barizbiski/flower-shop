import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
import { setAccessToken, setSessionExpiredHandler } from '../lib/apiClient';

afterEach(() => {
  cleanup();
  setAccessToken(null);
  setSessionExpiredHandler(null);
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
