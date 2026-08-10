import type { ApiErrors } from "@/lib/api-response";

/**
 * The one failure type in the app.
 *
 * Both transports produce it — the axios interceptor in `src/lib/http.ts` for
 * client calls, `request` in `src/lib/fetcher.ts` for server calls — so a
 * caller handles a single shape no matter which side it runs on.
 */
export class ApiError extends Error {
  readonly status: number;
  /** Field path → messages, ready for `setError` in react-hook-form. */
  readonly errors: ApiErrors;

  constructor(message: string, status: number, errors: ApiErrors = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }

  /** True when the server rejected the payload and returned per-field problems. */
  get isValidationError(): boolean {
    return this.status === 422;
  }
}
