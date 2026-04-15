import type { NextFunction, Request, Response } from "express";
import type { ZodTypeAny } from "zod";
import { ZodError } from "zod";

import { AppError } from "../utils/errors";

const setRequestValue = (
  req: Request,
  key: "body" | "params" | "query",
  value: unknown,
): void => {
  Object.defineProperty(req, key, {
    value,
    configurable: true,
    enumerable: true,
    writable: true,
  });
};

export const validateRequest = (schemas: {
  body?: ZodTypeAny;
  params?: ZodTypeAny;
  query?: ZodTypeAny;
}) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (schemas.body) {
        setRequestValue(req, "body", schemas.body.parse(req.body ?? {}));
      }

      if (schemas.params) {
        setRequestValue(req, "params", schemas.params.parse(req.params));
      }

      if (schemas.query) {
        setRequestValue(req, "query", schemas.query.parse(req.query));
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(
          new AppError({
            message: "Request validation failed",
            code: "VALIDATION_ERROR",
            statusCode: 400,
            details: error.flatten(),
          }),
        );

        return;
      }

      next(error);
    }
  };
};
