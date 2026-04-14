"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runStoreService = exports.RunStoreService = void 0;
const node_crypto_1 = require("node:crypto");
const date_1 = require("../utils/date");
class RunStoreService {
    runs = new Map();
    createSync(input) {
        const run = {
            runId: `run_${(0, node_crypto_1.randomUUID)()}`,
            kind: "sync",
            requestId: input.requestId,
            status: "running",
            trigger: input.trigger,
            dryRun: input.dryRun,
            requestedSiteKeys: input.requestedSiteKeys,
            dateBucket: input.dateBucket,
            startedAt: (0, date_1.nowIso)(),
            summary: {
                totalSites: 0,
                completedSites: 0,
                failedSites: 0,
                totalRawVisits: 0,
                totalRawRegistrations: 0,
                totalNormalized: 0,
                totalConsolidated: 0,
                totalWritten: 0,
                totalCreated: 0,
                totalUpdated: 0,
            },
            results: [],
        };
        this.runs.set(run.runId, run);
        return run;
    }
    createEvent(input) {
        const run = {
            runId: `run_${(0, node_crypto_1.randomUUID)()}`,
            kind: "event",
            requestId: input.requestId,
            status: "queued",
            dryRun: input.dryRun,
            startedAt: (0, date_1.nowIso)(),
            finishedAt: undefined,
            event: {
                siteKey: input.siteKey,
                eventKind: input.eventKind,
                eventId: input.eventId,
            },
            result: undefined,
            error: undefined,
        };
        this.runs.set(run.runId, run);
        return run;
    }
    save(run) {
        this.runs.set(run.runId, run);
        return run;
    }
    get(runId) {
        return this.runs.get(runId);
    }
}
exports.RunStoreService = RunStoreService;
exports.runStoreService = new RunStoreService();
