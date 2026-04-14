"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listSites = void 0;
const site_service_1 = require("../services/site.service");
const api_response_1 = require("../utils/api-response");
const listSites = (req, res) => (0, api_response_1.sendSuccess)(req, res, {
    message: "Configured sites",
    data: {
        items: site_service_1.siteService.listSummaries(),
        count: site_service_1.siteService.list().length,
    },
});
exports.listSites = listSites;
