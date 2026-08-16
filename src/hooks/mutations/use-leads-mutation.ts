"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/lib/query-keys";
import { leadClientService } from "@/services/lead.service.client";
import type { UpdateLeadInput } from "@/lib/validations/lead";

export function useCreateLeadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: leadClientService.createLead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.leads.list }),
  });
}

export function useUpdateLeadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: UpdateLeadInput & { id: string }) =>
      leadClientService.updateLead(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.leads.list }),
  });
}

export function useDeleteLeadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: leadClientService.deleteLead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.leads.list }),
  });
}
