import {
  ApiErrorResponseSchema,
  ExplainRequestSchema,
  ExplainResponseSchema,
  GenerateRequestSchema,
  GenerateResponseSchema,
  type ExplainRequest,
  type ExplainResponse,
  type GenerateRequest,
  type GenerateResponse,
} from "../../shared/contracts";

export type ApiErrorCategory =
  "offline" | "configuration" | "timeout" | "rate-limit" | "validation" | "server" | "network";

export class JeniusApiError extends Error {
  constructor(
    readonly category: ApiErrorCategory,
    message: string,
    readonly retryable: boolean,
    readonly requestId?: string,
  ) {
    super(message);
    this.name = "JeniusApiError";
  }
}

export interface JeniusApiClientOptions {
  baseUrl?: string;
  timeoutMs?: number;
  fetch?: typeof fetch;
  isOnline?: () => boolean;
}

export interface JeniusApiClient {
  explain(request: ExplainRequest): Promise<ExplainResponse>;
  generate(request: GenerateRequest): Promise<GenerateResponse>;
}

function configuredBaseUrl(): string {
  return (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() ?? "";
}

function categoryForStatus(status: number): ApiErrorCategory {
  if (status === 429) return "rate-limit";
  if (status >= 500) return "server";
  return "validation";
}

export function createJeniusApiClient(options: JeniusApiClientOptions = {}): JeniusApiClient {
  const baseUrl = (options.baseUrl ?? configuredBaseUrl()).replace(/\/+$/, "");
  const timeoutMs = options.timeoutMs ?? 15_000;
  const fetchImplementation = options.fetch ?? globalThis.fetch;
  const isOnline =
    options.isOnline ?? (() => (typeof navigator === "undefined" ? true : navigator.onLine));

  async function post<TRequest, TResponse>(
    path: string,
    request: TRequest,
    validateResponse: (value: unknown) => { success: true; data: TResponse } | { success: false },
  ): Promise<TResponse> {
    if (!isOnline()) {
      throw new JeniusApiError("offline", "You're offline. The core lesson still works.", true);
    }
    if (!baseUrl) {
      throw new JeniusApiError(
        "configuration",
        "The optional Jenius coach is not configured.",
        false,
      );
    }
    const controller = new AbortController();
    const timeout = globalThis.setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetchImplementation(`${baseUrl}${path}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(request),
        cache: "no-store",
        credentials: "omit",
        signal: controller.signal,
      });
      const raw: unknown = await response.json().catch(() => undefined);
      if (!response.ok) {
        const safeError = ApiErrorResponseSchema.safeParse(raw);
        throw new JeniusApiError(
          categoryForStatus(response.status),
          safeError.success
            ? safeError.data.error.message
            : "Jenius could not complete that request.",
          safeError.success ? safeError.data.error.retryable : response.status >= 500,
          safeError.success ? safeError.data.error.requestId : undefined,
        );
      }
      const validated = validateResponse(raw);
      if (!validated.success) {
        throw new JeniusApiError(
          "validation",
          "Jenius received a response it could not safely use.",
          true,
        );
      }
      return validated.data;
    } catch (error) {
      if (error instanceof JeniusApiError) throw error;
      if (
        controller.signal.aborted ||
        (error instanceof DOMException && error.name === "AbortError")
      ) {
        throw new JeniusApiError("timeout", "The request took too long.", true);
      }
      throw new JeniusApiError("network", "Jenius could not reach the optional coach.", true);
    } finally {
      globalThis.clearTimeout(timeout);
    }
  }

  return {
    explain(request) {
      const parsed = ExplainRequestSchema.safeParse(request);
      if (!parsed.success) {
        return Promise.reject(
          new JeniusApiError("validation", "The explanation request is invalid.", false),
        );
      }
      return post("/api/explain", parsed.data, (value) => ExplainResponseSchema.safeParse(value));
    },
    generate(request) {
      const parsed = GenerateRequestSchema.safeParse(request);
      if (!parsed.success) {
        return Promise.reject(
          new JeniusApiError("validation", "The lesson request is invalid.", false),
        );
      }
      return post("/api/generate", parsed.data, (value) => GenerateResponseSchema.safeParse(value));
    },
  };
}
