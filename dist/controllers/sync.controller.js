"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncSingleSite = exports.syncAllSites = void 0;
const sync_orchestrator_service_1 = require("../services/sync-orchestrator.service");
const api_response_1 = require("../utils/api-response");
const syncAllSites = async (req, res) => {
    const run = await sync_orchestrator_service_1.syncOrchestratorService.sync({
        requestId: req.requestId,
        siteKeys: req.body.siteKeys,
        dateBucket: req.body.dateBucket,
        dryRun: req.body.dryRun,
        trigger: req.body.trigger,
    });
    return (0, api_response_1.sendSuccess)(req, res, {
        statusCode: 202,
        message: "Sync run completed",
        data: run,
        runId: run.runId,
    });
};
exports.syncAllSites = syncAllSites;
const syncSingleSite = async (req, res) => {
    const siteKey = typeof req.params.siteKey === "string" ? req.params.siteKey : undefined;
    const run = await sync_orchestrator_service_1.syncOrchestratorService.sync({
        requestId: req.requestId,
        siteKeys: siteKey ? [siteKey] : [],
        dateBucket: req.body.dateBucket,
        dryRun: req.body.dryRun,
        trigger: req.body.trigger,
    });
    return (0, api_response_1.sendSuccess)(req, res, {
        statusCode: 202,
        message: `Sync run completed for ${siteKey ?? "unknown"}`,
        data: run,
        runId: run.runId,
    });
};
exports.syncSingleSite = syncSingleSite;
