import { Router } from "express";

import { getTrackerScript } from "../controllers/tracker.controller";
import { validateRequest } from "../middleware/validate-request";
import { trackerScriptQuerySchema } from "../schemas/tracker.schema";

export const trackerRouter = Router();

trackerRouter.get(
  "/tracker.js",
  validateRequest({ query: trackerScriptQuerySchema }),
  getTrackerScript,
);
