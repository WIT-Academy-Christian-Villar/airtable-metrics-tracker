import "dotenv/config";

import { envSchema } from "../schemas/env.schema";
import type { EnvConfig } from "../types/config";

const parsed = envSchema.parse(process.env);

export const env: EnvConfig = Object.freeze({
  port: parsed.PORT,
  nodeEnv: parsed.NODE_ENV,
  logLevel: parsed.LOG_LEVEL,
  airtableApiBase: parsed.AIRTABLE_API_BASE,
  airtableToken: parsed.AIRTABLE_TOKEN,
  requestTimeoutMs: parsed.REQUEST_TIMEOUT_MS,
  retryMaxAttempts: parsed.RETRY_MAX_ATTEMPTS,
  retryInitialMs: parsed.RETRY_INITIAL_MS,
  retryMaxMs: parsed.RETRY_MAX_MS,
  airtableDryRunDefault: parsed.AIRTABLE_DRY_RUN_DEFAULT,
  eventDedupTtlMs: parsed.EVENT_DEDUP_TTL_MS,
  defaultTimezone: parsed.DEFAULT_TIMEZONE,
  sitesConfigJson: parsed.SITES_CONFIG_JSON,
});
