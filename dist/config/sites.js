"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sites = void 0;
const sites_catalog_1 = require("./sites.catalog");
const env_1 = require("./env");
const site_schema_1 = require("../schemas/site.schema");
const loadSites = () => {
    if (!env_1.env.sitesConfigJson) {
        return (0, sites_catalog_1.buildDefaultSiteCatalog)();
    }
    const parsed = JSON.parse(env_1.env.sitesConfigJson);
    return site_schema_1.sitesConfigSchema.parse(parsed);
};
exports.sites = Object.freeze(loadSites());
