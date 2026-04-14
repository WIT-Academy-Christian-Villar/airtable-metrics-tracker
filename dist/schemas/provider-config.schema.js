"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jsonApiProviderConfigSchema = exports.jsonScalarSchema = void 0;
const zod_1 = require("zod");
exports.jsonScalarSchema = zod_1.z.union([
    zod_1.z.string(),
    zod_1.z.number(),
    zod_1.z.boolean(),
    zod_1.z.null(),
]);
exports.jsonApiProviderConfigSchema = zod_1.z.object({
    endpoint: zod_1.z.string().url(),
    method: zod_1.z.enum(["GET", "POST"]).default("GET"),
    headers: zod_1.z.record(zod_1.z.string()).default({}),
    query: zod_1.z.record(zod_1.z.string()).default({}),
    body: zod_1.z.record(exports.jsonScalarSchema).optional(),
    dataPath: zod_1.z.string().optional(),
    timeoutMs: zod_1.z.number().int().positive().optional(),
});
