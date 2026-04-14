import { app } from "./app";
import { env } from "./config/env";
import { logger } from "./config/logger";

const server = app.listen(env.port, () => {
  logger.info(
    {
      port: env.port,
      environment: env.nodeEnv,
    },
    "API server started",
  );
});

const shutdown = (signal: string): void => {
  logger.info({ signal }, "Shutting down API server");
  server.close(() => {
    logger.info("HTTP server closed");
    process.exit(0);
  });
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
