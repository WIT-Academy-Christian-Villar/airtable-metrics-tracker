import { Router } from "express";

import {
  syncAllSites,
  syncSingleSite,
} from "../controllers/sync.controller";
import { validateRequest } from "../middleware/validate-request";
import { syncSiteParamsSchema, syncRequestBodySchema } from "../schemas/sync.schema";

export const syncRouter = Router();

syncRouter.post("/sync", validateRequest({ body: syncRequestBodySchema }), syncAllSites);
syncRouter.post(
  "/sync/:siteKey",
  validateRequest({
    params: syncSiteParamsSchema,
    body: syncRequestBodySchema,
  }),
  syncSingleSite,
);
