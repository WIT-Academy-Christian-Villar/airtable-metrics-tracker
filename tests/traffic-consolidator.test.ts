import { describe, expect, it } from "vitest";

import { trafficConsolidatorService } from "../src/services/consolidation/traffic-consolidator.service";

describe("trafficConsolidatorService", () => {
  it("merges visits and registrations for the same route and UTM dimensions", () => {
    const records = trafficConsolidatorService.consolidate([
      {
        siteKey: "marketing-main",
        route: "/form",
        visits: 10,
        registrations: 0,
        utmSource: "google",
        utmMedium: "cpc",
        utmCampaign: "spring",
        utmTerm: null,
        utmContent: null,
        source: "json-api-visits",
        capturedAt: "2026-04-14T10:00:00.000Z",
        dateBucket: "2026-04-14",
      },
      {
        siteKey: "marketing-main",
        route: "/form",
        visits: 0,
        registrations: 2,
        utmSource: "google",
        utmMedium: "cpc",
        utmCampaign: "spring",
        utmTerm: null,
        utmContent: null,
        source: "json-api-registrations",
        capturedAt: "2026-04-14T11:00:00.000Z",
        dateBucket: "2026-04-14",
      },
    ]);

    expect(records).toHaveLength(1);
    expect(records[0]).toMatchObject({
      route: "/form",
      visits: 10,
      registrations: 2,
      capturedAt: "2026-04-14T11:00:00.000Z",
    });
    expect(records[0]?.source).toEqual([
      "json-api-visits",
      "json-api-registrations",
    ]);
  });
});
