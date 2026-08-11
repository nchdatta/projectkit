"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-keys";
import { healthClientService } from "@/services/health.service.client";

// Reference query hook file — one file per resource, all its read hooks, bound to a client service.
export function useHealthQuery() {
  return useQuery({
    queryKey: queryKeys.health.all,
    queryFn: healthClientService.get,
  });
}
