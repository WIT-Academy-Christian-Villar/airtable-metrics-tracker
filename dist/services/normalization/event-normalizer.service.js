"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventNormalizerService = exports.EventNormalizerService = void 0;
const env_1 = require("../../config/env");
const date_1 = require("../../utils/date");
const route_1 = require("../../utils/route");
const sync_key_1 = require("../../utils/sync-key");
const utm_normalizer_service_1 = require("./utm-normalizer.service");
const isDateBucket = (value) => Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value));
class EventNormalizerService {
    extractUtmsFromUrl(rawUrl, site) {
        if (!rawUrl) {
            return {};
        }
        try {
            const parsed = new URL(rawUrl);
            if (site.routeRules.allowedHosts.length > 0 &&
                !site.routeRules.allowedHosts.includes(parsed.hostname)) {
                return {};
            }
            return Object.fromEntries(parsed.searchParams.entries());
        }
        catch {
            return {};
        }
    }
    normalize(site, event) {
        const capturedAt = event.capturedAt ?? (0, date_1.nowIso)();
        const dateBucket = isDateBucket(event.dateBucket)
            ? event.dateBucket
            : (0, date_1.toDateBucket)(new Date(capturedAt), env_1.env.defaultTimezone);
        const urlDerivedUtms = this.extractUtmsFromUrl(event.url, site);
        const utmPayload = {
            ...urlDerivedUtms,
            ...(event.utms ?? {}),
            ...(event.utmSource ? { utm_source: event.utmSource } : {}),
            ...(event.utmMedium ? { utm_medium: event.utmMedium } : {}),
            ...(event.utmCampaign ? { utm_campaign: event.utmCampaign } : {}),
            ...(event.utmTerm ? { utm_term: event.utmTerm } : {}),
            ...(event.utmContent ? { utm_content: event.utmContent } : {}),
        };
        const utms = utm_normalizer_service_1.utmNormalizerService.normalize(utmPayload, site.utmMapping);
        const route = (0, route_1.normalizeRoute)(event.route, event.url, site.routeRules);
        const deltas = event.kind === "visit"
            ? {
                visitsDelta: event.increment,
                registrationsDelta: 0,
            }
            : {
                visitsDelta: 0,
                registrationsDelta: event.increment,
            };
        const syncKey = (0, sync_key_1.buildSyncKey)({
            siteKey: site.siteKey,
            route,
            visits: deltas.visitsDelta,
            registrations: deltas.registrationsDelta,
            ...utms,
            source: [event.source],
            capturedAt,
            dateBucket,
        });
        return {
            siteKey: site.siteKey,
            route,
            kind: event.kind,
            increment: event.increment,
            visitsDelta: deltas.visitsDelta,
            registrationsDelta: deltas.registrationsDelta,
            ...utms,
            source: event.source,
            capturedAt,
            dateBucket,
            syncKey,
            eventId: event.eventId,
            metadata: event.metadata,
        };
    }
}
exports.EventNormalizerService = EventNormalizerService;
exports.eventNormalizerService = new EventNormalizerService();
