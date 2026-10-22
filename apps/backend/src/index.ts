import "./config/loadEnv";
import app from "./app";
import { logger } from "./lib/logger";
import { seedService } from "./services/seed.service";

const rawPort = process.env.API_PORT ?? process.env.PORT ?? "8080";
const port = Number(rawPort);

if (!Number.isInteger(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

async function start(): Promise<void> {
  await seedService.ensureSeedData();
  app.listen(port, (err) => {
    if (err) {
      logger.error({ err }, "Error listening on port");
      process.exit(1);
    }

    logger.info({ port }, "Server listening");
  });
}

void start().catch((err: unknown) => {
  logger.error({ err }, "API server startup failed");
  process.exit(1);
});
