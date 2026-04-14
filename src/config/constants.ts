import type { AirtableFieldMapping } from "../types/config";

export const APP_NAME = "airtable-metrics-sync-api";
export const APP_VERSION = "0.1.0";

export const DEFAULT_AIRTABLE_FIELD_MAPPING: AirtableFieldMapping = {
  siteKey: "Site Key",
  route: "Route",
  dateBucket: "Date Bucket",
  visits: "Visits",
  registrations: "Registrations",
  utmSource: "UTM Source",
  utmMedium: "UTM Medium",
  utmCampaign: "UTM Campaign",
  utmTerm: "UTM Term",
  utmContent: "UTM Content",
  sources: "Sources",
  capturedAt: "Captured At",
  syncKey: "Sync Key",
};
