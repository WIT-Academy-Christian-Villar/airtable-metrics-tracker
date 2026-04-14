"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncRouter = void 0;
const express_1 = require("express");
const sync_controller_1 = require("../controllers/sync.controller");
const validate_request_1 = require("../middleware/validate-request");
const sync_schema_1 = require("../schemas/sync.schema");
exports.syncRouter = (0, express_1.Router)();
exports.syncRouter.post("/sync", (0, validate_request_1.validateRequest)({ body: sync_schema_1.syncRequestBodySchema }), sync_controller_1.syncAllSites);
exports.syncRouter.post("/sync/:siteKey", (0, validate_request_1.validateRequest)({
    params: sync_schema_1.syncSiteParamsSchema,
    body: sync_schema_1.syncRequestBodySchema,
}), sync_controller_1.syncSingleSite);
