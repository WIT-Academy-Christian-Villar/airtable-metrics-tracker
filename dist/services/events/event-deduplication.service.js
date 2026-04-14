"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventDeduplicationService = exports.EventDeduplicationService = void 0;
const env_1 = require("../../config/env");
class EventDeduplicationService {
    seenEvents = new Map();
    hasSeen(key) {
        this.purgeExpired();
        return this.seenEvents.has(key);
    }
    markSeen(key) {
        this.purgeExpired();
        this.seenEvents.set(key, Date.now());
    }
    purgeExpired() {
        const threshold = Date.now() - env_1.env.eventDedupTtlMs;
        for (const [key, storedAt] of this.seenEvents.entries()) {
            if (storedAt < threshold) {
                this.seenEvents.delete(key);
            }
        }
    }
}
exports.EventDeduplicationService = EventDeduplicationService;
exports.eventDeduplicationService = new EventDeduplicationService();
