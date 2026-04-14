import { describe, expect, it } from "vitest";

import { registrationPixelQuerySchema } from "../src/schemas/event.schema";

describe("registrationPixelQuerySchema", () => {
  it("accepts sourcePath without requiring route or url", () => {
    const parsed = registrationPixelQuerySchema.parse({
      siteKey: "marketing-main",
      sourcePath: "/registro",
    });

    expect(parsed.siteKey).toBe("marketing-main");
    expect(parsed.sourcePath).toBe("/registro");
    expect(parsed.increment).toBe(1);
    expect(parsed.source).toBe("tracking-pixel");
  });
});
