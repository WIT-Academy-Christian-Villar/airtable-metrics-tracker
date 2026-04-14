import type { Request, Response } from "express";

export const sendSuccess = <T>(
  req: Request,
  res: Response,
  options: {
    statusCode?: number;
    message: string;
    data: T;
    runId?: string;
  },
): Response =>
  res.status(options.statusCode ?? 200).json({
    success: true,
    message: options.message,
    data: options.data,
    meta: {
      requestId: req.requestId,
      timestamp: new Date().toISOString(),
      runId: options.runId,
    },
  });
