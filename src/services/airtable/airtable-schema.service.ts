import type { Logger } from "pino";

import { env } from "../../config/env";
import type {
  AirtableFieldMap,
  ResolvedAirtableDestinationConfig,
  SiteConfig,
} from "../../types/config";
import { AppError } from "../../utils/errors";
import { fetchJson } from "../../utils/http";

interface AirtableSchemaField {
  id: string;
  name: string;
}

interface AirtableSchemaTable {
  id: string;
  name: string;
  fields: AirtableSchemaField[];
}

interface AirtableSchemaResponse {
  tables: AirtableSchemaTable[];
}

export class AirtableSchemaService {
  private readonly cache = new Map<
    string,
    Promise<ResolvedAirtableDestinationConfig>
  >();

  public async resolveDestination(input: {
    site: SiteConfig;
    logger: Logger;
  }): Promise<ResolvedAirtableDestinationConfig> {
    const cacheKey = `${input.site.airtable.baseId}:${input.site.airtable.tableId}`;
    const cached = this.cache.get(cacheKey);

    if (cached) {
      return cached;
    }

    const pending = this.fetchDestination(input).catch((error) => {
      this.cache.delete(cacheKey);
      throw error;
    });

    this.cache.set(cacheKey, pending);

    return pending;
  }

  private async fetchDestination(input: {
    site: SiteConfig;
    logger: Logger;
  }): Promise<ResolvedAirtableDestinationConfig> {
    const endpoint = `${env.airtableApiBase}/meta/bases/${input.site.airtable.baseId}/tables`;
    const response = await fetchJson<AirtableSchemaResponse>(endpoint, {
      method: "GET",
      headers: this.authHeaders(),
      operationName: "airtable.resolveDestinationSchema",
      logger: input.logger,
    });
    const table = response.tables.find(
      (candidate) => candidate.id === input.site.airtable.tableId,
    );

    if (!table) {
      throw new AppError({
        message: `Airtable table ${input.site.airtable.tableId} was not found in base ${input.site.airtable.baseId}`,
        code: "AIRTABLE_TABLE_NOT_FOUND",
        statusCode: 500,
      });
    }

    const fieldNamesById = new Map(
      table.fields.map((field) => [field.id, field.name]),
    );
    const fieldNames = this.resolveFieldMap(
      input.site.airtable.fieldIds,
      fieldNamesById,
    );

    return {
      baseId: input.site.airtable.baseId,
      tableId: input.site.airtable.tableId,
      tableName: table.name,
      fieldNames,
      upsertFieldNames: input.site.airtable.upsertFieldIds.map((fieldId) =>
        this.resolveFieldName(fieldId, fieldNamesById),
      ),
    };
  }

  private resolveFieldMap(
    fieldIds: AirtableFieldMap,
    fieldNamesById: Map<string, string>,
  ): AirtableFieldMap {
    return {
      siteKey: this.resolveFieldName(fieldIds.siteKey, fieldNamesById),
      route: this.resolveFieldName(fieldIds.route, fieldNamesById),
      dateBucket: this.resolveFieldName(fieldIds.dateBucket, fieldNamesById),
      visits: this.resolveFieldName(fieldIds.visits, fieldNamesById),
      registrations: this.resolveFieldName(
        fieldIds.registrations,
        fieldNamesById,
      ),
      utmSource: this.resolveFieldName(fieldIds.utmSource, fieldNamesById),
      utmMedium: this.resolveFieldName(fieldIds.utmMedium, fieldNamesById),
      utmCampaign: this.resolveFieldName(fieldIds.utmCampaign, fieldNamesById),
      utmTerm: this.resolveFieldName(fieldIds.utmTerm, fieldNamesById),
      utmContent: this.resolveFieldName(fieldIds.utmContent, fieldNamesById),
      sources: this.resolveFieldName(fieldIds.sources, fieldNamesById),
      capturedAt: this.resolveFieldName(fieldIds.capturedAt, fieldNamesById),
      syncKey: this.resolveFieldName(fieldIds.syncKey, fieldNamesById),
    };
  }

  private resolveFieldName(
    fieldId: string,
    fieldNamesById: Map<string, string>,
  ): string {
    const fieldName = fieldNamesById.get(fieldId);

    if (!fieldName) {
      throw new AppError({
        message: `Airtable field ${fieldId} was not found in the configured table schema`,
        code: "AIRTABLE_FIELD_NOT_FOUND",
        statusCode: 500,
      });
    }

    return fieldName;
  }

  private authHeaders(): Record<string, string> {
    return {
      Authorization: `Bearer ${env.airtableToken}`,
    };
  }
}

export const airtableSchemaService = new AirtableSchemaService();
