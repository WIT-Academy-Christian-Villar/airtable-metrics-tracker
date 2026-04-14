import { env } from "../config/env";
import { logger } from "../config/logger";
import { airtableWriterService } from "./airtable/airtable-writer.service";
import { trafficConsolidatorService } from "./consolidation/traffic-consolidator.service";
import { metricsNormalizerService } from "./normalization/metrics-normalizer.service";
import { providerRegistry } from "./provider-registry.service";
import { runStoreService } from "./run-store.service";
import { siteService } from "./site.service";
import type { SyncTrigger } from "../types/provider";
import type {
  OperationRun,
  SiteSyncResult,
  SyncRun,
  SyncRunSummary,
} from "../types/run";
import { nowIso, toDateBucket } from "../utils/date";

export class SyncOrchestratorService {
  public async sync(input: {
    requestId: string;
    siteKeys?: string[];
    dateBucket?: string;
    dryRun?: boolean;
    trigger: SyncTrigger;
  }): Promise<SyncRun> {
    const selectedSites = siteService.resolveSites(input.siteKeys);
    const dryRun = input.dryRun ?? env.airtableDryRunDefault;
    const dateBucket =
      input.dateBucket ?? toDateBucket(new Date(), env.defaultTimezone);
    const run = runStoreService.createSync({
      requestId: input.requestId,
      requestedSiteKeys:
        input.siteKeys && input.siteKeys.length > 0
          ? input.siteKeys
          : selectedSites.map((site) => site.siteKey),
      dateBucket,
      dryRun,
      trigger: input.trigger,
    });
    const runLogger = logger.child({
      requestId: input.requestId,
      runId: run.runId,
      dryRun,
      dateBucket,
    });
    const results: SiteSyncResult[] = [];

    runLogger.info({ siteKeys: run.requestedSiteKeys }, "Starting sync run");

    for (const site of selectedSites) {
      const siteLogger = runLogger.child({ siteKey: site.siteKey });
      const siteStartedAt = nowIso();

      try {
        const visitsProvider = providerRegistry.getVisitsProvider(
          site.providers.visits.key,
        );
        const registrationsProvider = providerRegistry.getRegistrationsProvider(
          site.providers.registrations.key,
        );
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
            providerConfig: visitsProvider.validateConfig(
              site.providers.visits.config,
            ),
            context,
          }),
          registrationsProvider.collect({
            site,
            providerConfig: registrationsProvider.validateConfig(
              site.providers.registrations.config,
            ),
            context,
          }),
        ]);
        const normalizedVisits = metricsNormalizerService.normalizeVisits(
          site,
          rawVisits,
          dateBucket,
        );
        const normalizedRegistrations =
          metricsNormalizerService.normalizeRegistrations(
            site,
            rawRegistrations,
            dateBucket,
          );
        const consolidatedRecords = trafficConsolidatorService.consolidate([
          ...normalizedVisits,
          ...normalizedRegistrations,
        ]);
        const writeResult = await airtableWriterService.write({
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
          normalizedCount:
            normalizedVisits.length + normalizedRegistrations.length,
          consolidatedCount: consolidatedRecords.length,
          writtenCount: writeResult.written,
          createdCount: writeResult.created,
          updatedCount: writeResult.updated,
          dryRun,
          startedAt: siteStartedAt,
          finishedAt: nowIso(),
          warnings: [],
        });

        siteLogger.info(
          {
            rawVisits: rawVisits.length,
            rawRegistrations: rawRegistrations.length,
            consolidated: consolidatedRecords.length,
            written: writeResult.written,
          },
          "Site sync completed",
        );
      } catch (error) {
        const normalizedError =
          error instanceof Error
            ? {
                message: error.message,
                code:
                  "code" in error && typeof error.code === "string"
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
          finishedAt: nowIso(),
          warnings: [],
          error: normalizedError,
        });

        siteLogger.error({ error: normalizedError }, "Site sync failed");
      }
    }

    run.results = results;
    run.summary = this.buildSummary(results);
    run.finishedAt = nowIso();
    run.status = results.some((result) => result.status === "failed")
      ? "failed"
      : "completed";

    runStoreService.save(run);
    runLogger.info({ status: run.status, summary: run.summary }, "Sync run completed");

    return run;
  }

  public getRun(runId: string): OperationRun | undefined {
    return runStoreService.get(runId);
  }

  private buildSummary(results: SiteSyncResult[]): SyncRunSummary {
    return results.reduce<SyncRunSummary>(
      (summary, result) => ({
        totalSites: summary.totalSites + 1,
        completedSites:
          summary.completedSites + (result.status === "completed" ? 1 : 0),
        failedSites: summary.failedSites + (result.status === "failed" ? 1 : 0),
        totalRawVisits: summary.totalRawVisits + result.rawCounts.visits,
        totalRawRegistrations:
          summary.totalRawRegistrations + result.rawCounts.registrations,
        totalNormalized: summary.totalNormalized + result.normalizedCount,
        totalConsolidated:
          summary.totalConsolidated + result.consolidatedCount,
        totalWritten: summary.totalWritten + result.writtenCount,
        totalCreated: summary.totalCreated + result.createdCount,
        totalUpdated: summary.totalUpdated + result.updatedCount,
      }),
      {
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
    );
  }
}

export const syncOrchestratorService = new SyncOrchestratorService();
