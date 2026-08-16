import type { ListFilters } from "@/services/types";

// Every TanStack Query cache key, in one object. Keys only — never `token` or `cache` (see AGENTS.md).
export const queryKeys = {
  leads: {
    all: ["leads"] as const,
    list: (filters: ListFilters) => ["leads", "list", filters] as const,
    detail: (id: string) => ["leads", "detail", id] as const,
  },
} as const;

// Re-exported so key definitions reach for filters, never the transport-carrying `ListArg`.
export type { ListFilters };
