import type { Request, Response } from "express";

import { syncOrchestratorService } from "../services/sync-orchestrator.service";
import { AppError } from "../utils/errors";
import { sendSuccess } from "../utils/api-response";

export const getRunById = (req: Request, res: Response): Response => {
  const runId =
    typeof req.params.runId === "string" ? req.params.runId : undefined;
  const run = runId ? syncOrchestratorService.getRun(runId) : undefined;

  if (!run) {
    throw new AppError({
      message: `Run ${runId ?? "unknown"} not found`,
      code: "RUN_NOT_FOUND",
      statusCode: 404,
    });
  }

  return sendSuccess(req, res, {
    message: "Run found",
    data: run,
    runId: run.runId,
  });
};
