import { request } from "@/lib/fetcher";
import type { GetArg, HealthStatus } from "@/services/types";

/**
 * Reference **server** service — the one Server Components, Route Handlers, and
 * Server Actions reach for.
 *
 * It calls the API through `request` from `@/lib/fetcher` (native fetch), so
 * Next.js caching applies: pass `cache` or `next` to control revalidation. The
 * session token is passed explicitly — nothing attaches it for you here.
 *
 * A Client Component may import this too; it just gets no caching and no
 * automatic session. Prefer the client service there.
 *
 * Reads only. Mutations belong in `health.service.client.ts`.
 */
export const healthService = {
  get: ({ token, cache = "no-store" }: GetArg = {}) =>
    request<HealthStatus>("/health", { token, cache }),
};
