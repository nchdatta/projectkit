import { ApiError } from "@/lib/api-error";
import type { ApiResponse } from "@/lib/api-response";
import { clientEnv } from "@/lib/env";

/**
 * The `fetch` transport, used by server services (`*.service.ts`).
 *
 * Native `fetch` rather than axios because only `fetch` participates in the
 * Next.js cache — `cache`, `next.revalidate`, and `next.tags` are the whole
 * reason this file exists.
 *
 * It is not marked `server-only`: the module runs anywhere `fetch` does, so a
 * Client Component may call a server service if it has reason to. The cache
 * options simply have no effect there, and no session is attached automatically —
 * that is the axios interceptor's job in `src/lib/http.ts`.
 *
 * That client half exports a `request` of its own, so both sides read the same at
 * the call site; the import path is what says which transport you are on. Both
 * funnel failures into the same `ApiError`.
 */

export type QueryParams = Record<string, string | number | boolean | undefined | null>;

export type FetchOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  /** Session token. Server callers pass it explicitly — there is no interceptor here. */
  token?: string | null;
  cache?: RequestCache;
  next?: { revalidate?: number | false; tags?: string[] };
  params?: QueryParams;
  body?: unknown;
  headers?: HeadersInit;
  signal?: AbortSignal;
};

const API_BASE = `${clientEnv.NEXT_PUBLIC_APP_URL}/api`;

function buildUrl(path: string, params?: QueryParams): string {
  const url = new URL(`${API_BASE}${path.startsWith("/") ? path : `/${path}`}`);

  for (const [key, value] of Object.entries(params ?? {})) {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }

  return url.toString();
}

/**
 * Calls a Route Handler and returns the unwrapped `data`.
 *
 * Throws `ApiError` for a non-2xx, an envelope with `success: false`, a network
 * failure, or a body that is not the expected envelope.
 */
export async function request<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { method = "GET", token, cache, next, params, body, headers, signal } = options;

  let response: Response;

  try {
    response = await fetch(buildUrl(path, params), {
      method,
      cache,
      next,
      signal,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new ApiError("Request aborted", 0);
    }
    throw new ApiError("Network error — could not reach the server", 0);
  }

  let payload: ApiResponse<T> | null = null;

  try {
    payload = (await response.json()) as ApiResponse<T>;
  } catch {
    throw new ApiError(`Malformed response from ${path}`, response.status);
  }

  if (!response.ok || payload.success === false) {
    throw new ApiError(
      payload.message || "Request failed",
      payload.status || response.status,
      payload.errors,
    );
  }

  if (payload.data === null || payload.data === undefined) {
    throw new ApiError(payload.message || "Response contained no data", response.status);
  }

  return payload.data;
}
