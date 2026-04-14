"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncSiteParamsSchema = exports.syncRequestBodySchema = void 0;
const zod_1 = require("zod");
const common_schema_1 = require("./common.schema");
const booleanInputSchema = zod_1.z.preprocess((value) => {
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
exports.syncRequestBodySchema = zod_1.z.object({
    siteKeys: zod_1.z.array(zod_1.z.string().min(1)).min(1).optional(),
    dateBucket: common_schema_1.dateBucketSchema.optional(),
    dryRun: booleanInputSchema.optional(),
    trigger: zod_1.z.enum(["manual", "scheduled", "api"]).default("manual"),
});
exports.syncSiteParamsSchema = common_schema_1.siteKeyParamsSchema;
