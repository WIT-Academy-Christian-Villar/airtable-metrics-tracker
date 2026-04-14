import type { SiteConfig } from "../../types/config";
import type {
  NormalizedMetricRecord,
  RawRegistrationMetric,
  RawVisitMetric,
} from "../../types/domain";
import { nowIso } from "../../utils/date";
import { normalizeRoute } from "../../utils/route";
import { utmNormalizerService } from "./utm-normalizer.service";

const isDateBucket = (value?: string): value is string =>
  Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value));

export class MetricsNormalizerService {
  public normalizeVisits(
    site: SiteConfig,
    metrics: RawVisitMetric[],
    defaultDateBucket: string,
  ): NormalizedMetricRecord[] {
    return metrics.map((metric) =>
      this.normalizeBase(site, metric, defaultDateBucket, {
        visits: metric.visits,
        registrations: 0,
      }),
    );
  }

  public normalizeRegistrations(
    site: SiteConfig,
    metrics: RawRegistrationMetric[],
    defaultDateBucket: string,
  ): NormalizedMetricRecord[] {
    return metrics.map((metric) =>
      this.normalizeBase(site, metric, defaultDateBucket, {
        visits: 0,
        registrations: metric.registrations,
      }),
    );
  }

  private normalizeBase(
    site: SiteConfig,
    metric: {
      rawRoute: string | null | undefined;
      rawUrl: string | null | undefined;
      utms: Record<string, unknown> | undefined;
      capturedAt: string | undefined;
      dateBucket: string | undefined;
      source: string;
    },
    defaultDateBucket: string,
    values: {
      visits: number;
      registrations: number;
    },
  ): NormalizedMetricRecord {
    const utms = utmNormalizerService.normalize(metric.utms, site.utmMapping);

    return {
      siteKey: site.siteKey,
      route: normalizeRoute(metric.rawRoute, metric.rawUrl, site.routeRules),
      visits: values.visits,
      registrations: values.registrations,
      ...utms,
      source: metric.source,
      capturedAt: metric.capturedAt ?? nowIso(),
      dateBucket: isDateBucket(metric.dateBucket)
        ? metric.dateBucket
        : defaultDateBucket,
    };
  }
}

export const metricsNormalizerService = new MetricsNormalizerService();
