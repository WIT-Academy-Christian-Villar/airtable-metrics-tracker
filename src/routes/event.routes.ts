import { Router } from "express";

import {
  ingestRegistrationEvent,
  ingestRegistrationPixel,
  ingestVisitPixel,
  ingestVisitEvent,
} from "../controllers/event.controller";
import { validateRequest } from "../middleware/validate-request";
import {
  registrationEventBodySchema,
  registrationPixelQuerySchema,
  visitPixelQuerySchema,
  visitEventBodySchema,
} from "../schemas/event.schema";

export const eventRouter = Router();

eventRouter.get(
  "/c/v.gif",
  validateRequest({ query: visitPixelQuerySchema }),
  ingestVisitPixel,
);
eventRouter.get(
  "/c/r.gif",
  validateRequest({ query: registrationPixelQuerySchema }),
  ingestRegistrationPixel,
);
eventRouter.post(
  "/events/visit",
  validateRequest({ body: visitEventBodySchema }),
  ingestVisitEvent,
);
eventRouter.post(
  "/events/registration",
  validateRequest({ body: registrationEventBodySchema }),
  ingestRegistrationEvent,
);
