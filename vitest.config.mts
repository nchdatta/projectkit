import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Resolves the `@/*` alias from tsconfig.json — native in Vite 7, no plugin needed.
    tsconfigPaths: true,
    alias: {
      // Stubbed so modules marking themselves server-only (e.g. src/lib/db.ts) stay testable.
      'server-only': fileURLToPath(new URL('./node_modules/server-only/empty.js', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    // Playwright owns `e2e/` — Vitest must not try to run those specs.
    exclude: ['node_modules/**', '.next/**', 'e2e/**'],
    // `src/lib/env.ts` requires this at import time — MSW intercepts it, only the origin needs to match.
    env: { NEXT_PUBLIC_API_BASE_URL: 'http://localhost:3000' },
  },
});
