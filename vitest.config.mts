import { fileURLToPath } from "node:url";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Resolves the `@/*` alias from tsconfig.json — native in Vite 7, no plugin needed.
    tsconfigPaths: true,
    alias: {
      // `server-only` throws on import outside a React Server Component build.
      // Stub it so modules that mark themselves server-side (e.g. `src/lib/db.ts`)
      // stay testable under Vitest.
      "server-only": fileURLToPath(new URL("./node_modules/server-only/empty.js", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    // Playwright owns `e2e/` — Vitest must not try to run those specs.
    exclude: ["node_modules/**", ".next/**", "e2e/**"],
  },
});
