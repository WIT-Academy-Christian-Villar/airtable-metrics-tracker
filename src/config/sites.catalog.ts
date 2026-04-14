import { siteConfigSchema } from "../schemas/site.schema";
import type { SiteConfig } from "../types/config";

const buildAuthHeaders = (token?: string): Record<string, string> =>
  token ? { Authorization: `Bearer ${token}` } : {};

const buildSiteFromEnv = (options: {
  siteKey: string;
  displayName: string;
  visitsUrl: string | undefined;
  visitsToken: string | undefined;
  registrationsUrl: string | undefined;
  registrationsToken: string | undefined;
  airtableBaseId: string | undefined;
  airtableTable: string | undefined;
}): SiteConfig | null => {
  if (!options.visitsUrl || !options.airtableBaseId || !options.airtableTable) {
    return null;
  }

  return siteConfigSchema.parse({
    siteKey: options.siteKey,
    displayName: options.displayName,
    enabled: true,
    providers: {
      visits: {
        key: "json-api-visits",
        config: {
          endpoint: options.visitsUrl,
          headers: buildAuthHeaders(options.visitsToken),
          dataPath: "data",
        },
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
      tableName: options.airtableTable,
    },
  });
};

export const buildDefaultSiteCatalog = (): SiteConfig[] => {
  const sites = [
    buildSiteFromEnv({
      siteKey: "marketing-main",
      displayName: "Marketing Main",
      visitsUrl: process.env.MAIN_SITE_VISITS_URL,
      visitsToken: process.env.MAIN_SITE_VISITS_TOKEN,
      registrationsUrl: process.env.MAIN_SITE_REGISTRATIONS_URL,
      registrationsToken: process.env.MAIN_SITE_REGISTRATIONS_TOKEN,
      airtableBaseId: process.env.MAIN_SITE_AIRTABLE_BASE_ID,
      airtableTable: process.env.MAIN_SITE_AIRTABLE_TABLE,
    }),
    buildSiteFromEnv({
      siteKey: "pricing-site",
      displayName: "Pricing Site",
      visitsUrl: process.env.PRICING_SITE_VISITS_URL,
      visitsToken: process.env.PRICING_SITE_VISITS_TOKEN,
      registrationsUrl: process.env.PRICING_SITE_REGISTRATIONS_URL,
      registrationsToken: process.env.PRICING_SITE_REGISTRATIONS_TOKEN,
      airtableBaseId: process.env.PRICING_SITE_AIRTABLE_BASE_ID,
      airtableTable: process.env.PRICING_SITE_AIRTABLE_TABLE,
    }),
  ];

  return sites.filter((site): site is SiteConfig => Boolean(site));
};
