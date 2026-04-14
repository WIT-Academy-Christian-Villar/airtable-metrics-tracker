import { randomUUID } from "node:crypto";

import type { TrackingEventKind } from "../types/domain";
import type { SyncTrigger } from "../types/provider";
import type { EventRun, OperationRun, SyncRun } from "../types/run";
import { nowIso } from "../utils/date";

export class RunStoreService {
  private readonly runs = new Map<string, OperationRun>();

  public createSync(input: {
    requestId: string;
    requestedSiteKeys: string[];
    dateBucket: string;
    dryRun: boolean;
    trigger: SyncTrigger;
  }): SyncRun {
    const run: SyncRun = {
      runId: `run_${randomUUID()}`,
      kind: "sync",
      requestId: input.requestId,
      status: "running",
      trigger: input.trigger,
      dryRun: input.dryRun,
      requestedSiteKeys: input.requestedSiteKeys,
      dateBucket: input.dateBucket,
      startedAt: nowIso(),
      summary: {
        totalSites: 0,
        completedSites: 0,
        failedSites: 0,
        totalRawVisits: 0,
        totalRawRegistrations: 0,
        totalNormalized: 0,
        totalConsolidated: 0,
        totalWritten: 0,
        totalCreated: 0,
        totalUpdated: 0,
      },
      results: [],
    };

    this.runs.set(run.runId, run);

    return run;
  }

  public createEvent(input: {
    requestId: string;
    siteKey: string;
    eventKind: TrackingEventKind;
    eventId: string | undefined;
    dryRun: boolean;
  }): EventRun {
    const run: EventRun = {
      runId: `run_${randomUUID()}`,
      kind: "event",
      requestId: input.requestId,
      status: "queued",
      dryRun: input.dryRun,
      startedAt: nowIso(),
      finishedAt: undefined,
      event: {
        siteKey: input.siteKey,
        eventKind: input.eventKind,
        eventId: input.eventId,
      },
      result: undefined,
      error: undefined,
    };

    this.runs.set(run.runId, run);

    return run;
  }

  public save<T extends OperationRun>(run: T): T {
    this.runs.set(run.runId, run);

    return run;
  }

  public get(runId: string): OperationRun | undefined {
    return this.runs.get(runId);
  }
}

export const runStoreService = new RunStoreService();
