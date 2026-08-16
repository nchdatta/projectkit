'use client';

import { useQuery } from '@tanstack/react-query';

import { QUERY_KEYS } from '@/lib/query-keys';
import { leadService } from '@/services/lead.service';
import type { ListFilters } from '@/services/types';

// Reference query hook file — one file per resource, all its read hooks, bound to a service.
export const useLeadsQuery = (filters: ListFilters = {}) => {
  return useQuery({
    queryKey: QUERY_KEYS.leads.list,
    queryFn: () => leadService.getLeads(filters),
  });
};

export const useLeadQuery = (id: string) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.leads.list, id],
    queryFn: () => leadService.getLead({ id }),
    enabled: !!id,
  });
};
