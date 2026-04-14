import { describe, expect, it } from "vitest";

import { utmNormalizerService } from "../src/services/normalization/utm-normalizer.service";

describe("utmNormalizerService", () => {
  it("maps aliases to the normalized UTM fields", () => {
    const normalized = utmNormalizerService.normalize(
      {
        source: "newsletter",
        medium: "email",
        campaign: "launch",
        term: "brand",
        content: "hero",
      },
      {
        source: ["utm_source", "source"],
        medium: ["utm_medium", "medium"],
        campaign: ["utm_campaign", "campaign"],
        term: ["utm_term", "term"],
        content: ["utm_content", "content"],
      },
    );

    expect(normalized).toEqual({
      utmSource: "newsletter",
      utmMedium: "email",
      utmCampaign: "launch",
      utmTerm: "brand",
      utmContent: "hero",
    });
  });
});
