export interface StructuredModelRequest {
  name: string;
  instructions: string;
  input: string;
  schema: Record<string, unknown>;
  maxOutputTokens: number;
  safetyIdentifier: string;
}

export interface StructuredModelGateway {
  complete(request: StructuredModelRequest): Promise<unknown>;
}

export class ModelTimeoutError extends Error {
  constructor() {
    super("The model request timed out");
    this.name = "ModelTimeoutError";
  }
}

export class ModelUnavailableError extends Error {
  constructor() {
    super("The model service is unavailable");
    this.name = "ModelUnavailableError";
  }
}
