import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import Fastify, { type FastifyInstance } from "fastify";
import { ZodError } from "zod";
import type { ServerConfig } from "./config.js";
import { ApiError, formatSafeError } from "./errors.js";
import type { JeniusRepository } from "./repositories/types.js";
import { APPLICATION_VERSION, SERVICE_NAME } from "./version.js";

export interface AppDependencies {
  config: ServerConfig;
  repository: JeniusRepository;
}

async function readinessWithTimeout(repository: JeniusRepository): Promise<boolean> {
  let timer: NodeJS.Timeout | undefined;
  try {
    return await Promise.race([
      repository.checkReadiness(),
      new Promise<boolean>((resolve) => {
        timer = setTimeout(() => resolve(false), 1_500);
      }),
    ]);
  } catch {
    return false;
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export async function buildApp(dependencies: AppDependencies): Promise<FastifyInstance> {
  const { config, repository } = dependencies;
  const app = Fastify({
    logger:
      config.nodeEnv === "test"
        ? false
        : {
            level: config.nodeEnv === "production" ? "info" : "debug",
            redact: {
              paths: ["req.headers.authorization", "req.headers.cookie", "req.body", "res.body"],
              censor: "[redacted]",
            },
          },
    trustProxy: config.trustProxy,
    bodyLimit: 16 * 1024,
    requestTimeout: config.openai.timeoutMs + 5_000,
    connectionTimeout: 10_000,
    keepAliveTimeout: 30_000,
    disableRequestLogging: config.nodeEnv === "production",
  });

  await app.register(helmet, {
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "same-site" },
  });
  await app.register(cors, {
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["content-type", "x-request-id"],
    exposedHeaders: ["x-request-id"],
    maxAge: 600,
    origin(origin, callback) {
      if (!origin || config.frontendOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      if (config.nodeEnv !== "production" && config.frontendOrigins.includes("*")) {
        callback(null, true);
        return;
      }
      callback(new ApiError(403, "bad_request", "This origin is not allowed."), false);
    },
  });

  app.addHook("onSend", async (request, reply, payload) => {
    void reply.header("x-request-id", request.id);
    return payload;
  });

  app.get("/health", async () => {
    const firestoreReady = await readinessWithTimeout(repository);
    return {
      status: config.configurationReady && firestoreReady ? "ready" : "degraded",
      service: SERVICE_NAME,
      version: APPLICATION_VERSION,
      timestamp: new Date().toISOString(),
      configuration: {
        ready: config.configurationReady,
        openai: Boolean(config.openai.apiKey && config.openai.model),
        usageProtection: Boolean(config.usage.hashSalt),
      },
      firestore: {
        ready: firestoreReady,
      },
    };
  });

  app.setNotFoundHandler(async (request, reply) => {
    const formatted = formatSafeError(
      new ApiError(404, "not_found", "The requested Jenius endpoint does not exist."),
      request.id,
    );
    return reply.status(formatted.statusCode).send(formatted.body);
  });

  app.setErrorHandler(async (error, request, reply) => {
    const normalized =
      error instanceof ZodError
        ? new ApiError(400, "bad_request", "The request did not match the expected format.")
        : error;
    const formatted = formatSafeError(normalized, request.id);
    if (formatted.statusCode >= 500) {
      request.log.error({ err: error, requestId: request.id }, "request failed");
    }
    return reply.status(formatted.statusCode).send(formatted.body);
  });

  return app;
}
