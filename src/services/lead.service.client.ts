import { http, request } from "@/lib/http";
import type { CreateLeadInput, UpdateLeadInput } from "@/lib/validations/lead";
import type { Lead } from "@/services/types";

// Reference client service — the only thing mutation hooks call. Axios, session auto-attached.
export const leadClientService = {
  createLead: (data: CreateLeadInput) => request<Lead>(http.post("/leads", data)),
  updateLead: (id: string, data: UpdateLeadInput) =>
    request<Lead>(http.patch(`/leads/${id}`, data)),
  deleteLead: (id: string) => request<Lead>(http.delete(`/leads/${id}`)),
};
