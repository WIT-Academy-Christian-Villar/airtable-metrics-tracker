"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.metricsNormalizerService = exports.MetricsNormalizerService = void 0;
const date_1 = require("../../utils/date");
const route_1 = require("../../utils/route");
const utm_normalizer_service_1 = require("./utm-normalizer.service");
const isDateBucket = (value) => Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value));
class MetricsNormalizerService {
    normalizeVisits(site, metrics, defaultDateBucket) {
        return metrics.map((metric) => this.normalizeBase(site, metric, defaultDateBucket, {
            visits: metric.visits,
            registrations: 0,
        }));
    }
    normalizeRegistrations(site, metrics, defaultDateBucket) {
        return metrics.map((metric) => this.normalizeBase(site, metric, defaultDateBucket, {
            visits: 0,
            registrations: metric.registrations,
        }));
    }
    normalizeBase(site, metric, defaultDateBucket, values) {
        const utms = utm_normalizer_service_1.utmNormalizerService.normalize(metric.utms, site.utmMapping);
        return {
            siteKey: site.siteKey,
            route: (0, route_1.normalizeRoute)(metric.rawRoute, metric.rawUrl, site.routeRules),
            visits: values.visits,
            registrations: values.registrations,
            ...utms,
            source: metric.source,
            capturedAt: metric.capturedAt ?? (0, date_1.nowIso)(),
            dateBucket: isDateBucket(metric.dateBucket)
                ? metric.dateBucket
                : defaultDateBucket,
        };
    }
}
exports.MetricsNormalizerService = MetricsNormalizerService;
exports.metricsNormalizerService = new MetricsNormalizerService();
