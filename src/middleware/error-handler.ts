import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

import { logger } from "../config/logger";
import { AppError, isAppError } from "../utils/errors";

export const errorHandlerMiddleware = (
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): Response => {
  const normalizedError =
    error instanceof ZodError
      ? new AppError({
          message: "Validation failed",
          code: "VALIDATION_ERROR",
          statusCode: 400,
          details: error.flatten(),
        })
      : isAppError(error)
        ? error
        : new AppError({
            message: "Unexpected internal error",
            code: "INTERNAL_SERVER_ERROR",
            statusCode: 500,
            details: error,
          });

  logger.error(
    {
      requestId: req.requestId,
      errorCode: normalizedError.code,
      details: normalizedError.details,
    },
    normalizedError.message,
  );

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
