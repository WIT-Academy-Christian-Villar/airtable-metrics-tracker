"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildDefaultSiteCatalog = void 0;
const site_schema_1 = require("../schemas/site.schema");
const buildAuthHeaders = (token) => token ? { Authorization: `Bearer ${token}` } : {};
const buildSiteFromEnv = (options) => {
    if (!options.visitsUrl || !options.airtableBaseId || !options.airtableTable) {
        return null;
    }
    return site_schema_1.siteConfigSchema.parse({
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
const buildDefaultSiteCatalog = () => {
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
    return sites.filter((site) => Boolean(site));
};
exports.buildDefaultSiteCatalog = buildDefaultSiteCatalog;
