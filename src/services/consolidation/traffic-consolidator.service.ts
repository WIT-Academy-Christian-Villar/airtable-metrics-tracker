import type { NormalizedMetricRecord, TrafficRecord } from "../../types/domain";
import { buildSyncKey } from "../../utils/sync-key";

const buildAggregationKey = (record: NormalizedMetricRecord): string =>
  [
    record.siteKey,
    record.route,
    record.utmSource ?? "__null__",
    record.utmMedium ?? "__null__",
    record.utmCampaign ?? "__null__",
    record.utmTerm ?? "__null__",
    record.utmContent ?? "__null__",
    record.dateBucket,
  ].join("::");

export class TrafficConsolidatorService {
  public consolidate(records: NormalizedMetricRecord[]): TrafficRecord[] {
    const aggregated = new Map<string, Omit<TrafficRecord, "syncKey">>();

    for (const record of records) {
      const aggregationKey = buildAggregationKey(record);
      const current = aggregated.get(aggregationKey);

      if (!current) {
        aggregated.set(aggregationKey, {
          siteKey: record.siteKey,
          route: record.route,
          visits: record.visits,
          registrations: record.registrations,
          utmSource: record.utmSource,
          utmMedium: record.utmMedium,
          utmCampaign: record.utmCampaign,
          utmTerm: record.utmTerm,
          utmContent: record.utmContent,
          source: [record.source],
          capturedAt: record.capturedAt,
          dateBucket: record.dateBucket,
        });

        continue;
      }

      current.visits += record.visits;
      current.registrations += record.registrations;
      current.capturedAt =
        current.capturedAt > record.capturedAt ? current.capturedAt : record.capturedAt;

      if (!current.source.includes(record.source)) {
        current.source.push(record.source);
      }
    }

    return [...aggregated.values()]
      .map((record) => ({
        ...record,
        syncKey: buildSyncKey(record),
      }))
      .sort((left, right) => left.syncKey.localeCompare(right.syncKey));
  }
}

export const trafficConsolidatorService = new TrafficConsolidatorService();
