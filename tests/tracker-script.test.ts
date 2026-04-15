import request from "supertest";
import { describe, expect, it } from "vitest";

import { app } from "../src/app";

describe("GET /tracker.js", () => {
  it("serves a tracker script configured for a site", async () => {
    const response = await request(app).get("/tracker.js").query({
      siteKey: "codigo-financiero-registro",
      registrationUrlContains: "api.academywit.com/airtable",
      confirmationPath: "/confirmar-registro/",
    });

    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toContain("application/javascript");
    expect(response.text).toContain("codigo-financiero-registro");
    expect(response.text).toContain("/c/v.gif");
    expect(response.text).toContain("/c/r.gif");
    expect(response.text).toContain("api.academywit.com/airtable");
  });
});
