import type { Request, Response } from "express";

import { APP_NAME, APP_VERSION } from "../config/constants";
import { env } from "../config/env";
import { keyedSerialQueueService } from "../services/queue/keyed-serial-queue.service";
import { siteService } from "../services/site.service";
import { sendSuccess } from "../utils/api-response";

export const getHealth = (req: Request, res: Response): Response =>
  sendSuccess(req, res, {
    message: "Service healthy",
    data: {
      name: APP_NAME,
      version: APP_VERSION,
      environment: env.nodeEnv,
      configuredSites: siteService.list().length,
      pendingEventKeys: keyedSerialQueueService.getPendingKeys(),
    },
  });
