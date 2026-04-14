import type { Request, Response } from "express";

import { siteService } from "../services/site.service";
import { sendSuccess } from "../utils/api-response";

export const listSites = (req: Request, res: Response): Response =>
  sendSuccess(req, res, {
    message: "Configured sites",
    data: {
      items: siteService.listSummaries(),
      count: siteService.list().length,
    },
  });
