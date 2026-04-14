import type { Request, Response } from "express";

import { providerRegistry } from "../services/provider-registry.service";
import { sendSuccess } from "../utils/api-response";

export const listProviders = (req: Request, res: Response): Response =>
  sendSuccess(req, res, {
    message: "Registered providers",
    data: {
      items: providerRegistry.listProviders(),
      count: providerRegistry.listProviders().length,
    },
  });
