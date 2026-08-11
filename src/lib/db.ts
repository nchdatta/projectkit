import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@generated/prisma/client";
import { isDevelopment, serverEnv } from "@/lib/env";

/**
 * The single Prisma client for the whole app.
 *
 * Two Prisma 7 details worth knowing before editing this file:
 *  - The client is generated into `/generated/prisma` at the project root
 *    (gitignored, reached through the `@generated/*` alias). Run
 *    `npm run db:generate` after any schema change or the import above breaks.
 *  - The connection is supplied by the pg driver adapter, not by the schema —
 *    `schema.prisma` no longer carries a `url`.
 *
 * The `globalThis` cache exists because Next dev re-evaluates modules on every
 * hot reload; without it each reload opens a new pool until Postgres refuses
 * connections.
 *
 * Import `db` from here and nowhere else — never `new PrismaClient()` inline.
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createClient() {
  const adapter = new PrismaPg({ connectionString: serverEnv.DATABASE_URL });

  return new PrismaClient({
    adapter,
    log: isDevelopment ? ["warn", "error"] : ["error"],
  });
}

export const db = globalForPrisma.prisma ?? createClient();

if (isDevelopment) {
  globalForPrisma.prisma = db;
}
