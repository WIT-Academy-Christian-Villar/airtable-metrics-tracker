"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runIdParamsSchema = exports.siteKeyParamsSchema = exports.dateBucketSchema = void 0;
const zod_1 = require("zod");
exports.dateBucketSchema = zod_1.z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "dateBucket must use YYYY-MM-DD");
exports.siteKeyParamsSchema = zod_1.z.object({
    siteKey: zod_1.z.string().min(1, "siteKey is required"),
});
exports.runIdParamsSchema = zod_1.z.object({
    runId: zod_1.z.string().min(1, "runId is required"),
});
