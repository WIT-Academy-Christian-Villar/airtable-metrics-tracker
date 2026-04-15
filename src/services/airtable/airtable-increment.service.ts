import type { Logger } from "pino";

import { env } from "../../config/env";
import type { SiteConfig } from "../../types/config";
import type { NormalizedTrackingEvent } from "../../types/domain";
import type { EventMutationAction, EventRunResult } from "../../types/run";
import { AppError } from "../../utils/errors";
import { nowIso } from "../../utils/date";
import { airtableClientService } from "./airtable-client.service";
import { airtableSchemaService } from "./airtable-schema.service";

const toNumber = (value: unknown): number => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);

    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
};

const parseSources = (value: unknown): string[] => {
  if (typeof value !== "string") {
    return [];
  }

  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
};

const mergeSources = (existing: unknown, nextSource: string): string =>
  [...new Set([...parseSources(existing), nextSource])].join(", ");

export class AirtableIncrementService {
  public async applyEvent(input: {
    site: SiteConfig;
    event: NormalizedTrackingEvent;
    logger: Logger;
    dryRun: boolean;
  }): Promise<EventRunResult> {
    if (!env.airtableToken && !input.dryRun) {
      throw new AppError({
        message: "AIRTABLE_TOKEN is required when dryRun is disabled",
        code: "AIRTABLE_TOKEN_MISSING",
        statusCode: 500,
      });
    }

    const resolvedDestination = env.airtableToken
      ? await airtableSchemaService.resolveDestination({
          site: input.site,
          logger: input.logger,
        })
      : null;
    const fieldMap = resolvedDestination?.fieldNames;
    const existingRecord = env.airtableToken
      ? await airtableClientService.findRecordBySyncKey({
          baseId: input.site.airtable.baseId,
          tableId: input.site.airtable.tableId,
          syncKeyFieldName: fieldMap?.syncKey ?? "Sync Key",
          syncKey: input.event.syncKey,
          logger: input.logger,
        })
      : null;
    const currentVisits = toNumber(existingRecord?.fields[fieldMap?.visits ?? ""]);
    const currentRegistrations = toNumber(
      existingRecord?.fields[fieldMap?.registrations ?? ""],
    );
    const nextTotals = {
      visits: currentVisits + input.event.visitsDelta,
      registrations: currentRegistrations + input.event.registrationsDelta,
    };
    const action: EventMutationAction = input.dryRun
      ? "dry_run"
      : existingRecord
        ? "updated"
        : "created";

    if (!input.dryRun) {
      if (!resolvedDestination || !fieldMap) {
        throw new AppError({
          message: "Airtable destination schema could not be resolved",
          code: "AIRTABLE_SCHEMA_UNAVAILABLE",
          statusCode: 500,
        });
      }

      if (existingRecord) {
        await airtableClientService.updateRecord({
          baseId: input.site.airtable.baseId,
          tableId: input.site.airtable.tableId,
          recordId: existingRecord.id,
          fields: {
            [fieldMap.visits]: nextTotals.visits,
            [fieldMap.registrations]: nextTotals.registrations,
            [fieldMap.sources]: mergeSources(
              existingRecord.fields[fieldMap.sources],
              input.event.source,
            ),
            [fieldMap.capturedAt]:
              existingRecord.fields[fieldMap.capturedAt] &&
              String(existingRecord.fields[fieldMap.capturedAt]) > input.event.capturedAt
                ? existingRecord.fields[fieldMap.capturedAt]
                : input.event.capturedAt,
          },
          logger: input.logger,
        });
      } else {
        const createdRecord = await airtableClientService.createRecord({
          baseId: input.site.airtable.baseId,
          tableId: input.site.airtable.tableId,
          fields: this.buildRecordFields(fieldMap, input.site, input.event, nextTotals),
          logger: input.logger,
        });

        return {
          siteKey: input.site.siteKey,
          route: input.event.route,
          dateBucket: input.event.dateBucket,
          syncKey: input.event.syncKey,
          eventKind: input.event.kind,
          eventId: input.event.eventId,
          source: input.event.source,
          action,
          deltas: {
            visits: input.event.visitsDelta,
            registrations: input.event.registrationsDelta,
          },
          totals: nextTotals,
          airtableRecordId: createdRecord.id,
          processedAt: nowIso(),
          dryRun: false,
        };
      }
    }

    return {
      siteKey: input.site.siteKey,
      route: input.event.route,
      dateBucket: input.event.dateBucket,
      syncKey: input.event.syncKey,
      eventKind: input.event.kind,
      eventId: input.event.eventId,
      source: input.event.source,
      action,
      deltas: {
        visits: input.event.visitsDelta,
        registrations: input.event.registrationsDelta,
      },
      totals: nextTotals,
      airtableRecordId: existingRecord?.id,
      processedAt: nowIso(),
      dryRun: input.dryRun,
    };
  }

  private buildRecordFields(
    fieldMap: SiteConfig["airtable"]["fieldIds"],
    site: SiteConfig,
    event: NormalizedTrackingEvent,
    totals: {
      visits: number;
      registrations: number;
    },
  ): Record<string, unknown> {
    return {
      [fieldMap.siteKey]: site.siteKey,
      [fieldMap.route]: event.route,
      [fieldMap.dateBucket]: event.dateBucket,
      [fieldMap.visits]: totals.visits,
      [fieldMap.registrations]: totals.registrations,
      [fieldMap.utmSource]: event.utmSource ?? "",
      [fieldMap.utmMedium]: event.utmMedium ?? "",
      [fieldMap.utmCampaign]: event.utmCampaign ?? "",
      [fieldMap.utmTerm]: event.utmTerm ?? "",
      [fieldMap.utmContent]: event.utmContent ?? "",
      [fieldMap.sources]: event.source,
      [fieldMap.capturedAt]: event.capturedAt,
      [fieldMap.syncKey]: event.syncKey,
    };
  }
}

export const airtableIncrementService = new AirtableIncrementService();
