import "dotenv/config";
import { buildApp } from "./app.js";
import { loadConfig } from "./config.js";
import { OpenAIStructuredModelGateway } from "./model/openai.js";
import { createFirestoreRepository } from "./repositories/firestore.js";
import { UnavailableJeniusRepository } from "./repositories/memory.js";

const config = loadConfig();
const repository = await createFirestoreRepository(config).catch(
  () => new UnavailableJeniusRepository(),
);
const model = config.openai.apiKey ? new OpenAIStructuredModelGateway(config) : undefined;
const app = await buildApp({ config, repository, model });

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
      config.nodeEnv === "production"
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
  await app.listen({ host: config.host, port: config.port });
} catch (error) {
  app.log.error(
    config.nodeEnv === "production"
      ? { message: error instanceof Error ? error.message : "Unknown startup error" }
      : { err: error },
    "startup failed",
  );
  process.exitCode = 1;
}
