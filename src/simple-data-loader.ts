type BatchLoadFn<K, V> = (keys: K[]) => Promise<V[]>;

type Callback<V> = (value: V) => void;

interface Batch<K, V> {
  keys: K[];
  callbacks: Callback<V>[];
}

export class SimpleDataLoader<K, V> {
  private batchLoadFn: BatchLoadFn<K, V>;
  private batch: Batch<K, V> | undefined;

  constructor(batchLoadFn: BatchLoadFn<K, V>) {
    this.batchLoadFn = batchLoadFn;
  }

  private getBatch(): Batch<K, V> {
    if (this.batch !== undefined) {
      return this.batch;
    }

    this.batch = { keys: [], callbacks: [] };

    // https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/
    process.nextTick(async () => {
      await this.dispatchBatch();
    });

    return this.batch;
  }

  private async dispatchBatch(): Promise<void> {
    if (this.batch === undefined) return;

    const values = await this.batchLoadFn(this.batch.keys);

    for (let i = 0; i < this.batch.keys.length; i += 1) {
      const value = values[i];
      const callback = this.batch.callbacks[i];
      callback(value);
    }

    this.batch = undefined;
  }

  async load(key: K): Promise<V> {
    const currentBatch = this.getBatch();

    currentBatch.keys.push(key);

    const promise = new Promise<V>((resolve) => {
      currentBatch.callbacks.push(resolve);
    });

    return promise;
  }
}
