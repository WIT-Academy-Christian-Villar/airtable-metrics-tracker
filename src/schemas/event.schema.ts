import { z } from "zod";

import { dateBucketSchema } from "./common.schema";

const booleanFromInput = z.preprocess((value) => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();

    if (normalized === "true") {
      return true;
    }

    if (normalized === "false") {
      return false;
    }
  }

  return value;
}, z.boolean());

const trimmedStringSchema = z.preprocess((value) => {
  if (value === null || value === undefined) {
    return undefined;
  }

  if (typeof value === "string") {
    const normalized = value.trim();
    return normalized.length > 0 ? normalized : undefined;
  }

  return value;
}, z.string().min(1).optional());

const sourceStringSchema = z.preprocess((value) => {
  if (value === null || value === undefined) {
    return undefined;
  }

  if (typeof value === "string") {
    const normalized = value.trim();
    return normalized.length > 0 ? normalized : undefined;
  }

  return value;
}, z.string().min(1).default("first-party"));

const pixelSourceStringSchema = z.preprocess((value) => {
  if (value === null || value === undefined) {
    return undefined;
  }

  if (typeof value === "string") {
    const normalized = value.trim();
    return normalized.length > 0 ? normalized : undefined;
  }

  return value;
}, z.string().min(1).default("tracking-pixel"));

const eventBodySchema = z
  .object({
    siteKey: z.string().min(1, "siteKey is required"),
    route: trimmedStringSchema,
    url: z.string().url().optional(),
    eventId: trimmedStringSchema,
    increment: z.coerce.number().int().positive().max(1000).default(1),
    source: sourceStringSchema,
    capturedAt: z.string().datetime().optional(),
    dateBucket: dateBucketSchema.optional(),
    dryRun: booleanFromInput.optional(),
    utmSource: trimmedStringSchema,
    utmMedium: trimmedStringSchema,
    utmCampaign: trimmedStringSchema,
    utmTerm: trimmedStringSchema,
    utmContent: trimmedStringSchema,
    utms: z.record(z.unknown()).optional(),
    metadata: z.record(z.unknown()).optional(),
  })
  .refine((value) => Boolean(value.route || value.url), {
    path: ["route"],
    message: "route or url is required",
  });

const trackingPixelQuerySchema = z
  .object({
    siteKey: z.string().min(1, "siteKey is required"),
    route: trimmedStringSchema,
    sourcePath: trimmedStringSchema,
    url: z.string().url().optional(),
    eventId: trimmedStringSchema,
    increment: z.coerce.number().int().positive().max(1000).default(1),
    source: pixelSourceStringSchema,
    capturedAt: z.string().datetime().optional(),
    dateBucket: dateBucketSchema.optional(),
    dryRun: booleanFromInput.optional(),
    utmSource: trimmedStringSchema,
    utmMedium: trimmedStringSchema,
    utmCampaign: trimmedStringSchema,
    utmTerm: trimmedStringSchema,
    utmContent: trimmedStringSchema,
    referrer: trimmedStringSchema,
  })
  .refine((value) => Boolean(value.route || value.sourcePath || value.url), {
    path: ["route"],
    message: "route, sourcePath or url is required",
  });

export const visitPixelQuerySchema = trackingPixelQuerySchema;
export const registrationPixelQuerySchema = trackingPixelQuerySchema;
export const visitEventBodySchema = eventBodySchema;
export const registrationEventBodySchema = eventBodySchema;
