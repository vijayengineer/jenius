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
