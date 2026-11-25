import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defaultClientConditions, defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Resolve @flower-shop/shared to its TypeScript source, so it needs no build step.
  resolve: { conditions: ['@flower-shop/source', ...defaultClientConditions] },
  server: {
    port: 5173,
    strictPort: true,
    // Same-origin API calls in dev: the browser's Origin (http://localhost:5173) is forwarded as-is.
    proxy: { '/api': 'http://localhost:3001' },
  },
});
