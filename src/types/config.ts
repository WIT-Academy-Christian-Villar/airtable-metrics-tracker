export type EnvironmentName = "development" | "test" | "production";

export interface ProviderBinding {
  key: string;
  config?: unknown;
}

export interface RouteRulesConfig {
  baseUrl?: string | undefined;
  allowedHosts: string[];
  fallbackRoute: string;
  stripTrailingSlash: boolean;
}

export interface UTMMappingConfig {
  source: string[];
  medium: string[];
  campaign: string[];
  term: string[];
  content: string[];
}

export interface AirtableFieldMap {
  siteKey: string;
  route: string;
  dateBucket: string;
  visits: string;
  registrations: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmTerm: string;
  utmContent: string;
  sources: string;
  capturedAt: string;
  syncKey: string;
}

export interface AirtableDestinationConfig {
  baseId: string;
  tableId: string;
  fieldIds: AirtableFieldMap;
  upsertFieldIds: string[];
}

export interface ResolvedAirtableDestinationConfig {
  baseId: string;
  tableId: string;
  tableName: string;
  fieldNames: AirtableFieldMap;
  upsertFieldNames: string[];
}

export interface SiteConfig {
  siteKey: string;
  displayName: string;
  enabled: boolean;
  providers: {
    visits: ProviderBinding;
    registrations: ProviderBinding;
  };
  routeRules: RouteRulesConfig;
  utmMapping: UTMMappingConfig;
  airtable: AirtableDestinationConfig;
}

export interface EnvConfig {
  port: number;
  nodeEnv: EnvironmentName;
  logLevel: "fatal" | "error" | "warn" | "info" | "debug" | "trace";
  airtableApiBase: string;
  airtableToken: string | undefined;
  requestTimeoutMs: number;
  retryMaxAttempts: number;
  retryInitialMs: number;
  retryMaxMs: number;
  airtableDryRunDefault: boolean;
  eventDedupTtlMs: number;
  defaultTimezone: string;
  sitesConfigJson: string | undefined;
}
