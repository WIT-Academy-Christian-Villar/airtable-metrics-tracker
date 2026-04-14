import { Router } from "express";

import { listSites } from "../controllers/site.controller";

export const siteRouter = Router();

siteRouter.get("/sites", listSites);
