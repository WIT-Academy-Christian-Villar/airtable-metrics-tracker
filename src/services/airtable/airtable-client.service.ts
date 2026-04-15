import type { Logger } from "pino";

import { env } from "../../config/env";
import { buildEqualsFormula } from "../../utils/airtable-formula";
import { fetchJson } from "../../utils/http";

export interface AirtableRecord {
  id: string;
  fields: Record<string, unknown>;
  createdTime?: string;
}

interface AirtableListResponse {
  records: AirtableRecord[];
  offset?: string;
}

interface AirtableBulkMutationResponse {
  records: AirtableRecord[];
  createdRecords?: string[];
  updatedRecords?: string[];
}

export class AirtableClientService {
  public async upsertRecords(input: {
    baseId: string;
    tableId: string;
    records: Array<Record<string, unknown>>;
    upsertFields: string[];
    logger: Logger;
  }): Promise<AirtableBulkMutationResponse> {
    const endpoint = this.tableEndpoint(input.baseId, input.tableId);

    return fetchJson<AirtableBulkMutationResponse>(endpoint, {
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

  public async findRecordBySyncKey(input: {
    baseId: string;
    tableId: string;
    syncKeyFieldName: string;
    syncKey: string;
    logger: Logger;
  }): Promise<AirtableRecord | null> {
    const endpoint = this.tableEndpoint(input.baseId, input.tableId);
    const response = await fetchJson<AirtableListResponse>(endpoint, {
      method: "GET",
      headers: this.authHeaders(),
      query: {
        filterByFormula: buildEqualsFormula(
          input.syncKeyFieldName,
          input.syncKey,
        ),
        maxRecords: "1",
      },
      operationName: "airtable.findRecordBySyncKey",
      logger: input.logger,
    });

    return response.records[0] ?? null;
  }

  public async createRecord(input: {
    baseId: string;
    tableId: string;
    fields: Record<string, unknown>;
    logger: Logger;
  }): Promise<AirtableRecord> {
    const endpoint = this.tableEndpoint(input.baseId, input.tableId);

    return fetchJson<AirtableRecord>(endpoint, {
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

  public async updateRecord(input: {
    baseId: string;
    tableId: string;
    recordId: string;
    fields: Record<string, unknown>;
    logger: Logger;
  }): Promise<AirtableRecord> {
    const endpoint = `${this.tableEndpoint(input.baseId, input.tableId)}/${input.recordId}`;

    return fetchJson<AirtableRecord>(endpoint, {
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

  private tableEndpoint(baseId: string, tableId: string): string {
    return `${env.airtableApiBase}/${baseId}/${encodeURIComponent(tableId)}`;
  }

  private authHeaders(): Record<string, string> {
    return {
      Authorization: `Bearer ${env.airtableToken}`,
    };
  }
}

export const airtableClientService = new AirtableClientService();
