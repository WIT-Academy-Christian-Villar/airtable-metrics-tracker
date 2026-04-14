import type { TrackingEventKind } from "./domain";
import type { SyncTrigger } from "./provider";

export type RunKind = "sync" | "event";

export type SyncRunStatus = "running" | "completed" | "failed";
export type SiteSyncStatus = "completed" | "failed";

export interface SiteSyncResult {
  siteKey: string;
  status: SiteSyncStatus;
  providerKeys: {
    visits: string;
    registrations: string;
  };
  rawCounts: {
    visits: number;
    registrations: number;
  };
  normalizedCount: number;
  consolidatedCount: number;
  writtenCount: number;
  createdCount: number;
  updatedCount: number;
  dryRun: boolean;
  startedAt: string;
  finishedAt: string;
  warnings: string[];
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface SyncRunSummary {
  totalSites: number;
  completedSites: number;
  failedSites: number;
  totalRawVisits: number;
  totalRawRegistrations: number;
  totalNormalized: number;
  totalConsolidated: number;
  totalWritten: number;
  totalCreated: number;
  totalUpdated: number;
}

export interface SyncRun {
  runId: string;
  kind: "sync";
  requestId: string;
  status: SyncRunStatus;
  trigger: SyncTrigger;
  dryRun: boolean;
  requestedSiteKeys: string[];
  dateBucket: string;
  startedAt: string;
  finishedAt?: string;
  summary: SyncRunSummary;
  results: SiteSyncResult[];
}

export type EventRunStatus = "queued" | "processing" | "completed" | "failed";
export type EventMutationAction =
  | "created"
  | "updated"
  | "deduplicated"
  | "dry_run";

export interface EventRunResult {
  siteKey: string;
  route: string;
  dateBucket: string;
  syncKey: string;
  eventKind: TrackingEventKind;
  eventId: string | undefined;
  source: string;
  action: EventMutationAction;
  deltas: {
    visits: number;
    registrations: number;
  };
  totals: {
    visits: number;
    registrations: number;
  };
  airtableRecordId: string | undefined;
  processedAt: string;
  dryRun: boolean;
}

export interface EventRun {
  runId: string;
  kind: "event";
  requestId: string;
  status: EventRunStatus;
  dryRun: boolean;
  startedAt: string;
  finishedAt: string | undefined;
  event: {
    siteKey: string;
    eventKind: TrackingEventKind;
    eventId: string | undefined;
  };
  result: EventRunResult | undefined;
  error:
    | {
        code: string;
        message: string;
        details: unknown;
      }
    | undefined;
}

export type OperationRun = SyncRun | EventRun;
