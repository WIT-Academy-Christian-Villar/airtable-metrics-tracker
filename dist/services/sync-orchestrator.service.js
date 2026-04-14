"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncOrchestratorService = exports.SyncOrchestratorService = void 0;
const env_1 = require("../config/env");
const logger_1 = require("../config/logger");
const airtable_writer_service_1 = require("./airtable/airtable-writer.service");
const traffic_consolidator_service_1 = require("./consolidation/traffic-consolidator.service");
const metrics_normalizer_service_1 = require("./normalization/metrics-normalizer.service");
const provider_registry_service_1 = require("./provider-registry.service");
const run_store_service_1 = require("./run-store.service");
const site_service_1 = require("./site.service");
const date_1 = require("../utils/date");
class SyncOrchestratorService {
    async sync(input) {
        const selectedSites = site_service_1.siteService.resolveSites(input.siteKeys);
        const dryRun = input.dryRun ?? env_1.env.airtableDryRunDefault;
        const dateBucket = input.dateBucket ?? (0, date_1.toDateBucket)(new Date(), env_1.env.defaultTimezone);
        const run = run_store_service_1.runStoreService.createSync({
            requestId: input.requestId,
            requestedSiteKeys: input.siteKeys && input.siteKeys.length > 0
                ? input.siteKeys
                : selectedSites.map((site) => site.siteKey),
            dateBucket,
            dryRun,
            trigger: input.trigger,
        });
        const runLogger = logger_1.logger.child({
            requestId: input.requestId,
            runId: run.runId,
            dryRun,
            dateBucket,
        });
        const results = [];
        runLogger.info({ siteKeys: run.requestedSiteKeys }, "Starting sync run");
        for (const site of selectedSites) {
            const siteLogger = runLogger.child({ siteKey: site.siteKey });
            const siteStartedAt = (0, date_1.nowIso)();
            try {
                const visitsProvider = provider_registry_service_1.providerRegistry.getVisitsProvider(site.providers.visits.key);
                const registrationsProvider = provider_registry_service_1.providerRegistry.getRegistrationsProvider(site.providers.registrations.key);
                const context = {
                    requestId: input.requestId,
                    runId: run.runId,
                    logger: siteLogger,
                    window: {
                        dateBucket,
                        requestedAt: run.startedAt,
                        dryRun,
                        trigger: input.trigger,
                    },
                };
                const [rawVisits, rawRegistrations] = await Promise.all([
                    visitsProvider.collect({
                        site,
                        providerConfig: visitsProvider.validateConfig(site.providers.visits.config),
                        context,
                    }),
                    registrationsProvider.collect({
                        site,
                        providerConfig: registrationsProvider.validateConfig(site.providers.registrations.config),
                        context,
                    }),
                ]);
                const normalizedVisits = metrics_normalizer_service_1.metricsNormalizerService.normalizeVisits(site, rawVisits, dateBucket);
                const normalizedRegistrations = metrics_normalizer_service_1.metricsNormalizerService.normalizeRegistrations(site, rawRegistrations, dateBucket);
                const consolidatedRecords = traffic_consolidator_service_1.trafficConsolidatorService.consolidate([
                    ...normalizedVisits,
                    ...normalizedRegistrations,
                ]);
                const writeResult = await airtable_writer_service_1.airtableWriterService.write({
                    site,
                    records: consolidatedRecords,
                    context,
                    dryRun,
                });
                results.push({
                    siteKey: site.siteKey,
                    status: "completed",
                    providerKeys: {
                        visits: site.providers.visits.key,
                        registrations: site.providers.registrations.key,
                    },
                    rawCounts: {
                        visits: rawVisits.length,
                        registrations: rawRegistrations.length,
                    },
                    normalizedCount: normalizedVisits.length + normalizedRegistrations.length,
                    consolidatedCount: consolidatedRecords.length,
                    writtenCount: writeResult.written,
                    createdCount: writeResult.created,
                    updatedCount: writeResult.updated,
                    dryRun,
                    startedAt: siteStartedAt,
                    finishedAt: (0, date_1.nowIso)(),
                    warnings: [],
                });
                siteLogger.info({
                    rawVisits: rawVisits.length,
                    rawRegistrations: rawRegistrations.length,
                    consolidated: consolidatedRecords.length,
                    written: writeResult.written,
                }, "Site sync completed");
            }
            catch (error) {
                const normalizedError = error instanceof Error
                    ? {
                        message: error.message,
                        code: "code" in error && typeof error.code === "string"
                            ? error.code
                            : "SYNC_SITE_FAILED",
                        details: "details" in error ? error.details : undefined,
                    }
                    : {
                        message: "Unknown error",
                        code: "SYNC_SITE_FAILED",
                        details: error,
                    };
                results.push({
                    siteKey: site.siteKey,
                    status: "failed",
                    providerKeys: {
                        visits: site.providers.visits.key,
                        registrations: site.providers.registrations.key,
                    },
                    rawCounts: {
                        visits: 0,
                        registrations: 0,
                    },
                    normalizedCount: 0,
                    consolidatedCount: 0,
                    writtenCount: 0,
                    createdCount: 0,
                    updatedCount: 0,
                    dryRun,
                    startedAt: siteStartedAt,
                    finishedAt: (0, date_1.nowIso)(),
                    warnings: [],
                    error: normalizedError,
                });
                siteLogger.error({ error: normalizedError }, "Site sync failed");
            }
        }
        run.results = results;
        run.summary = this.buildSummary(results);
        run.finishedAt = (0, date_1.nowIso)();
        run.status = results.some((result) => result.status === "failed")
            ? "failed"
            : "completed";
        run_store_service_1.runStoreService.save(run);
        runLogger.info({ status: run.status, summary: run.summary }, "Sync run completed");
        return run;
    }
    getRun(runId) {
        return run_store_service_1.runStoreService.get(runId);
    }
    buildSummary(results) {
        return results.reduce((summary, result) => ({
            totalSites: summary.totalSites + 1,
            completedSites: summary.completedSites + (result.status === "completed" ? 1 : 0),
            failedSites: summary.failedSites + (result.status === "failed" ? 1 : 0),
            totalRawVisits: summary.totalRawVisits + result.rawCounts.visits,
            totalRawRegistrations: summary.totalRawRegistrations + result.rawCounts.registrations,
            totalNormalized: summary.totalNormalized + result.normalizedCount,
            totalConsolidated: summary.totalConsolidated + result.consolidatedCount,
            totalWritten: summary.totalWritten + result.writtenCount,
            totalCreated: summary.totalCreated + result.createdCount,
            totalUpdated: summary.totalUpdated + result.updatedCount,
        }), {
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
        });
    }
}
exports.SyncOrchestratorService = SyncOrchestratorService;
exports.syncOrchestratorService = new SyncOrchestratorService();
