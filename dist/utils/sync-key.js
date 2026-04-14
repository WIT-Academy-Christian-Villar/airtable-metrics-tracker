"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildSyncKey = void 0;
const normalizeDimension = (value) => value ?? "__null__";
const buildSyncKey = (record) => [
    record.siteKey,
    record.route,
    normalizeDimension(record.utmSource),
    normalizeDimension(record.utmMedium),
    normalizeDimension(record.utmCampaign),
    normalizeDimension(record.utmTerm),
    normalizeDimension(record.utmContent),
    record.dateBucket,
].join("::");
exports.buildSyncKey = buildSyncKey;
