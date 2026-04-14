import { env } from "../../config/env";
import type { SiteConfig } from "../../types/config";
import type {
  NormalizedTrackingEvent,
  TrackingEventPayload,
  TrafficRecord,
} from "../../types/domain";
import { nowIso, toDateBucket } from "../../utils/date";
import { normalizeRoute } from "../../utils/route";
import { buildSyncKey } from "../../utils/sync-key";
import { utmNormalizerService } from "./utm-normalizer.service";

const isDateBucket = (value?: string): value is string =>
  Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value));

export class EventNormalizerService {
  private extractUtmsFromUrl(
    rawUrl: string | null | undefined,
    site: SiteConfig,
  ): Record<string, string> {
    if (!rawUrl) {
      return {};
    }

    try {
      const parsed = new URL(rawUrl);

      if (
        site.routeRules.allowedHosts.length > 0 &&
        !site.routeRules.allowedHosts.includes(parsed.hostname)
      ) {
        return {};
      }

      return Object.fromEntries(parsed.searchParams.entries());
    } catch {
      return {};
    }
  }

  public normalize(
    site: SiteConfig,
    event: TrackingEventPayload,
  ): NormalizedTrackingEvent {
    const capturedAt = event.capturedAt ?? nowIso();
    const dateBucket = isDateBucket(event.dateBucket)
      ? event.dateBucket
      : toDateBucket(new Date(capturedAt), env.defaultTimezone);
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
    const utms = utmNormalizerService.normalize(utmPayload, site.utmMapping);
    const route = normalizeRoute(event.route, event.url, site.routeRules);
    const deltas =
      event.kind === "visit"
        ? {
            visitsDelta: event.increment,
            registrationsDelta: 0,
          }
        : {
            visitsDelta: 0,
            registrationsDelta: event.increment,
          };
    const syncKey = buildSyncKey({
      siteKey: site.siteKey,
      route,
      visits: deltas.visitsDelta,
      registrations: deltas.registrationsDelta,
      ...utms,
      source: [event.source],
      capturedAt,
      dateBucket,
    } satisfies Omit<TrafficRecord, "syncKey">);

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

export const eventNormalizerService = new EventNormalizerService();
