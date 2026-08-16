import { request } from "@/lib/fetcher";
import type { GetArg, Lead, ListArg, Paginated } from "@/services/types";

// Reference server service — reads only via fetch (Next caching applies); mutations live in the client file.
export const leadService = {
  list: ({ token, cache = "no-store", ...filters }: ListArg = {}) =>
    request<Paginated<Lead>>("/leads", { token, cache, params: filters }),
  get: ({ id, token, cache = "no-store" }: GetArg & { id: string }) =>
    request<Lead>(`/leads/${id}`, { token, cache }),
};
