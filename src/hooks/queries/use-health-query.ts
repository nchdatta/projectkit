"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-keys";
import { healthClientService } from "@/services/health.service.client";

/**
 * Reference query hook file.
 *
 * One file per resource (`use-leads-query.ts`), holding every read hook for that
 * resource — list, detail, counts. Hooks bind a key from `@/lib/query-keys` to a
 * **client** service and nothing else: no axios, no URLs, no reshaping that
 * belongs in the service.
 *
 * Writes live in `src/hooks/mutations/use-<resource>-mutation.ts`.
 */
export function useHealthQuery() {
  return useQuery({
    queryKey: queryKeys.health.all,
    queryFn: healthClientService.get,
  });
}
