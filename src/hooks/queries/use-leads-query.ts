"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-keys";
import { leadClientService } from "@/services/lead.service.client";
import type { ListFilters } from "@/services/types";

// Reference query hook file — one file per resource, all its read hooks, bound to a client service.
export function useLeadsQuery(filters: ListFilters = {}) {
  return useQuery({
    queryKey: queryKeys.leads.list(filters),
    queryFn: () => leadClientService.list(filters),
  });
}

export function useLeadQuery(id: string) {
  return useQuery({
    queryKey: queryKeys.leads.detail(id),
    queryFn: () => leadClientService.get(id),
  });
}
