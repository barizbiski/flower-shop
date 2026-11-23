import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  // SWC instead of esbuild: Nest needs legacy decorators + emitDecoratorMetadata.
  plugins: [
    swc.vite({
      module: { type: 'es6' },
      jsc: {
        target: 'es2022',
        parser: { syntax: 'typescript', decorators: true },
        transform: { legacyDecorator: true, decoratorMetadata: true },
      },
    }),
  ],
  test: {
    environment: 'node',
    include: ['test/**/*.test.ts'],
    // Each test file boots its own in-memory PGlite; argon2 hashing is deliberately slow.
    testTimeout: 20_000,
    hookTimeout: 60_000,
  },
});
