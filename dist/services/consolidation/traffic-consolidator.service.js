"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trafficConsolidatorService = exports.TrafficConsolidatorService = void 0;
const sync_key_1 = require("../../utils/sync-key");
const buildAggregationKey = (record) => [
    record.siteKey,
    record.route,
    record.utmSource ?? "__null__",
    record.utmMedium ?? "__null__",
    record.utmCampaign ?? "__null__",
    record.utmTerm ?? "__null__",
    record.utmContent ?? "__null__",
    record.dateBucket,
].join("::");
class TrafficConsolidatorService {
    consolidate(records) {
        const aggregated = new Map();
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
            syncKey: (0, sync_key_1.buildSyncKey)(record),
        }))
            .sort((left, right) => left.syncKey.localeCompare(right.syncKey));
    }
}
exports.TrafficConsolidatorService = TrafficConsolidatorService;
exports.trafficConsolidatorService = new TrafficConsolidatorService();
