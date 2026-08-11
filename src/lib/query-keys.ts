/**
 * Every TanStack Query cache key in the app.
 *
 * Keys only — no filtering, no transport concerns. A key identifies a cache
 * entry, so pass just the values that change the result (pagination, search),
 * never a token or a cache mode.
 *
 * Invalidate broadly by prefix: `queryKeys.leads.all` clears every list and
 * detail underneath it.
 */
export const queryKeys = {
  health: {
    all: ["health"] as const,
  },
} as const;
