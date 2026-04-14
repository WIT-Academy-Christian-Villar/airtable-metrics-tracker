"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.airtableIncrementService = exports.AirtableIncrementService = void 0;
const env_1 = require("../../config/env");
const errors_1 = require("../../utils/errors");
const date_1 = require("../../utils/date");
const airtable_client_service_1 = require("./airtable-client.service");
const toNumber = (value) => {
    if (typeof value === "number" && Number.isFinite(value)) {
        return value;
    }
    if (typeof value === "string") {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : 0;
    }
    return 0;
};
const parseSources = (value) => {
    if (typeof value !== "string") {
        return [];
    }
    return value
        .split(",")
        .map((entry) => entry.trim())
        .filter(Boolean);
};
const mergeSources = (existing, nextSource) => [...new Set([...parseSources(existing), nextSource])].join(", ");
class AirtableIncrementService {
    async applyEvent(input) {
        if (!env_1.env.airtableToken && !input.dryRun) {
            throw new errors_1.AppError({
                message: "AIRTABLE_TOKEN is required when dryRun is disabled",
                code: "AIRTABLE_TOKEN_MISSING",
                statusCode: 500,
            });
        }
        const fieldMap = input.site.airtable.fieldMapping;
        const existingRecord = env_1.env.airtableToken
            ? await airtable_client_service_1.airtableClientService.findRecordBySyncKey({
                baseId: input.site.airtable.baseId,
                tableName: input.site.airtable.tableName,
                syncKeyFieldName: fieldMap.syncKey,
                syncKey: input.event.syncKey,
                logger: input.logger,
            })
            : null;
        const currentVisits = toNumber(existingRecord?.fields[fieldMap.visits]);
        const currentRegistrations = toNumber(existingRecord?.fields[fieldMap.registrations]);
        const nextTotals = {
            visits: currentVisits + input.event.visitsDelta,
            registrations: currentRegistrations + input.event.registrationsDelta,
        };
        const action = input.dryRun
            ? "dry_run"
            : existingRecord
                ? "updated"
                : "created";
        if (!input.dryRun) {
            if (existingRecord) {
                await airtable_client_service_1.airtableClientService.updateRecord({
                    baseId: input.site.airtable.baseId,
                    tableName: input.site.airtable.tableName,
                    recordId: existingRecord.id,
                    fields: {
                        [fieldMap.visits]: nextTotals.visits,
                        [fieldMap.registrations]: nextTotals.registrations,
                        [fieldMap.sources]: mergeSources(existingRecord.fields[fieldMap.sources], input.event.source),
                        [fieldMap.capturedAt]: existingRecord.fields[fieldMap.capturedAt] &&
                            String(existingRecord.fields[fieldMap.capturedAt]) > input.event.capturedAt
                            ? existingRecord.fields[fieldMap.capturedAt]
                            : input.event.capturedAt,
                    },
                    logger: input.logger,
                });
            }
            else {
                const createdRecord = await airtable_client_service_1.airtableClientService.createRecord({
                    baseId: input.site.airtable.baseId,
                    tableName: input.site.airtable.tableName,
                    fields: this.buildRecordFields(input.site, input.event, nextTotals),
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
                    processedAt: (0, date_1.nowIso)(),
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
            processedAt: (0, date_1.nowIso)(),
            dryRun: input.dryRun,
        };
    }
    buildRecordFields(site, event, totals) {
        const fieldMap = site.airtable.fieldMapping;
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
exports.AirtableIncrementService = AirtableIncrementService;
exports.airtableIncrementService = new AirtableIncrementService();
