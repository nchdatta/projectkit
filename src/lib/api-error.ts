import { ApiErrors } from "@/services/types";

// The one failure type in the app; both transports (http.ts, fetcher.ts) throw it.
export class ApiError extends Error {
  readonly status: number;
  // Field path → messages, ready for `setError` in react-hook-form.
  readonly errors: ApiErrors;

  constructor(message: string, status: number, errors: ApiErrors = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }

  get isValidationError(): boolean {
    return this.status === 422;
  }
}
