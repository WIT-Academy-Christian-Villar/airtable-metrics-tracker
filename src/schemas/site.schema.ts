import { z } from "zod";

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

const airtableFieldIdsSchema = z.object({
  siteKey: z.string().min(1),
  route: z.string().min(1),
  dateBucket: z.string().min(1),
  visits: z.string().min(1),
  registrations: z.string().min(1),
  utmSource: z.string().min(1),
  utmMedium: z.string().min(1),
  utmCampaign: z.string().min(1),
  utmTerm: z.string().min(1),
  utmContent: z.string().min(1),
  sources: z.string().min(1),
  capturedAt: z.string().min(1),
  syncKey: z.string().min(1),
});

const airtableSchema = z
  .object({
    baseId: z.string().min(1),
    tableId: z.string().min(1),
    fieldIds: airtableFieldIdsSchema,
    upsertFieldIds: z.array(z.string()).min(1).optional(),
  })
  .transform((value) => ({
    ...value,
    upsertFieldIds: value.upsertFieldIds ?? [value.fieldIds.syncKey],
  }));

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
