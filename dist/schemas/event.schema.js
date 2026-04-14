"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registrationEventBodySchema = exports.visitEventBodySchema = exports.registrationPixelQuerySchema = exports.visitPixelQuerySchema = void 0;
const zod_1 = require("zod");
const common_schema_1 = require("./common.schema");
const booleanFromInput = zod_1.z.preprocess((value) => {
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
const trimmedStringSchema = zod_1.z.preprocess((value) => {
    if (value === null || value === undefined) {
        return undefined;
    }
    if (typeof value === "string") {
        const normalized = value.trim();
        return normalized.length > 0 ? normalized : undefined;
    }
    return value;
}, zod_1.z.string().min(1).optional());
const sourceStringSchema = zod_1.z.preprocess((value) => {
    if (value === null || value === undefined) {
        return undefined;
    }
    if (typeof value === "string") {
        const normalized = value.trim();
        return normalized.length > 0 ? normalized : undefined;
    }
    return value;
}, zod_1.z.string().min(1).default("first-party"));
const pixelSourceStringSchema = zod_1.z.preprocess((value) => {
    if (value === null || value === undefined) {
        return undefined;
    }
    if (typeof value === "string") {
        const normalized = value.trim();
        return normalized.length > 0 ? normalized : undefined;
    }
    return value;
}, zod_1.z.string().min(1).default("tracking-pixel"));
const eventBodySchema = zod_1.z
    .object({
    siteKey: zod_1.z.string().min(1, "siteKey is required"),
    route: trimmedStringSchema,
    url: zod_1.z.string().url().optional(),
    eventId: trimmedStringSchema,
    increment: zod_1.z.coerce.number().int().positive().max(1000).default(1),
    source: sourceStringSchema,
    capturedAt: zod_1.z.string().datetime().optional(),
    dateBucket: common_schema_1.dateBucketSchema.optional(),
    dryRun: booleanFromInput.optional(),
    utmSource: trimmedStringSchema,
    utmMedium: trimmedStringSchema,
    utmCampaign: trimmedStringSchema,
    utmTerm: trimmedStringSchema,
    utmContent: trimmedStringSchema,
    utms: zod_1.z.record(zod_1.z.unknown()).optional(),
    metadata: zod_1.z.record(zod_1.z.unknown()).optional(),
})
    .refine((value) => Boolean(value.route || value.url), {
    path: ["route"],
    message: "route or url is required",
});
const trackingPixelQuerySchema = zod_1.z
    .object({
    siteKey: zod_1.z.string().min(1, "siteKey is required"),
    route: trimmedStringSchema,
    sourcePath: trimmedStringSchema,
    url: zod_1.z.string().url().optional(),
    eventId: trimmedStringSchema,
    increment: zod_1.z.coerce.number().int().positive().max(1000).default(1),
    source: pixelSourceStringSchema,
    capturedAt: zod_1.z.string().datetime().optional(),
    dateBucket: common_schema_1.dateBucketSchema.optional(),
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
exports.visitPixelQuerySchema = trackingPixelQuerySchema;
exports.registrationPixelQuerySchema = trackingPixelQuerySchema;
exports.visitEventBodySchema = eventBodySchema;
exports.registrationEventBodySchema = eventBodySchema;
