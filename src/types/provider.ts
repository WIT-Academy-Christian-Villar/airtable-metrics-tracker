import type { Logger } from "pino";

import type { SiteConfig } from "./config";
import type {
  RawRegistrationMetric,
  RawVisitMetric,
  TrafficRecord,
} from "./domain";

export type ProviderKind = "visits" | "registrations";
export type SyncTrigger = "manual" | "scheduled" | "api";

export interface ProviderDescriptor {
  key: string;
  kind: ProviderKind;
  displayName: string;
  description: string;
}

export interface SyncWindow {
  dateBucket: string;
  requestedAt: string;
  dryRun: boolean;
  trigger: SyncTrigger;
}

export interface ProviderExecutionContext {
  requestId: string;
  runId: string;
  logger: Logger;
  window: SyncWindow;
}

export interface VisitsProviderInput {
  site: SiteConfig;
  providerConfig: unknown;
  context: ProviderExecutionContext;
}

export interface RegistrationsProviderInput {
  site: SiteConfig;
  providerConfig: unknown;
  context: ProviderExecutionContext;
}

export interface VisitsProvider {
  readonly descriptor: ProviderDescriptor;
  validateConfig(config: unknown): unknown;
  collect(input: VisitsProviderInput): Promise<RawVisitMetric[]>;
}

export interface RegistrationsProvider {
  readonly descriptor: ProviderDescriptor;
  validateConfig(config: unknown): unknown;
  collect(input: RegistrationsProviderInput): Promise<RawRegistrationMetric[]>;
}

export interface AirtableWriteInput {
  site: SiteConfig;
  records: TrafficRecord[];
  context: ProviderExecutionContext;
  dryRun: boolean;
}

export interface AirtableWriteResult {
  attempted: number;
  written: number;
  created: number;
  updated: number;
  failed: number;
  dryRun: boolean;
}

export interface AirtableWriter {
  write(input: AirtableWriteInput): Promise<AirtableWriteResult>;
}
