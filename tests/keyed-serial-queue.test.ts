import { describe, expect, it } from "vitest";

import { KeyedSerialQueueService } from "../src/services/queue/keyed-serial-queue.service";

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

describe("KeyedSerialQueueService", () => {
  it("serializes tasks for the same key", async () => {
    const queue = new KeyedSerialQueueService();
    const executionOrder: string[] = [];

    await Promise.all([
      queue.enqueue("same-key", async () => {
        executionOrder.push("first:start");
        await sleep(20);
        executionOrder.push("first:end");
      }),
      queue.enqueue("same-key", async () => {
        executionOrder.push("second:start");
        executionOrder.push("second:end");
      }),
    ]);

    expect(executionOrder).toEqual([
      "first:start",
      "first:end",
      "second:start",
      "second:end",
    ]);
  });
});
