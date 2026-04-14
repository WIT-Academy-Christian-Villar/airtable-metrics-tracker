"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRunById = void 0;
const sync_orchestrator_service_1 = require("../services/sync-orchestrator.service");
const errors_1 = require("../utils/errors");
const api_response_1 = require("../utils/api-response");
const getRunById = (req, res) => {
    const runId = typeof req.params.runId === "string" ? req.params.runId : undefined;
    const run = runId ? sync_orchestrator_service_1.syncOrchestratorService.getRun(runId) : undefined;
    if (!run) {
        throw new errors_1.AppError({
            message: `Run ${runId ?? "unknown"} not found`,
            code: "RUN_NOT_FOUND",
            statusCode: 404,
        });
    }
    return (0, api_response_1.sendSuccess)(req, res, {
        message: "Run found",
        data: run,
        runId: run.runId,
    });
};
exports.getRunById = getRunById;
