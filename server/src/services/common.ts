import { ApiError } from "../errors.js";
import { ModelTimeoutError, ModelUnavailableError } from "../model/gateway.js";

export function mapModelError(error: unknown): never {
  if (error instanceof ModelTimeoutError) {
    throw new ApiError(504, "timeout", "The learning coach took too long to respond.", true);
  }
  if (error instanceof ModelUnavailableError) {
    throw new ApiError(
      503,
      "upstream_unavailable",
      "The learning coach is temporarily unavailable.",
      true,
    );
  }
  throw new ApiError(
    503,
    "upstream_unavailable",
    "The learning coach is temporarily unavailable.",
    true,
  );
}

export async function consumeUsageOrThrow(
  action: () => Promise<{ allowed: boolean }>,
): Promise<void> {
  try {
    const result = await action();
    if (!result.allowed) {
      throw new ApiError(
        429,
        "rate_limited",
        "You have reached today's limit for this feature.",
        false,
      );
    }
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      503,
      "upstream_unavailable",
      "Usage protection is temporarily unavailable.",
      true,
    );
  }
}
