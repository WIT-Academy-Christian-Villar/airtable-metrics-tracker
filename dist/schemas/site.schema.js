"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sitesConfigSchema = exports.siteConfigSchema = void 0;
const zod_1 = require("zod");
const constants_1 = require("../config/constants");
const providerBindingSchema = zod_1.z.object({
    key: zod_1.z.string().min(1),
    config: zod_1.z.unknown().default({}),
});
const routeRulesSchema = zod_1.z.object({
    baseUrl: zod_1.z.string().url().optional(),
    allowedHosts: zod_1.z.array(zod_1.z.string()).default([]),
    fallbackRoute: zod_1.z.string().default("/"),
    stripTrailingSlash: zod_1.z.boolean().default(true),
});
const utmMappingSchema = zod_1.z.object({
    source: zod_1.z.array(zod_1.z.string()).default(["utm_source", "source"]),
    medium: zod_1.z.array(zod_1.z.string()).default(["utm_medium", "medium"]),
    campaign: zod_1.z.array(zod_1.z.string()).default(["utm_campaign", "campaign"]),
    term: zod_1.z.array(zod_1.z.string()).default(["utm_term", "term"]),
    content: zod_1.z.array(zod_1.z.string()).default(["utm_content", "content"]),
});
const airtableFieldMappingSchema = zod_1.z.object({
    siteKey: zod_1.z.string().default(constants_1.DEFAULT_AIRTABLE_FIELD_MAPPING.siteKey),
    route: zod_1.z.string().default(constants_1.DEFAULT_AIRTABLE_FIELD_MAPPING.route),
    dateBucket: zod_1.z.string().default(constants_1.DEFAULT_AIRTABLE_FIELD_MAPPING.dateBucket),
    visits: zod_1.z.string().default(constants_1.DEFAULT_AIRTABLE_FIELD_MAPPING.visits),
    registrations: zod_1.z
        .string()
        .default(constants_1.DEFAULT_AIRTABLE_FIELD_MAPPING.registrations),
    utmSource: zod_1.z.string().default(constants_1.DEFAULT_AIRTABLE_FIELD_MAPPING.utmSource),
    utmMedium: zod_1.z.string().default(constants_1.DEFAULT_AIRTABLE_FIELD_MAPPING.utmMedium),
    utmCampaign: zod_1.z.string().default(constants_1.DEFAULT_AIRTABLE_FIELD_MAPPING.utmCampaign),
    utmTerm: zod_1.z.string().default(constants_1.DEFAULT_AIRTABLE_FIELD_MAPPING.utmTerm),
    utmContent: zod_1.z.string().default(constants_1.DEFAULT_AIRTABLE_FIELD_MAPPING.utmContent),
    sources: zod_1.z.string().default(constants_1.DEFAULT_AIRTABLE_FIELD_MAPPING.sources),
    capturedAt: zod_1.z.string().default(constants_1.DEFAULT_AIRTABLE_FIELD_MAPPING.capturedAt),
    syncKey: zod_1.z.string().default(constants_1.DEFAULT_AIRTABLE_FIELD_MAPPING.syncKey),
});
const airtableSchema = zod_1.z.object({
    baseId: zod_1.z.string().min(1),
    tableName: zod_1.z.string().min(1),
    fieldMapping: airtableFieldMappingSchema.default(constants_1.DEFAULT_AIRTABLE_FIELD_MAPPING),
    upsertFields: zod_1.z.array(zod_1.z.string()).min(1).default(["Sync Key"]),
});
exports.siteConfigSchema = zod_1.z.object({
    siteKey: zod_1.z.string().min(1),
    displayName: zod_1.z.string().min(1),
    enabled: zod_1.z.boolean().default(true),
    providers: zod_1.z.object({
        visits: providerBindingSchema,
        registrations: providerBindingSchema,
    }),
    routeRules: routeRulesSchema.default({
        allowedHosts: [],
        fallbackRoute: "/",
        stripTrailingSlash: true,
    }),
    utmMapping: utmMappingSchema.default({
        source: ["utm_source", "source"],
        medium: ["utm_medium", "medium"],
        campaign: ["utm_campaign", "campaign"],
        term: ["utm_term", "term"],
        content: ["utm_content", "content"],
    }),
    airtable: airtableSchema,
});
exports.sitesConfigSchema = zod_1.z.array(exports.siteConfigSchema);
