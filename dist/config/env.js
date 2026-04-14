"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
require("dotenv/config");
const env_schema_1 = require("../schemas/env.schema");
const parsed = env_schema_1.envSchema.parse(process.env);
exports.env = Object.freeze({
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
