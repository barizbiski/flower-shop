import swc from 'unplugin-swc';
import { defaultServerConditions, loadEnv } from 'vite';
import { defineConfig } from 'vitest/config';

export default defineConfig(({ mode }) => ({
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
  // Resolve @flower-shop/shared to its TypeScript source, so it needs no build step.
  resolve: { conditions: ['@flower-shop/source', ...defaultServerConditions] },
  ssr: { resolve: { conditions: ['@flower-shop/source', ...defaultServerConditions] } },
  test: {
    environment: 'node',
    include: ['test/**/*.test.ts'],
    // Picks up DATABASE_URL / TEST_DATABASE_URL from apps/backend/.env.
    env: loadEnv(mode, process.cwd(), ''),
    // Each test file creates its own Postgres database; argon2 hashing is deliberately slow.
    testTimeout: 20_000,
    hookTimeout: 60_000,
  },
}));
