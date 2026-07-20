import type { ApiErrorResponse } from "../../shared/contracts.js";

export type ApiErrorCode = ApiErrorResponse["error"]["code"];

export class ApiError extends Error {
  constructor(
    readonly statusCode: number,
    readonly code: ApiErrorCode,
    message: string,
    readonly retryable = false,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function normalizeHttpError(error: unknown): unknown {
  if (error instanceof ApiError) return error;
  if (!error || typeof error !== "object" || !("statusCode" in error)) return error;

  const statusCode = Number(error.statusCode);
  if (statusCode === 413) {
    return new ApiError(413, "bad_request", "The request body is too large.");
  }
  if (statusCode >= 400 && statusCode < 500) {
    return new ApiError(400, "bad_request", "The request did not match the expected format.");
  }
  return error;
}

export function formatSafeError(
  error: unknown,
  requestId: string,
): {
  statusCode: number;
  body: ApiErrorResponse;
} {
  const safe =
    error instanceof ApiError
      ? error
      : new ApiError(500, "internal_error", "Jenius could not complete that request.", true);
  return {
    statusCode: safe.statusCode,
    body: {
      error: {
        code: safe.code,
        message: safe.message,
        requestId,
        retryable: safe.retryable,
      },
    },
  };
}
