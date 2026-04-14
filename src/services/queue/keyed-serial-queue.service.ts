export class KeyedSerialQueueService {
  private readonly tails = new Map<string, Promise<void>>();

  public enqueue<T>(key: string, task: () => Promise<T>): Promise<T> {
    const previous = this.tails.get(key) ?? Promise.resolve();
    const runPromise = previous.catch(() => undefined).then(task);
    const tailPromise = runPromise.then(
      () => undefined,
      () => undefined,
    );

    this.tails.set(key, tailPromise);

    return runPromise.finally(() => {
      if (this.tails.get(key) === tailPromise) {
        this.tails.delete(key);
      }
    });
  }

  public getPendingKeys(): number {
    return this.tails.size;
  }
}

export const keyedSerialQueueService = new KeyedSerialQueueService();
