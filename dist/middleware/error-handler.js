"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandlerMiddleware = void 0;
const zod_1 = require("zod");
const logger_1 = require("../config/logger");
const errors_1 = require("../utils/errors");
const errorHandlerMiddleware = (error, req, res, _next) => {
    const normalizedError = error instanceof zod_1.ZodError
        ? new errors_1.AppError({
            message: "Validation failed",
            code: "VALIDATION_ERROR",
            statusCode: 400,
            details: error.flatten(),
        })
        : (0, errors_1.isAppError)(error)
            ? error
            : new errors_1.AppError({
                message: "Unexpected internal error",
                code: "INTERNAL_SERVER_ERROR",
                statusCode: 500,
                details: error,
            });
    logger_1.logger.error({
        requestId: req.requestId,
        errorCode: normalizedError.code,
        details: normalizedError.details,
    }, normalizedError.message);
    return res.status(normalizedError.statusCode).json({
        success: false,
        message: normalizedError.message,
        error: {
            code: normalizedError.code,
            details: normalizedError.details,
        },
        meta: {
            requestId: req.requestId,
            timestamp: new Date().toISOString(),
        },
    });
};
exports.errorHandlerMiddleware = errorHandlerMiddleware;
