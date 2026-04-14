import { describe, expect, it } from "vitest";

import { siteConfigSchema } from "../src/schemas/site.schema";
import { eventNormalizerService } from "../src/services/normalization/event-normalizer.service";

describe("eventNormalizerService", () => {
  it("builds a normalized visit event with route, utms and sync key", () => {
    const site = siteConfigSchema.parse({
      siteKey: "marketing-main",
      displayName: "Marketing Main",
      providers: {
        visits: {
          key: "json-api-visits",
          config: {},
        },
        registrations: {
          key: "json-api-registrations",
          config: {},
        },
      },
      airtable: {
        baseId: "app123",
        tableName: "Traffic Metrics",
      },
    });

    const normalized = eventNormalizerService.normalize(site, {
      siteKey: "marketing-main",
      route: "/registro/",
      url: undefined,
      eventId: "evt_123",
      kind: "visit",
      increment: 1,
      source: "test-suite",
      capturedAt: "2026-04-14T13:00:00.000Z",
      dateBucket: undefined,
      utmSource: "facebook",
      utmMedium: "paid_social",
      utmCampaign: "abril",
      utms: undefined,
      metadata: undefined,
    });

    expect(normalized.route).toBe("/registro");
    expect(normalized.visitsDelta).toBe(1);
    expect(normalized.registrationsDelta).toBe(0);
    expect(normalized.utmSource).toBe("facebook");
    expect(normalized.dateBucket).toBe("2026-04-14");
    expect(normalized.syncKey).toContain("marketing-main");
    expect(normalized.syncKey).toContain("/registro");
  });

  it("derives route and utms from the event url", () => {
    const site = siteConfigSchema.parse({
      siteKey: "marketing-main",
      displayName: "Marketing Main",
      providers: {
        visits: {
          key: "json-api-visits",
          config: {},
        },
        registrations: {
          key: "json-api-registrations",
          config: {},
        },
      },
      routeRules: {
        allowedHosts: ["landing.example.com"],
        fallbackRoute: "/",
        stripTrailingSlash: true,
      },
      airtable: {
        baseId: "app123",
        tableName: "Traffic Metrics",
      },
    });

    const normalized = eventNormalizerService.normalize(site, {
      siteKey: "marketing-main",
      route: undefined,
      url: "https://landing.example.com/registro/?utm_source=google&utm_medium=cpc&utm_campaign=lanzamiento",
      eventId: undefined,
      kind: "visit",
      increment: 1,
      source: "tracking-pixel",
      capturedAt: "2026-04-14T13:00:00.000Z",
      dateBucket: undefined,
      utms: undefined,
      metadata: undefined,
    });

    expect(normalized.route).toBe("/registro");
    expect(normalized.utmSource).toBe("google");
    expect(normalized.utmMedium).toBe("cpc");
    expect(normalized.utmCampaign).toBe("lanzamiento");
  });
});
