import { http, request } from "@/lib/http";
import type { CreateLeadInput, UpdateLeadInput } from "@/lib/validations/lead";
import type { Lead, ListFilters, Paginated } from "@/services/types";

// Reference client service — the only thing query/mutation hooks call. Axios, session auto-attached.
export const leadClientService = {
  list: (filters: ListFilters = {}) =>
    request<Paginated<Lead>>(http.get("/leads", { params: filters })),
  get: (id: string) => request<Lead>(http.get(`/leads/${id}`)),
  create: (input: CreateLeadInput) => request<Lead>(http.post("/leads", input)),
  update: ({ id, ...input }: UpdateLeadInput & { id: string }) =>
    request<Lead>(http.patch(`/leads/${id}`, input)),
  remove: (id: string) => request<Lead>(http.delete(`/leads/${id}`)),
};
