import { http, request } from "@/lib/http";
import type { HealthStatus } from "@/services/types";

/**
 * Reference **client** service — the only thing query hooks call.
 *
 * It uses the axios instance, so the request interceptor attaches the session
 * automatically and the response interceptor normalizes failures into
 * `ApiError`. All mutations (create / update / delete) live in files like this
 * one; server services are read-only.
 */
export const healthClientService = {
  get: () => request<HealthStatus>(http.get("/health")),
};
