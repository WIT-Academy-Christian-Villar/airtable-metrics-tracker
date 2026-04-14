import { buildDefaultSiteCatalog } from "./sites.catalog";
import { env } from "./env";
import { sitesConfigSchema } from "../schemas/site.schema";
import type { SiteConfig } from "../types/config";

const loadSites = (): SiteConfig[] => {
  if (!env.sitesConfigJson) {
    return buildDefaultSiteCatalog();
  }

  const parsed = JSON.parse(env.sitesConfigJson) as unknown;

  return sitesConfigSchema.parse(parsed);
};

export const sites = Object.freeze(loadSites());
