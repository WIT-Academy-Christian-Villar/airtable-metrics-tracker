import type { NextFunction, Request, Response } from "express";

import { AppError } from "../utils/errors";

export const notFoundMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  next(
    new AppError({
      message: `Route ${req.method} ${req.originalUrl} not found`,
      code: "ROUTE_NOT_FOUND",
      statusCode: 404,
    }),
  );
};
