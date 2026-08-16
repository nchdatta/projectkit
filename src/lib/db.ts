import 'server-only';

import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '@generated/prisma/client';
import { isDevelopment, serverEnv } from '@/lib/env';

// Single Prisma client; import `db` from here only. `globalThis` cache avoids a fresh pool per hot reload.

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createClient() {
  const adapter = new PrismaPg({ connectionString: serverEnv.DATABASE_URL });

  return new PrismaClient({
    adapter,
    log: isDevelopment ? ['warn', 'error'] : ['error'],
  });
}

export const db = globalForPrisma.prisma ?? createClient();

if (isDevelopment) {
  globalForPrisma.prisma = db;
}
