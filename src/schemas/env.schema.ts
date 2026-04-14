import { z } from "zod";

const booleanFromEnv = z.preprocess((value) => {
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

export const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace"])
    .default("info"),
  AIRTABLE_API_BASE: z.string().url().default("https://api.airtable.com/v0"),
  AIRTABLE_TOKEN: z.string().min(1).optional(),
  REQUEST_TIMEOUT_MS: z.coerce.number().int().positive().default(30000),
  RETRY_MAX_ATTEMPTS: z.coerce.number().int().min(1).max(10).default(3),
  RETRY_INITIAL_MS: z.coerce.number().int().positive().default(500),
  RETRY_MAX_MS: z.coerce.number().int().positive().default(4000),
  AIRTABLE_DRY_RUN_DEFAULT: booleanFromEnv.default(false),
  EVENT_DEDUP_TTL_MS: z.coerce.number().int().positive().default(86400000),
  DEFAULT_TIMEZONE: z.string().min(1).default("UTC"),
  SITES_CONFIG_JSON: z.string().min(1).optional(),
});
