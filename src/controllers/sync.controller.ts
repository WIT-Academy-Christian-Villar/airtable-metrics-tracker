import type { Request, Response } from "express";

import { syncOrchestratorService } from "../services/sync-orchestrator.service";
import { sendSuccess } from "../utils/api-response";

export const syncAllSites = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  const run = await syncOrchestratorService.sync({
    requestId: req.requestId,
    siteKeys: req.body.siteKeys,
    dateBucket: req.body.dateBucket,
    dryRun: req.body.dryRun,
    trigger: req.body.trigger,
  });

  return sendSuccess(req, res, {
    statusCode: 202,
    message: "Sync run completed",
    data: run,
    runId: run.runId,
  });
};

export const syncSingleSite = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  const siteKey =
    typeof req.params.siteKey === "string" ? req.params.siteKey : undefined;
  const run = await syncOrchestratorService.sync({
    requestId: req.requestId,
    siteKeys: siteKey ? [siteKey] : [],
    dateBucket: req.body.dateBucket,
    dryRun: req.body.dryRun,
    trigger: req.body.trigger,
  });

  return sendSuccess(req, res, {
    statusCode: 202,
    message: `Sync run completed for ${siteKey ?? "unknown"}`,
    data: run,
    runId: run.runId,
  });
};
