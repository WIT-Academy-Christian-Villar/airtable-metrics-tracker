import { z } from "zod";

import { DEFAULT_AIRTABLE_FIELD_MAPPING } from "../config/constants";

const providerBindingSchema = z.object({
  key: z.string().min(1),
  config: z.unknown().default({}),
});

const routeRulesSchema = z.object({
  baseUrl: z.string().url().optional(),
  allowedHosts: z.array(z.string()).default([]),
  fallbackRoute: z.string().default("/"),
  stripTrailingSlash: z.boolean().default(true),
});

const utmMappingSchema = z.object({
  source: z.array(z.string()).default(["utm_source", "source"]),
  medium: z.array(z.string()).default(["utm_medium", "medium"]),
  campaign: z.array(z.string()).default(["utm_campaign", "campaign"]),
  term: z.array(z.string()).default(["utm_term", "term"]),
  content: z.array(z.string()).default(["utm_content", "content"]),
});

const airtableFieldMappingSchema = z.object({
  siteKey: z.string().default(DEFAULT_AIRTABLE_FIELD_MAPPING.siteKey),
  route: z.string().default(DEFAULT_AIRTABLE_FIELD_MAPPING.route),
  dateBucket: z.string().default(DEFAULT_AIRTABLE_FIELD_MAPPING.dateBucket),
  visits: z.string().default(DEFAULT_AIRTABLE_FIELD_MAPPING.visits),
  registrations: z
    .string()
    .default(DEFAULT_AIRTABLE_FIELD_MAPPING.registrations),
  utmSource: z.string().default(DEFAULT_AIRTABLE_FIELD_MAPPING.utmSource),
  utmMedium: z.string().default(DEFAULT_AIRTABLE_FIELD_MAPPING.utmMedium),
  utmCampaign: z.string().default(DEFAULT_AIRTABLE_FIELD_MAPPING.utmCampaign),
  utmTerm: z.string().default(DEFAULT_AIRTABLE_FIELD_MAPPING.utmTerm),
  utmContent: z.string().default(DEFAULT_AIRTABLE_FIELD_MAPPING.utmContent),
  sources: z.string().default(DEFAULT_AIRTABLE_FIELD_MAPPING.sources),
  capturedAt: z.string().default(DEFAULT_AIRTABLE_FIELD_MAPPING.capturedAt),
  syncKey: z.string().default(DEFAULT_AIRTABLE_FIELD_MAPPING.syncKey),
});

const airtableSchema = z.object({
  baseId: z.string().min(1),
  tableName: z.string().min(1),
  fieldMapping: airtableFieldMappingSchema.default(DEFAULT_AIRTABLE_FIELD_MAPPING),
  upsertFields: z.array(z.string()).min(1).default(["Sync Key"]),
});

export const siteConfigSchema = z.object({
  siteKey: z.string().min(1),
  displayName: z.string().min(1),
  enabled: z.boolean().default(true),
  providers: z.object({
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

export const sitesConfigSchema = z.array(siteConfigSchema);
