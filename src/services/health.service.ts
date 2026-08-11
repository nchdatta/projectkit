import { request } from "@/lib/fetcher";
import type { GetArg, HealthStatus } from "@/services/types";

// Reference server service — reads only via fetch (Next caching applies); mutations live in the client file.
export const healthService = {
  get: ({ token, cache = "no-store" }: GetArg = {}) =>
    request<HealthStatus>("/health", { token, cache }),
};
