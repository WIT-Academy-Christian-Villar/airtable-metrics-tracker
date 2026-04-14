import { Router } from "express";

import { listProviders } from "../controllers/provider.controller";

export const providerRouter = Router();

providerRouter.get("/providers", listProviders);
