import { z } from "zod";

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

export const trackerScriptQuerySchema = z.object({
  siteKey: z.string().min(1, "siteKey is required"),
  visit: booleanFromInput.default(true),
  registration: booleanFromInput.default(true),
  registrationUrlContains: trimmedStringSchema,
  confirmationPath: trimmedStringSchema,
  source: trimmedStringSchema.default("tracker-js"),
  debug: booleanFromInput.default(false),
});
