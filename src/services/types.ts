/**
 * Entity type definitions — the single source of truth for the shapes that move
 * between the API and the client.
 *
 * Rules:
 *  - Declare types by hand here. Do not re-export Prisma model types and do not
 *    derive entity types with `z.infer` — zod schemas describe *input* payloads,
 *    this file describes *entities* as the client sees them.
 *  - Dates cross the wire as ISO strings, so they are typed `string`, not `Date`.
 *  - Service files and query hooks import from here; nothing else declares an
 *    entity shape.
 */

/** Envelope returned by every Route Handler, already unwrapped by `request()`. */
export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
};

/**
 * Argument shape for a single-entity read.
 *
 * `token` lets a server-side caller pass a session token explicitly — on the
 * client the request interceptor in `src/lib/http.ts` attaches it automatically,
 * so leave it undefined there. `cache` is forwarded when the call is made with
 * `fetch` from a Server Component rather than through axios.
 */
export interface GetArg {
  token?: string | null;
  id?: string;
  cache?: RequestCache;
}

/** Argument shape for a list read: pagination and search on top of `GetArg`. */
export interface ListArg extends Omit<GetArg, "id"> {
  page?: number;
  limit?: number;
  search?: string;
}

/** Returned by `GET /api/health` — the reference entity. */
export type HealthStatus = {
  status: "ok";
  database: "up";
  timestamp: string;
};

// CRM entities (Lead, Contact, Deal, Activity, …) are declared here as they are built.
