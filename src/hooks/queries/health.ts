"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/hooks/queries/keys";
import { healthClientService } from "@/services/health.service.client";

/**
 * Reference query hook.
 *
 * Hooks bind a key from `keys.ts` to a **client** service and nothing else — no
 * axios, no URLs, no data reshaping that belongs in the service. Use the client
 * service, not the server one: only axios attaches the session and normalizes
 * errors through interceptors.
 */
export function useHealth() {
  return useQuery({
    queryKey: queryKeys.health.all,
    queryFn: healthClientService.get,
  });
}
