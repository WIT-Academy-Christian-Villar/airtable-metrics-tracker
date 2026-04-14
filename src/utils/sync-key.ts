import type { TrafficRecord } from "../types/domain";

const normalizeDimension = (value: string | null): string => value ?? "__null__";

export const buildSyncKey = (record: Omit<TrafficRecord, "syncKey">): string =>
  [
    record.siteKey,
    record.route,
    normalizeDimension(record.utmSource),
    normalizeDimension(record.utmMedium),
    normalizeDimension(record.utmCampaign),
    normalizeDimension(record.utmTerm),
    normalizeDimension(record.utmContent),
    record.dateBucket,
  ].join("::");
