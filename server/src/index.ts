import "dotenv/config";
import { buildApp } from "./app.js";
import { formatConfigurationError, loadConfig, type ServerConfig } from "./config.js";
import { OpenAIStructuredModelGateway } from "./model/openai.js";
import { createFirestoreRepository, firestoreDiagnosticReason } from "./repositories/firestore.js";
import { UnavailableJeniusRepository } from "./repositories/memory.js";

let config: ServerConfig | undefined;
try {
  config = loadConfig();
} catch (error) {
  if (process.env.NODE_ENV === "production") {
    console.error(`[jenius-api] startup failed: ${formatConfigurationError(error)}`);
  } else {
    console.error(error);
  }
  process.exitCode = 1;
}

if (config) {
  const activeConfig = config;
  const repository = await createFirestoreRepository(activeConfig).catch((error) => {
    const reason = firestoreDiagnosticReason(error);
    if (activeConfig.nodeEnv !== "production") {
      console.error(`[jenius-api] Firestore startup unavailable: ${reason}`);
    }
    return new UnavailableJeniusRepository(reason);
  });
  const model = activeConfig.openai.apiKey
    ? new OpenAIStructuredModelGateway(activeConfig)
    : undefined;
  const app = await buildApp({ config: activeConfig, repository, model });

  let closing = false;
  async function shutdown(signal: string) {
    if (closing) return;
    closing = true;
    app.log.info({ signal }, "shutting down");
    try {
      await app.close();
      process.exitCode = 0;
    } catch (error) {
      app.log.error(
        activeConfig.nodeEnv === "production"
          ? { message: error instanceof Error ? error.message : "Unknown shutdown error" }
          : { err: error },
        "shutdown failed",
      );
      process.exitCode = 1;
    }
  }

  process.once("SIGINT", () => void shutdown("SIGINT"));
  process.once("SIGTERM", () => void shutdown("SIGTERM"));

  try {
    await app.listen({ host: activeConfig.host, port: activeConfig.port });
  } catch (error) {
    app.log.error(
      activeConfig.nodeEnv === "production"
        ? { message: error instanceof Error ? error.message : "Unknown startup error" }
        : { err: error },
      "startup failed",
    );
    process.exitCode = 1;
  }
}
