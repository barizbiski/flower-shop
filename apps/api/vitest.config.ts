import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['test/**/*.test.ts'],
    // Each test file boots its own in-memory PGlite; argon2 hashing is deliberately slow.
    testTimeout: 20_000,
    hookTimeout: 60_000,
  },
});
