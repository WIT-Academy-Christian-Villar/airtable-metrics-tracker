"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const env_1 = require("./config/env");
const logger_1 = require("./config/logger");
const server = app_1.app.listen(env_1.env.port, () => {
    logger_1.logger.info({
        port: env_1.env.port,
        environment: env_1.env.nodeEnv,
    }, "API server started");
});
const shutdown = (signal) => {
    logger_1.logger.info({ signal }, "Shutting down API server");
    server.close(() => {
        logger_1.logger.info("HTTP server closed");
        process.exit(0);
    });
};
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
