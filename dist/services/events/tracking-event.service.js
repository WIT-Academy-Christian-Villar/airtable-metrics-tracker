"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trackingEventService = exports.TrackingEventService = void 0;
const env_1 = require("../../config/env");
const logger_1 = require("../../config/logger");
const airtable_increment_service_1 = require("../airtable/airtable-increment.service");
const event_normalizer_service_1 = require("../normalization/event-normalizer.service");
const keyed_serial_queue_service_1 = require("../queue/keyed-serial-queue.service");
const run_store_service_1 = require("../run-store.service");
const site_service_1 = require("../site.service");
const date_1 = require("../../utils/date");
const event_deduplication_service_1 = require("./event-deduplication.service");
const buildDeduplicationKey = (event) => [event.siteKey, event.kind, event.syncKey, event.eventId].join("::");
class TrackingEventService {
    async ingest(input) {
        const site = site_service_1.siteService.resolveSite(input.payload.siteKey);
        const normalizedEvent = event_normalizer_service_1.eventNormalizerService.normalize(site, input.payload);
        const dryRun = input.dryRun ?? env_1.env.airtableDryRunDefault;
        const run = run_store_service_1.runStoreService.createEvent({
            requestId: input.requestId,
            siteKey: site.siteKey,
            eventKind: normalizedEvent.kind,
            eventId: normalizedEvent.eventId,
            dryRun,
        });
        const eventLogger = logger_1.logger.child({
            requestId: input.requestId,
            runId: run.runId,
            siteKey: site.siteKey,
            syncKey: normalizedEvent.syncKey,
            eventKind: normalizedEvent.kind,
        });
        run.status = "processing";
        run_store_service_1.runStoreService.save(run);
        try {
            const result = await keyed_serial_queue_service_1.keyedSerialQueueService.enqueue(normalizedEvent.syncKey, async () => {
                const deduplicationKey = normalizedEvent.eventId
                    ? buildDeduplicationKey({
                        siteKey: site.siteKey,
                        kind: normalizedEvent.kind,
                        eventId: normalizedEvent.eventId,
                        syncKey: normalizedEvent.syncKey,
                    })
                    : undefined;
                if (deduplicationKey &&
                    event_deduplication_service_1.eventDeduplicationService.hasSeen(deduplicationKey)) {
                    return {
                        siteKey: site.siteKey,
                        route: normalizedEvent.route,
                        dateBucket: normalizedEvent.dateBucket,
                        syncKey: normalizedEvent.syncKey,
                        eventKind: normalizedEvent.kind,
                        eventId: normalizedEvent.eventId,
                        source: normalizedEvent.source,
                        action: "deduplicated",
                        deltas: {
                            visits: normalizedEvent.visitsDelta,
                            registrations: normalizedEvent.registrationsDelta,
                        },
                        totals: {
                            visits: 0,
                            registrations: 0,
                        },
                        airtableRecordId: undefined,
                        processedAt: (0, date_1.nowIso)(),
                        dryRun,
                    };
                }
                const mutationResult = await airtable_increment_service_1.airtableIncrementService.applyEvent({
                    site,
                    event: normalizedEvent,
                    logger: eventLogger,
                    dryRun,
                });
                if (deduplicationKey && !dryRun) {
                    event_deduplication_service_1.eventDeduplicationService.markSeen(deduplicationKey);
                }
                return mutationResult;
            });
            run.result = result;
            run.status = "completed";
            run.finishedAt = (0, date_1.nowIso)();
            run_store_service_1.runStoreService.save(run);
            eventLogger.info({
                action: result.action,
                totals: result.totals,
                queuePendingKeys: keyed_serial_queue_service_1.keyedSerialQueueService.getPendingKeys(),
            }, "Tracking event processed");
            return run;
        }
        catch (error) {
            run.status = "failed";
            run.finishedAt = (0, date_1.nowIso)();
            run.error =
                error instanceof Error
                    ? {
                        code: "code" in error && typeof error.code === "string"
                            ? error.code
                            : "EVENT_PROCESSING_FAILED",
                        message: error.message,
                        details: "details" in error ? error.details : error,
                    }
                    : {
                        code: "EVENT_PROCESSING_FAILED",
                        message: "Unknown event processing error",
                        details: error,
                    };
            run_store_service_1.runStoreService.save(run);
            eventLogger.error({ error: run.error }, "Tracking event failed");
            throw error;
        }
    }
}
exports.TrackingEventService = TrackingEventService;
exports.trackingEventService = new TrackingEventService();
