import axios, { AxiosError, type AxiosInstance, type AxiosResponse } from "axios";

import { ApiError } from "@/lib/api-error";
import type { ApiResponse } from "@/lib/api-response";
import { clientEnv } from "@/lib/env";

/**
 * The client-side transport.
 *
 * Client services (`*.service.client.ts`) are the only place allowed to use it —
 * never call axios or `fetch` directly from a component or a query hook. Server
 * services use the `request` exported by `src/lib/fetcher.ts` instead.
 *
 * Every failure leaves this module as an `ApiError`, so callers handle one error
 * shape whether the failure came from validation, the network, or a crash.
 */

export { ApiError };

export const http: AxiosInstance = axios.create({
  baseURL: `${clientEnv.NEXT_PUBLIC_APP_URL}/api`,
  headers: { "Content-Type": "application/json" },
  timeout: 15_000,
});

http.interceptors.request.use((config) => {
  // TODO(auth): attach the session token here once auth lands.
  return config;
});

http.interceptors.response.use(
  (response: AxiosResponse<ApiResponse<unknown>>) => {
    // A 2xx carrying `success: false` is still a failure — do not let it through
    // as data, or services would return `null` where an entity is expected.
    const body = response.data;
    if (body && body.success === false) {
      throw new ApiError(
        body.message || "Request failed",
        body.status || response.status,
        body.errors,
      );
    }

    return response;
  },
  (error: AxiosError<ApiResponse<unknown>>) => {
    if (error instanceof ApiError) return Promise.reject(error);

    const payload = error.response?.data;
    const status = error.response?.status ?? 0;

    if (payload && typeof payload.message === "string") {
      return Promise.reject(
        new ApiError(payload.message, payload.status || status, payload.errors),
      );
    }

    if (error.code === "ECONNABORTED") {
      return Promise.reject(new ApiError("Request timed out", 408));
    }

    if (!error.response) {
      return Promise.reject(new ApiError("Network error — could not reach the server", 0));
    }

    return Promise.reject(new ApiError(error.message || "Request failed", status));
  },
);

/**
 * Unwraps the envelope so services return plain entities.
 *
 * By the time this runs the interceptor has already rejected every failure, so
 * `data` is present — the guard only covers a handler that returned success with
 * no payload.
 */
export async function request<T>(promise: Promise<AxiosResponse<ApiResponse<T>>>): Promise<T> {
  const response = await promise;
  const body = response.data;

  if (body.data === null || body.data === undefined) {
    throw new ApiError(
      body.message || "Response contained no data",
      body.status || response.status,
    );
  }

  return body.data;
}
