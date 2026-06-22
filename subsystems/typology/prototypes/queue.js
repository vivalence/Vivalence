import { fromm, promise } from "@vivalence/typology";

export class Queue {
  buffer = [];
  closed = false;
  gate = promise.waiter();

  enqueue(value) {
    this.buffer.push(value);
    this.gate.wake();
    return this;
  }

  flush() {
    this.buffer.length = 0;
    return this;
  }

  close() {
    this.closed = true;
    this.gate.wake();
  }

  async *drain(signal) {
    while (!signal?.aborted) {
      if (this.buffer.length) {
        yield this.buffer.shift();
        continue;
      }
      if (this.closed) return;
      await this.gate.wait(signal);
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
