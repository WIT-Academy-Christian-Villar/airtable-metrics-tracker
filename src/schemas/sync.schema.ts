import { z } from "zod";

import { dateBucketSchema, siteKeyParamsSchema } from "./common.schema";

const booleanInputSchema = z.preprocess((value) => {
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

export const syncRequestBodySchema = z.object({
  siteKeys: z.array(z.string().min(1)).min(1).optional(),
  dateBucket: dateBucketSchema.optional(),
  dryRun: booleanInputSchema.optional(),
  trigger: z.enum(["manual", "scheduled", "api"]).default("manual"),
});

export const syncSiteParamsSchema = siteKeyParamsSchema;
