import type { ListArg } from "@/services/types";

/**
 * Query-key factory.
 *
 * Every cache key in the app is built here so invalidation is exact: a mutation
 * invalidates `queryKeys.lead.all` and every lead list and detail query under it
 * refetches, with no hand-written string arrays drifting apart across files.
 *
 * Add one entry per resource, following the `all → lists → list(params) →
 * details → detail(id)` shape.
 */
export const queryKeys = {
  health: {
    all: ["health"] as const,
  },
} as const;

/** The part of a list argument that actually identifies a cache entry. */
type ListFilters = Pick<ListArg, "page" | "limit" | "search">;

/**
 * `token` and `cache` are transport concerns, not identity — keying on them
 * would fragment the cache across callers that are asking for the same rows.
 */
function filtersOf(arg: ListArg = {}): ListFilters {
  const { page, limit, search } = arg;
  return { page, limit, search };
}

/** Helper for resources that follow the standard list/detail layout. */
export function resourceKeys<const T extends string>(resource: T) {
  return {
    all: [resource] as const,
    lists: () => [resource, "list"] as const,
    list: (arg?: ListArg) => [resource, "list", filtersOf(arg)] as const,
    details: () => [resource, "detail"] as const,
    detail: (id: string) => [resource, "detail", id] as const,
  };
}
