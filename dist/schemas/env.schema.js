"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.envSchema = void 0;
const zod_1 = require("zod");
const booleanFromEnv = zod_1.z.preprocess((value) => {
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
}, zod_1.z.boolean());
exports.envSchema = zod_1.z.object({
    PORT: zod_1.z.coerce.number().int().positive().default(3000),
    NODE_ENV: zod_1.z.enum(["development", "test", "production"]).default("development"),
    LOG_LEVEL: zod_1.z
        .enum(["fatal", "error", "warn", "info", "debug", "trace"])
        .default("info"),
    AIRTABLE_API_BASE: zod_1.z.string().url().default("https://api.airtable.com/v0"),
    AIRTABLE_TOKEN: zod_1.z.string().min(1).optional(),
    REQUEST_TIMEOUT_MS: zod_1.z.coerce.number().int().positive().default(30000),
    RETRY_MAX_ATTEMPTS: zod_1.z.coerce.number().int().min(1).max(10).default(3),
    RETRY_INITIAL_MS: zod_1.z.coerce.number().int().positive().default(500),
    RETRY_MAX_MS: zod_1.z.coerce.number().int().positive().default(4000),
    AIRTABLE_DRY_RUN_DEFAULT: booleanFromEnv.default(false),
    EVENT_DEDUP_TTL_MS: zod_1.z.coerce.number().int().positive().default(86400000),
    DEFAULT_TIMEZONE: zod_1.z.string().min(1).default("UTC"),
    SITES_CONFIG_JSON: zod_1.z.string().min(1).optional(),
});
