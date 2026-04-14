"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.siteService = exports.SiteService = void 0;
const sites_1 = require("../config/sites");
const errors_1 = require("../utils/errors");
class SiteService {
    siteMap = new Map(sites_1.sites.map((site) => [site.siteKey, site]));
    list() {
        return [...this.siteMap.values()];
    }
    listSummaries() {
        return this.list().map((site) => ({
            siteKey: site.siteKey,
            displayName: site.displayName,
            enabled: site.enabled,
            providers: {
                visits: site.providers.visits.key,
                registrations: site.providers.registrations.key,
            },
            routeRules: site.routeRules,
            airtable: {
                baseId: site.airtable.baseId,
                tableName: site.airtable.tableName,
                upsertFields: site.airtable.upsertFields,
            },
        }));
    }
    resolveSite(siteKey) {
        const site = this.siteMap.get(siteKey);
        if (!site || !site.enabled) {
            throw new errors_1.AppError({
                message: `Site ${siteKey} is not configured`,
                code: "SITE_NOT_FOUND",
                statusCode: 404,
            });
        }
        return site;
    }
    resolveSites(siteKeys) {
        if (!siteKeys || siteKeys.length === 0) {
            const enabledSites = this.list().filter((site) => site.enabled);
            if (enabledSites.length === 0) {
                throw new errors_1.AppError({
                    message: "No enabled sites are configured",
                    code: "NO_SITES_CONFIGURED",
                    statusCode: 400,
                });
            }
            return enabledSites;
        }
        return siteKeys.map((siteKey) => this.resolveSite(siteKey));
    }
}
exports.SiteService = SiteService;
exports.siteService = new SiteService();
