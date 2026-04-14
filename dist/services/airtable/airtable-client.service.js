"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.airtableClientService = exports.AirtableClientService = void 0;
const env_1 = require("../../config/env");
const airtable_formula_1 = require("../../utils/airtable-formula");
const http_1 = require("../../utils/http");
class AirtableClientService {
    async upsertRecords(input) {
        const endpoint = this.tableEndpoint(input.baseId, input.tableName);
        return (0, http_1.fetchJson)(endpoint, {
            method: "PATCH",
            headers: this.authHeaders(),
            body: {
                records: input.records.map((fields) => ({ fields })),
                performUpsert: {
                    fieldsToMergeOn: input.upsertFields,
                },
                typecast: true,
            },
            operationName: "airtable.upsertRecords",
            logger: input.logger,
        });
    }
    async findRecordBySyncKey(input) {
        const endpoint = this.tableEndpoint(input.baseId, input.tableName);
        const response = await (0, http_1.fetchJson)(endpoint, {
            method: "GET",
            headers: this.authHeaders(),
            query: {
                filterByFormula: (0, airtable_formula_1.buildEqualsFormula)(input.syncKeyFieldName, input.syncKey),
                maxRecords: "1",
            },
            operationName: "airtable.findRecordBySyncKey",
            logger: input.logger,
        });
        return response.records[0] ?? null;
    }
    async createRecord(input) {
        const endpoint = this.tableEndpoint(input.baseId, input.tableName);
        return (0, http_1.fetchJson)(endpoint, {
            method: "POST",
            headers: this.authHeaders(),
            body: {
                fields: input.fields,
                typecast: true,
            },
            operationName: "airtable.createRecord",
            logger: input.logger,
        });
    }
    async updateRecord(input) {
        const endpoint = `${this.tableEndpoint(input.baseId, input.tableName)}/${input.recordId}`;
        return (0, http_1.fetchJson)(endpoint, {
            method: "PATCH",
            headers: this.authHeaders(),
            body: {
                fields: input.fields,
                typecast: true,
            },
            operationName: "airtable.updateRecord",
            logger: input.logger,
        });
    }
    tableEndpoint(baseId, tableName) {
        return `${env_1.env.airtableApiBase}/${baseId}/${encodeURIComponent(tableName)}`;
    }
    authHeaders() {
        return {
            Authorization: `Bearer ${env_1.env.airtableToken}`,
        };
    }
}
exports.AirtableClientService = AirtableClientService;
exports.airtableClientService = new AirtableClientService();
