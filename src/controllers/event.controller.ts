import type { Request, Response } from "express";

import { trackingEventService } from "../services/events/tracking-event.service";
import type { TrackingEventKind, TrackingEventPayload } from "../types/domain";
import { sendSuccess } from "../utils/api-response";

const TRANSPARENT_GIF_BUFFER = Buffer.from(
  "R0lGODlhAQABAPAAAAAAAAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==",
  "base64",
);

const buildTrackingPixelPayload = (
  req: Request,
  kind: TrackingEventKind,
): TrackingEventPayload => {
  const route =
    typeof req.query.route === "string" ? req.query.route : undefined;
  const sourcePath =
    typeof req.query.sourcePath === "string"
      ? req.query.sourcePath
      : undefined;
  const url = typeof req.query.url === "string" ? req.query.url : undefined;
  const eventId =
    typeof req.query.eventId === "string" ? req.query.eventId : undefined;
  const source =
    typeof req.query.source === "string"
      ? req.query.source
      : "tracking-pixel";
  const capturedAt =
    typeof req.query.capturedAt === "string"
      ? req.query.capturedAt
      : undefined;
  const dateBucket =
    typeof req.query.dateBucket === "string"
      ? req.query.dateBucket
      : undefined;
  const increment =
    typeof req.query.increment === "number"
      ? req.query.increment
      : Number(req.query.increment);
  const metadata =
    typeof req.query.referrer === "string"
      ? {
          referrer: req.query.referrer,
        }
      : undefined;

  return {
    siteKey: req.query.siteKey as string,
    route: route ?? sourcePath,
    url,
    eventId,
    kind,
    increment,
    source,
    capturedAt,
    dateBucket,
    ...(typeof req.query.utmSource === "string"
      ? { utmSource: req.query.utmSource }
      : {}),
    ...(typeof req.query.utmMedium === "string"
      ? { utmMedium: req.query.utmMedium }
      : {}),
    ...(typeof req.query.utmCampaign === "string"
      ? { utmCampaign: req.query.utmCampaign }
      : {}),
    ...(typeof req.query.utmTerm === "string"
      ? { utmTerm: req.query.utmTerm }
      : {}),
    ...(typeof req.query.utmContent === "string"
      ? { utmContent: req.query.utmContent }
      : {}),
    utms: undefined,
    metadata,
  };
};

const sendTrackingPixel = (req: Request, res: Response, runId: string): Response =>
  res
    .status(200)
    .set({
      "Cache-Control": "no-store, no-cache, max-age=0, must-revalidate",
      "Content-Type": "image/gif",
      "X-Run-Id": runId,
      "X-Request-Id": req.requestId,
    })
    .send(TRANSPARENT_GIF_BUFFER);

export const ingestVisitEvent = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  const run = await trackingEventService.ingest({
    requestId: req.requestId,
    payload: {
      siteKey: req.body.siteKey,
      route: req.body.route,
      url: req.body.url,
      eventId: req.body.eventId,
      kind: "visit",
      increment: req.body.increment,
      source: req.body.source,
      capturedAt: req.body.capturedAt,
      dateBucket: req.body.dateBucket,
      utmSource: req.body.utmSource,
      utmMedium: req.body.utmMedium,
      utmCampaign: req.body.utmCampaign,
      utmTerm: req.body.utmTerm,
      utmContent: req.body.utmContent,
      utms: req.body.utms,
      metadata: req.body.metadata,
    },
    dryRun: req.body.dryRun,
  });

  return sendSuccess(req, res, {
    message: "Visit event processed",
    data: run,
    runId: run.runId,
  });
};

export const ingestRegistrationEvent = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  const run = await trackingEventService.ingest({
    requestId: req.requestId,
    payload: {
      siteKey: req.body.siteKey,
      route: req.body.route,
      url: req.body.url,
      eventId: req.body.eventId,
      kind: "registration",
      increment: req.body.increment,
      source: req.body.source,
      capturedAt: req.body.capturedAt,
      dateBucket: req.body.dateBucket,
      utmSource: req.body.utmSource,
      utmMedium: req.body.utmMedium,
      utmCampaign: req.body.utmCampaign,
      utmTerm: req.body.utmTerm,
      utmContent: req.body.utmContent,
      utms: req.body.utms,
      metadata: req.body.metadata,
    },
    dryRun: req.body.dryRun,
  });

  return sendSuccess(req, res, {
    message: "Registration event processed",
    data: run,
    runId: run.runId,
  });
};

export const ingestVisitPixel = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  const dryRun =
    typeof req.query.dryRun === "boolean" ? req.query.dryRun : undefined;
  const run = await trackingEventService.ingest({
    requestId: req.requestId,
    payload: buildTrackingPixelPayload(req, "visit"),
    dryRun,
  });

  return sendTrackingPixel(req, res, run.runId);
};

export const ingestRegistrationPixel = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  const dryRun =
    typeof req.query.dryRun === "boolean" ? req.query.dryRun : undefined;
  const run = await trackingEventService.ingest({
    requestId: req.requestId,
    payload: buildTrackingPixelPayload(req, "registration"),
    dryRun,
  });

  return sendTrackingPixel(req, res, run.runId);
};
