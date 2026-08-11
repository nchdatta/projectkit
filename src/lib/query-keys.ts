import type { ListFilters } from "@/services/types";

/**
 * Every TanStack Query cache key in the app.
 *
 * Keys only — no filtering logic, no transport concerns.
 *
 * **A key never carries `token` or `cache`.** They change how a request is made,
 * not which rows come back: keying on them would give two callers separate cache
 * entries for identical data, and rotating a token would strand every entry
 * under a key nothing looks up again. That is why list keys take `ListFilters`
 * (`ListArg` minus `token` and `cache`) rather than the argument the service
 * receives — pass the filters, not the whole arg:
 *
 * ```ts
 * // src/lib/query-keys.ts
 * leads: {
 *   all: ["leads"] as const,
 *   list: (filters: ListFilters = {}) => ["leads", "list", filters] as const,
 *   detail: (id: string) => ["leads", "detail", id] as const,
 * },
 *
 * // in the hook
 * const { token, cache, ...filters } = arg;
 * useQuery({ queryKey: queryKeys.leads.list(filters), queryFn: () => leadClientService.list(arg) });
 * ```
 *
 * Invalidate broadly by prefix: `queryKeys.leads.all` clears every list and
 * detail underneath it.
 */
export const queryKeys = {
  health: {
    all: ["health"] as const,
  },
} as const;

/** Re-exported so key definitions never reach for the transport-carrying `ListArg`. */
export type { ListFilters };
