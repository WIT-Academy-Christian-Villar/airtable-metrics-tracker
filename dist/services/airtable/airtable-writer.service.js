"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.airtableWriterService = exports.AirtableWriterService = void 0;
const env_1 = require("../../config/env");
const errors_1 = require("../../utils/errors");
const airtable_client_service_1 = require("./airtable-client.service");
const chunk = (items, size) => {
    const output = [];
    for (let index = 0; index < items.length; index += size) {
        output.push(items.slice(index, index + size));
    }
    return output;
};
class AirtableWriterService {
    async write(input) {
        if (input.records.length === 0) {
            return {
                attempted: 0,
                written: 0,
                created: 0,
                updated: 0,
                failed: 0,
                dryRun: input.dryRun,
            };
        }
        if (input.dryRun) {
            input.context.logger.info({
                siteKey: input.site.siteKey,
                attempted: input.records.length,
            }, "Skipping Airtable write because dry run is enabled");
            return {
                attempted: input.records.length,
                written: 0,
                created: 0,
                updated: 0,
                failed: 0,
                dryRun: true,
            };
        }
        if (!env_1.env.airtableToken) {
            throw new errors_1.AppError({
                message: "AIRTABLE_TOKEN is required when dryRun is disabled",
                code: "AIRTABLE_TOKEN_MISSING",
                statusCode: 500,
            });
        }
        const summary = {
            attempted: input.records.length,
            written: 0,
            created: 0,
            updated: 0,
            failed: 0,
            dryRun: false,
        };
        for (const recordChunk of chunk(input.records, 10)) {
            const response = await airtable_client_service_1.airtableClientService.upsertRecords({
                baseId: input.site.airtable.baseId,
                tableName: input.site.airtable.tableName,
                records: recordChunk.map((record) => this.mapFields(input.site, record)),
                upsertFields: input.site.airtable.upsertFields,
                logger: input.context.logger,
            });
            summary.written += response.records.length;
            summary.created += response.createdRecords?.length ?? 0;
            summary.updated += response.updatedRecords?.length ?? 0;
        }
        summary.failed = Math.max(0, summary.attempted - summary.written);
        return summary;
    }
    mapFields(site, record) {
        const fieldMap = site.airtable.fieldMapping;
        return {
            [fieldMap.siteKey]: record.siteKey,
            [fieldMap.route]: record.route,
            [fieldMap.dateBucket]: record.dateBucket,
            [fieldMap.visits]: record.visits,
            [fieldMap.registrations]: record.registrations,
            [fieldMap.utmSource]: record.utmSource ?? "",
            [fieldMap.utmMedium]: record.utmMedium ?? "",
            [fieldMap.utmCampaign]: record.utmCampaign ?? "",
            [fieldMap.utmTerm]: record.utmTerm ?? "",
            [fieldMap.utmContent]: record.utmContent ?? "",
            [fieldMap.sources]: record.source.join(", "),
            [fieldMap.capturedAt]: record.capturedAt,
            [fieldMap.syncKey]: record.syncKey,
        };
    }
}
exports.AirtableWriterService = AirtableWriterService;
exports.airtableWriterService = new AirtableWriterService();
