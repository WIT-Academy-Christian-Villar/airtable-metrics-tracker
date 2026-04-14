import { env } from "../../config/env";
import { logger } from "../../config/logger";
import { airtableIncrementService } from "../airtable/airtable-increment.service";
import { eventNormalizerService } from "../normalization/event-normalizer.service";
import { keyedSerialQueueService } from "../queue/keyed-serial-queue.service";
import { runStoreService } from "../run-store.service";
import { siteService } from "../site.service";
import type {
  TrackingEventKind,
  TrackingEventPayload,
} from "../../types/domain";
import type { EventRun } from "../../types/run";
import { nowIso } from "../../utils/date";
import { eventDeduplicationService } from "./event-deduplication.service";

const buildDeduplicationKey = (event: {
  siteKey: string;
  kind: TrackingEventKind;
  eventId: string;
  syncKey: string;
}): string => [event.siteKey, event.kind, event.syncKey, event.eventId].join("::");

export class TrackingEventService {
  public async ingest(input: {
    requestId: string;
    payload: TrackingEventPayload;
    dryRun: boolean | undefined;
  }): Promise<EventRun> {
    const site = siteService.resolveSite(input.payload.siteKey);
    const normalizedEvent = eventNormalizerService.normalize(site, input.payload);
    const dryRun = input.dryRun ?? env.airtableDryRunDefault;
    const run = runStoreService.createEvent({
      requestId: input.requestId,
      siteKey: site.siteKey,
      eventKind: normalizedEvent.kind,
      eventId: normalizedEvent.eventId,
      dryRun,
    });
    const eventLogger = logger.child({
      requestId: input.requestId,
      runId: run.runId,
      siteKey: site.siteKey,
      syncKey: normalizedEvent.syncKey,
      eventKind: normalizedEvent.kind,
    });

    run.status = "processing";
    runStoreService.save(run);

    try {
      const result = await keyedSerialQueueService.enqueue(
        normalizedEvent.syncKey,
        async () => {
          const deduplicationKey = normalizedEvent.eventId
            ? buildDeduplicationKey({
                siteKey: site.siteKey,
                kind: normalizedEvent.kind,
                eventId: normalizedEvent.eventId,
                syncKey: normalizedEvent.syncKey,
              })
            : undefined;

          if (
            deduplicationKey &&
            eventDeduplicationService.hasSeen(deduplicationKey)
          ) {
            return {
              siteKey: site.siteKey,
              route: normalizedEvent.route,
              dateBucket: normalizedEvent.dateBucket,
              syncKey: normalizedEvent.syncKey,
              eventKind: normalizedEvent.kind,
              eventId: normalizedEvent.eventId,
              source: normalizedEvent.source,
              action: "deduplicated" as const,
              deltas: {
                visits: normalizedEvent.visitsDelta,
                registrations: normalizedEvent.registrationsDelta,
              },
              totals: {
                visits: 0,
                registrations: 0,
              },
              airtableRecordId: undefined,
              processedAt: nowIso(),
              dryRun,
            };
          }

          const mutationResult = await airtableIncrementService.applyEvent({
            site,
            event: normalizedEvent,
            logger: eventLogger,
            dryRun,
          });

          if (deduplicationKey && !dryRun) {
            eventDeduplicationService.markSeen(deduplicationKey);
          }

          return mutationResult;
        },
      );
      run.result = result;
      run.status = "completed";
      run.finishedAt = nowIso();
      runStoreService.save(run);

      eventLogger.info(
        {
          action: result.action,
          totals: result.totals,
          queuePendingKeys: keyedSerialQueueService.getPendingKeys(),
        },
        "Tracking event processed",
      );

      return run;
    } catch (error) {
      run.status = "failed";
      run.finishedAt = nowIso();
      run.error =
        error instanceof Error
          ? {
              code:
                "code" in error && typeof error.code === "string"
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
      runStoreService.save(run);
      eventLogger.error({ error: run.error }, "Tracking event failed");
      throw error;
    }
  }
}

export const trackingEventService = new TrackingEventService();
