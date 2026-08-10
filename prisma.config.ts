import "dotenv/config";

import { defineConfig, env } from "prisma/config";

/**
 * Prisma 7 moved the connection URL out of `schema.prisma` and stopped loading
 * `.env` automatically — hence the `dotenv/config` import above.
 *
 * This file configures the CLI (migrate, studio, db push). The runtime client in
 * `src/lib/db.ts` gets its connection separately, through the pg driver adapter.
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
