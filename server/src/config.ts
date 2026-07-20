import { z } from "zod";
import { EXPLANATION_PROMPT_VERSION, GENERATION_PROMPT_VERSION } from "./prompts/constants.js";

const BooleanStringSchema = z
  .enum(["true", "false"])
  .default("false")
  .transform((value) => value === "true");

const EnvironmentSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    HOST: z.string().trim().min(1).default("127.0.0.1"),
    PORT: z.coerce.number().int().min(1).max(65_535).default(301),
    FRONTEND_ORIGINS: z.string().default("http://localhost:5173"),
    TRUST_PROXY: BooleanStringSchema,
    OPENAI_API_KEY: z.string().trim().default(""),
    OPENAI_MODEL: z.string().trim().default(""),
    OPENAI_TIMEOUT_MS: z.coerce.number().int().min(1_000).max(120_000).default(30_000),
    OPENAI_MAX_RETRIES: z.coerce.number().int().min(0).max(3).default(1),
    FIREBASE_SERVICE_ACCOUNT_FILE: z.string().trim().default(""),
    FIRESTORE_DATABASE_ID: z.string().trim().default("(default)"),
    USAGE_HASH_SALT: z.string().default(""),
    DAILY_EXPLAIN_LIMIT: z.coerce.number().int().min(1).max(1_000).default(20),
    DAILY_GENERATE_LIMIT: z.coerce.number().int().min(1).max(1_000).default(5),
    EXPLANATION_PROMPT_VERSION: z.string().trim().min(1).default(EXPLANATION_PROMPT_VERSION),
    GENERATION_PROMPT_VERSION: z.string().trim().min(1).default(GENERATION_PROMPT_VERSION),
  })
  .passthrough();

export interface ServerConfig {
  nodeEnv: "development" | "test" | "production";
  host: string;
  port: number;
  frontendOrigins: string[];
  trustProxy: boolean;
  openai: {
    apiKey: string;
    model: string;
    timeoutMs: number;
    maxRetries: number;
  };
  firebase: {
    serviceAccountFile: string;
    databaseId: string;
  };
  usage: {
    hashSalt: string;
    dailyExplainLimit: number;
    dailyGenerateLimit: number;
  };
  prompts: {
    explanationVersion: string;
    generationVersion: string;
  };
  configurationReady: boolean;
}

function parseOrigins(raw: string, production: boolean): string[] {
  const origins = [
    ...new Set(
      raw
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  ];
  for (const origin of origins) {
    if (origin === "*" && production) {
      throw new Error("FRONTEND_ORIGINS cannot contain a wildcard in production");
    }
    if (origin !== "*") {
      const parsed = new URL(origin);
      if (!["http:", "https:"].includes(parsed.protocol) || parsed.origin !== origin) {
        throw new Error(`Invalid FRONTEND_ORIGINS entry: ${origin}`);
      }
    }
  }
  if (production && origins.length === 0) {
    throw new Error("FRONTEND_ORIGINS is required in production");
  }
  return origins;
}

export function loadConfig(environment: NodeJS.ProcessEnv = process.env): ServerConfig {
  const parsed = EnvironmentSchema.parse(environment);
  const production = parsed.NODE_ENV === "production";
  const frontendOrigins = parseOrigins(parsed.FRONTEND_ORIGINS, production);
  const configurationReady = Boolean(
    parsed.OPENAI_API_KEY && parsed.OPENAI_MODEL && parsed.USAGE_HASH_SALT,
  );

  return {
    nodeEnv: parsed.NODE_ENV,
    host: parsed.HOST,
    port: parsed.PORT,
    frontendOrigins,
    trustProxy: parsed.TRUST_PROXY,
    openai: {
      apiKey: parsed.OPENAI_API_KEY,
      model: parsed.OPENAI_MODEL,
      timeoutMs: parsed.OPENAI_TIMEOUT_MS,
      maxRetries: parsed.OPENAI_MAX_RETRIES,
    },
    firebase: {
      serviceAccountFile: parsed.FIREBASE_SERVICE_ACCOUNT_FILE,
      databaseId: parsed.FIRESTORE_DATABASE_ID,
    },
    usage: {
      hashSalt: parsed.USAGE_HASH_SALT,
      dailyExplainLimit: parsed.DAILY_EXPLAIN_LIMIT,
      dailyGenerateLimit: parsed.DAILY_GENERATE_LIMIT,
    },
    prompts: {
      explanationVersion: parsed.EXPLANATION_PROMPT_VERSION,
      generationVersion: parsed.GENERATION_PROMPT_VERSION,
    },
    configurationReady,
  };
}
