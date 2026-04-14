import { Router } from "express";

import { getRunById } from "../controllers/run.controller";
import { runIdParamsSchema } from "../schemas/common.schema";
import { validateRequest } from "../middleware/validate-request";

export const runRouter = Router();

runRouter.get("/runs/:runId", validateRequest({ params: runIdParamsSchema }), getRunById);
