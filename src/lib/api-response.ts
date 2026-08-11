import { NextResponse } from "next/server";
import type { z } from "zod";

// One response envelope for every Route Handler; both transports read it into a single `ApiError`.

// Field path → messages, e.g. `{ "contact.email": ["Invalid email"] }`; form-level under `_`.
export type ApiErrors = Record<string, string[]>;

export type ApiResponse<T> = {
  success: boolean;
  status: number;
  message: string;
  data: T | null;
  errors?: ApiErrors;
};

function envelope<T>(body: ApiResponse<T>): NextResponse<ApiResponse<T>> {
  return NextResponse.json(body, { status: body.status });
}

export function ok<T>(data: T, message = "OK", status = 200): NextResponse<ApiResponse<T>> {
  return envelope({ success: true, status, message, data });
}

export function created<T>(data: T, message = "Created"): NextResponse<ApiResponse<T>> {
  return ok(data, message, 201);
}

export function fail(
  message: string,
  status = 400,
  errors?: ApiErrors,
): NextResponse<ApiResponse<null>> {
  return envelope<null>({ success: false, status, message, data: null, errors });
}

// 422 built from a failed zod parse; dotted issue paths drop straight into react-hook-form's `setError`.
export function failValidation(
  error: z.ZodError,
  message = "Validation failed",
): NextResponse<ApiResponse<null>> {
  const errors: ApiErrors = {};

  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_";
    (errors[key] ??= []).push(issue.message);
  }

  return fail(message, 422, errors);
}

export const notFound = (resource = "Resource") => fail(`${resource} not found`, 404);
export const unauthorized = (message = "Unauthorized") => fail(message, 401);
export const forbidden = (message = "Forbidden") => fail(message, 403);
export const serverError = (message = "Something went wrong") => fail(message, 500);
