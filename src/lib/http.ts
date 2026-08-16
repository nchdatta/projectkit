import axios, { AxiosError, type AxiosInstance, type AxiosResponse } from "axios";
import { ApiError } from "./api-error";
import { ApiResponse } from "@/services/types";

// Client-side transport for `*.service.client.ts` files; every failure surfaces as `ApiError`.

export const http: AxiosInstance = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api`,
  headers: { "Content-Type": "application/json" },
  timeout: 15_000,
});

http.interceptors.request.use((config) => {
  // TODO(auth): attach the session token here once auth lands.
  return config;
});

http.interceptors.response.use(
  (response: AxiosResponse<ApiResponse<unknown>>) => {
    // A 2xx carrying `success: false` is still a failure — don't let it through as data.
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

// Unwraps the envelope; the interceptor already rejected failures, so this only guards an empty success.
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
