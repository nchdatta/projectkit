import { http, request } from "@/lib/http";
import type { HealthStatus } from "@/services/types";

// Reference client service — the only thing query/mutation hooks call. Axios, session auto-attached.
export const healthClientService = {
  get: () => request<HealthStatus>(http.get("/health")),
};
