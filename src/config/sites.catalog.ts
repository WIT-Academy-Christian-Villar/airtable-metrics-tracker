import { siteConfigSchema } from "../schemas/site.schema";
import type { SiteConfig } from "../types/config";

const buildAuthHeaders = (token?: string): Record<string, string> =>
  token ? { Authorization: `Bearer ${token}` } : {};

const parseCsv = (value: string | undefined): string[] =>
  value
    ?.split(",")
    .map((item) => item.trim())
    .filter(Boolean) ?? [];

const hasAllValues = (
  values: Array<string | undefined>,
): values is string[] => values.every((value) => Boolean(value));

const buildSiteFromEnv = (options: {
  siteKey: string;
  displayName: string;
  baseUrl: string | undefined;
  allowedHosts: string[];
  visitsUrl: string | undefined;
  visitsToken: string | undefined;
  registrationsUrl: string | undefined;
  registrationsToken: string | undefined;
  airtableBaseId: string | undefined;
  airtableTableId: string | undefined;
  airtableFieldIds: {
    siteKey: string | undefined;
    route: string | undefined;
    dateBucket: string | undefined;
    visits: string | undefined;
    registrations: string | undefined;
    utmSource: string | undefined;
    utmMedium: string | undefined;
    utmCampaign: string | undefined;
    utmTerm: string | undefined;
    utmContent: string | undefined;
    sources: string | undefined;
    capturedAt: string | undefined;
    syncKey: string | undefined;
  };
}): SiteConfig | null => {
  const fieldIds = Object.values(options.airtableFieldIds);

  if (
    !options.airtableBaseId ||
    !options.airtableTableId ||
    !hasAllValues(fieldIds)
  ) {
    return null;
  }

  return siteConfigSchema.parse({
    siteKey: options.siteKey,
    displayName: options.displayName,
    enabled: true,
    providers: {
      visits: options.visitsUrl
        ? {
            key: "json-api-visits",
            config: {
              endpoint: options.visitsUrl,
              headers: buildAuthHeaders(options.visitsToken),
              dataPath: "data",
            },
          }
        : {
            key: "noop-visits",
            config: {},
          },
      registrations: options.registrationsUrl
        ? {
            key: "json-api-registrations",
            config: {
              endpoint: options.registrationsUrl,
              headers: buildAuthHeaders(options.registrationsToken),
              dataPath: "data",
            },
          }
        : {
            key: "noop-registrations",
            config: {},
          },
    },
    routeRules: {
      ...(options.baseUrl ? { baseUrl: options.baseUrl } : {}),
      allowedHosts: options.allowedHosts,
      fallbackRoute: "/",
      stripTrailingSlash: true,
    },
    utmMapping: {
      source: ["utm_source", "source"],
      medium: ["utm_medium", "medium"],
      campaign: ["utm_campaign", "campaign"],
      term: ["utm_term", "term"],
      content: ["utm_content", "content"],
    },
    airtable: {
      baseId: options.airtableBaseId,
      tableId: options.airtableTableId,
      fieldIds: {
        siteKey: options.airtableFieldIds.siteKey,
        route: options.airtableFieldIds.route,
        dateBucket: options.airtableFieldIds.dateBucket,
        visits: options.airtableFieldIds.visits,
        registrations: options.airtableFieldIds.registrations,
        utmSource: options.airtableFieldIds.utmSource,
        utmMedium: options.airtableFieldIds.utmMedium,
        utmCampaign: options.airtableFieldIds.utmCampaign,
        utmTerm: options.airtableFieldIds.utmTerm,
        utmContent: options.airtableFieldIds.utmContent,
        sources: options.airtableFieldIds.sources,
        capturedAt: options.airtableFieldIds.capturedAt,
        syncKey: options.airtableFieldIds.syncKey,
      },
      upsertFieldIds: [options.airtableFieldIds.syncKey],
    },
  });
};

export const buildDefaultSiteCatalog = (): SiteConfig[] => {
  const sites = [
    buildSiteFromEnv({
      siteKey: process.env.MAIN_SITE_KEY ?? "marketing-main",
      displayName: process.env.MAIN_SITE_DISPLAY_NAME ?? "Marketing Main",
      baseUrl: process.env.MAIN_SITE_BASE_URL,
      allowedHosts: parseCsv(process.env.MAIN_SITE_ALLOWED_HOSTS),
      visitsUrl: process.env.MAIN_SITE_VISITS_URL,
      visitsToken: process.env.MAIN_SITE_VISITS_TOKEN,
      registrationsUrl: process.env.MAIN_SITE_REGISTRATIONS_URL,
      registrationsToken: process.env.MAIN_SITE_REGISTRATIONS_TOKEN,
      airtableBaseId: process.env.MAIN_SITE_AIRTABLE_BASE_ID,
      airtableTableId: process.env.MAIN_SITE_AIRTABLE_TABLE_ID,
      airtableFieldIds: {
        siteKey: process.env.MAIN_SITE_AIRTABLE_FIELD_SITE_KEY,
        route: process.env.MAIN_SITE_AIRTABLE_FIELD_ROUTE,
        dateBucket: process.env.MAIN_SITE_AIRTABLE_FIELD_DATE_BUCKET,
        visits: process.env.MAIN_SITE_AIRTABLE_FIELD_VISITS,
        registrations: process.env.MAIN_SITE_AIRTABLE_FIELD_REGISTRATIONS,
        utmSource: process.env.MAIN_SITE_AIRTABLE_FIELD_UTM_SOURCE,
        utmMedium: process.env.MAIN_SITE_AIRTABLE_FIELD_UTM_MEDIUM,
        utmCampaign: process.env.MAIN_SITE_AIRTABLE_FIELD_UTM_CAMPAIGN,
        utmTerm: process.env.MAIN_SITE_AIRTABLE_FIELD_UTM_TERM,
        utmContent: process.env.MAIN_SITE_AIRTABLE_FIELD_UTM_CONTENT,
        sources: process.env.MAIN_SITE_AIRTABLE_FIELD_SOURCES,
        capturedAt: process.env.MAIN_SITE_AIRTABLE_FIELD_CAPTURED_AT,
        syncKey: process.env.MAIN_SITE_AIRTABLE_FIELD_SYNC_KEY,
      },
    }),
    buildSiteFromEnv({
      siteKey: process.env.PRICING_SITE_KEY ?? "pricing-site",
      displayName: process.env.PRICING_SITE_DISPLAY_NAME ?? "Pricing Site",
      baseUrl: process.env.PRICING_SITE_BASE_URL,
      allowedHosts: parseCsv(process.env.PRICING_SITE_ALLOWED_HOSTS),
      visitsUrl: process.env.PRICING_SITE_VISITS_URL,
      visitsToken: process.env.PRICING_SITE_VISITS_TOKEN,
      registrationsUrl: process.env.PRICING_SITE_REGISTRATIONS_URL,
      registrationsToken: process.env.PRICING_SITE_REGISTRATIONS_TOKEN,
      airtableBaseId: process.env.PRICING_SITE_AIRTABLE_BASE_ID,
      airtableTableId: process.env.PRICING_SITE_AIRTABLE_TABLE_ID,
      airtableFieldIds: {
        siteKey: process.env.PRICING_SITE_AIRTABLE_FIELD_SITE_KEY,
        route: process.env.PRICING_SITE_AIRTABLE_FIELD_ROUTE,
        dateBucket: process.env.PRICING_SITE_AIRTABLE_FIELD_DATE_BUCKET,
        visits: process.env.PRICING_SITE_AIRTABLE_FIELD_VISITS,
        registrations: process.env.PRICING_SITE_AIRTABLE_FIELD_REGISTRATIONS,
        utmSource: process.env.PRICING_SITE_AIRTABLE_FIELD_UTM_SOURCE,
        utmMedium: process.env.PRICING_SITE_AIRTABLE_FIELD_UTM_MEDIUM,
        utmCampaign: process.env.PRICING_SITE_AIRTABLE_FIELD_UTM_CAMPAIGN,
        utmTerm: process.env.PRICING_SITE_AIRTABLE_FIELD_UTM_TERM,
        utmContent: process.env.PRICING_SITE_AIRTABLE_FIELD_UTM_CONTENT,
        sources: process.env.PRICING_SITE_AIRTABLE_FIELD_SOURCES,
        capturedAt: process.env.PRICING_SITE_AIRTABLE_FIELD_CAPTURED_AT,
        syncKey: process.env.PRICING_SITE_AIRTABLE_FIELD_SYNC_KEY,
      },
    }),
  ];

  return sites.filter((site): site is SiteConfig => Boolean(site));
};
