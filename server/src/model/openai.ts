import OpenAI from "openai";
import type { ServerConfig } from "../config.js";
import {
  ModelTimeoutError,
  ModelUnavailableError,
  type StructuredModelGateway,
  type StructuredModelRequest,
} from "./gateway.js";

export class OpenAIStructuredModelGateway implements StructuredModelGateway {
  private readonly client: OpenAI;

  constructor(private readonly config: ServerConfig) {
    this.client = new OpenAI({
      apiKey: config.openai.apiKey,
      timeout: config.openai.timeoutMs,
      maxRetries: config.openai.maxRetries,
    });
  }

  async complete(request: StructuredModelRequest): Promise<unknown> {
    try {
      const response = await this.client.responses.create({
        model: this.config.openai.model,
        instructions: request.instructions,
        input: request.input,
        max_output_tokens: request.maxOutputTokens,
        safety_identifier: request.safetyIdentifier,
        store: false,
        text: {
          format: {
            type: "json_schema",
            name: request.name,
            strict: true,
            schema: request.schema,
          },
        },
      });
      if (!response.output_text) throw new ModelUnavailableError();
      return JSON.parse(response.output_text) as unknown;
    } catch (error) {
      if (
        error instanceof OpenAI.APIConnectionTimeoutError ||
        (error instanceof Error && error.name === "AbortError")
      ) {
        throw new ModelTimeoutError();
      }
      if (error instanceof ModelUnavailableError) throw error;
      throw new ModelUnavailableError();
    }
  }
}
