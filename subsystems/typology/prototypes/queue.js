import { fromm } from "@vivalence/typology";

export class Queue {
  buffer = [];
  resolve = null;
  closed = false;

  enqueue(value) {
    this.buffer.push(value);
    if (this.resolve) {
      this.resolve();
      this.resolve = null;
    }
    return this;
  }

  flush() {
    this.buffer.length = 0;
    return this;
  }

  close() {
    this.closed = true;
    if (this.resolve) {
      this.resolve();
      this.resolve = null;
    }
  }

  async *drain(signal) {
    while (!signal?.aborted) {
      if (this.buffer.length) {
        yield this.buffer.shift();
        continue;
      }
      if (this.closed) return;
      await new Promise((r) => {
        this.resolve = r;
        signal?.addEventListener("abort", () => r(), { once: true });
      });
    }
  }

  get depth() {
    return this.buffer.length;
  }

  to(...sinks) {
    const writes = sinks.map((target) => fromm.sink(target).write);
    (async () => {
      for await (const value of this.drain()) for (const write of writes) write(value);
    })();
    return this;
  }

  [Symbol.asyncIterator]() {
    return this.drain();
  }
}
