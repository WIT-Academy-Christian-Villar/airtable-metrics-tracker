import { sites } from "../config/sites";
import type { SiteConfig } from "../types/config";
import { AppError } from "../utils/errors";

export class SiteService {
  private readonly siteMap = new Map(sites.map((site) => [site.siteKey, site]));

  public list(): SiteConfig[] {
    return [...this.siteMap.values()];
  }

  public listSummaries(): Array<Record<string, unknown>> {
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

  public resolveSite(siteKey: string): SiteConfig {
    const site = this.siteMap.get(siteKey);

    if (!site || !site.enabled) {
      throw new AppError({
        message: `Site ${siteKey} is not configured`,
        code: "SITE_NOT_FOUND",
        statusCode: 404,
      });
    }

    return site;
  }

  public resolveSites(siteKeys?: string[]): SiteConfig[] {
    if (!siteKeys || siteKeys.length === 0) {
      const enabledSites = this.list().filter((site) => site.enabled);

      if (enabledSites.length === 0) {
        throw new AppError({
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

export const siteService = new SiteService();
