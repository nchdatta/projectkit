"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-keys";
import { leadClientService } from "@/services/lead.service.client";

export function useCreateLeadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: leadClientService.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.leads.all }),
  });
}

export function useUpdateLeadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: leadClientService.update,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.leads.all }),
  });
}

export function useDeleteLeadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: leadClientService.remove,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.leads.all }),
  });
}
