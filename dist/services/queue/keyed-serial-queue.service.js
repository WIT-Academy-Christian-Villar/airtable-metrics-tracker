"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.keyedSerialQueueService = exports.KeyedSerialQueueService = void 0;
class KeyedSerialQueueService {
    tails = new Map();
    enqueue(key, task) {
        const previous = this.tails.get(key) ?? Promise.resolve();
        const runPromise = previous.catch(() => undefined).then(task);
        const tailPromise = runPromise.then(() => undefined, () => undefined);
        this.tails.set(key, tailPromise);
        return runPromise.finally(() => {
            if (this.tails.get(key) === tailPromise) {
                this.tails.delete(key);
            }
        });
    }
    getPendingKeys() {
        return this.tails.size;
    }
}
exports.KeyedSerialQueueService = KeyedSerialQueueService;
exports.keyedSerialQueueService = new KeyedSerialQueueService();
