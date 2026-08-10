import { ok, serverError } from "@/lib/api-response";
import { db } from "@/lib/db";

/**
 * Health endpoint — the reference Route Handler.
 *
 * It exists for two reasons: it proves the whole chain (handler → envelope →
 * Prisma → Postgres) is wired, and it is the shape every other handler in
 * `src/app/api` copies.
 */
export async function GET() {
  try {
    await db.$queryRaw`SELECT 1`;

    return ok(
      {
        status: "ok" as const,
        database: "up" as const,
        timestamp: new Date().toISOString(),
      },
      "Service healthy",
    );
  } catch {
    return serverError("Database unreachable");
  }
}
