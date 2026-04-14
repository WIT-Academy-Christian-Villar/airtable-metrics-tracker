"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLoggerMiddleware = void 0;
const logger_1 = require("../config/logger");
const requestLoggerMiddleware = (req, res, next) => {
    const startedAt = Date.now();
    res.on("finish", () => {
        logger_1.logger.info({
            requestId: req.requestId,
            method: req.method,
            path: req.originalUrl,
            statusCode: res.statusCode,
            durationMs: Date.now() - startedAt,
        }, "HTTP request completed");
    });
    next();
};
exports.requestLoggerMiddleware = requestLoggerMiddleware;
