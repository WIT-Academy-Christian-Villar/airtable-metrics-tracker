import { env } from "../../config/env";
import type { SiteConfig } from "../../types/config";
import type { TrafficRecord } from "../../types/domain";
import type {
  AirtableWriteInput,
  AirtableWriteResult,
  AirtableWriter,
} from "../../types/provider";
import { AppError } from "../../utils/errors";
import { airtableClientService } from "./airtable-client.service";

const chunk = <T>(items: T[], size: number): T[][] => {
  const output: T[][] = [];

  for (let index = 0; index < items.length; index += size) {
    output.push(items.slice(index, index + size));
  }

  return output;
};

export class AirtableWriterService implements AirtableWriter {
  public async write(input: AirtableWriteInput): Promise<AirtableWriteResult> {
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
      input.context.logger.info(
        {
          siteKey: input.site.siteKey,
          attempted: input.records.length,
        },
        "Skipping Airtable write because dry run is enabled",
      );

      return {
        attempted: input.records.length,
        written: 0,
        created: 0,
        updated: 0,
        failed: 0,
        dryRun: true,
      };
    }

    if (!env.airtableToken) {
      throw new AppError({
        message: "AIRTABLE_TOKEN is required when dryRun is disabled",
        code: "AIRTABLE_TOKEN_MISSING",
        statusCode: 500,
      });
    }

    const summary: AirtableWriteResult = {
      attempted: input.records.length,
      written: 0,
      created: 0,
      updated: 0,
      failed: 0,
      dryRun: false,
    };

    for (const recordChunk of chunk(input.records, 10)) {
      const response = await airtableClientService.upsertRecords({
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

  private mapFields(
    site: SiteConfig,
    record: TrafficRecord,
  ): Record<string, unknown> {
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

export const airtableWriterService = new AirtableWriterService();
