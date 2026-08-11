import { ok, serverError } from "@/lib/api-response";
import { db } from "@/lib/db";

// Reference Route Handler — proves handler → envelope → Prisma → Postgres is wired.
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
