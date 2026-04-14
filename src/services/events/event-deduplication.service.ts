import { env } from "../../config/env";

export class EventDeduplicationService {
  private readonly seenEvents = new Map<string, number>();

  public hasSeen(key: string): boolean {
    this.purgeExpired();

    return this.seenEvents.has(key);
  }

  public markSeen(key: string): void {
    this.purgeExpired();
    this.seenEvents.set(key, Date.now());
  }

  private purgeExpired(): void {
    const threshold = Date.now() - env.eventDedupTtlMs;

    for (const [key, storedAt] of this.seenEvents.entries()) {
      if (storedAt < threshold) {
        this.seenEvents.delete(key);
      }
    }
  }
}

export const eventDeduplicationService = new EventDeduplicationService();
