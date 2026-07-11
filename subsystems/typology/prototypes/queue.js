import { fromm, promise } from "@vivalence/typology";

export class Queue {
  backlog = [];
  closed = false;
  gate = promise.waiter();

  enqueue(value) {
    this.backlog.push(value);
    this.gate.wake();
    return this;
  }

  flush() {
    this.backlog.length = 0;
    return this;
  }

  close() {
    this.closed = true;
    this.gate.wake();
  }

  async *drain(signal) {
    while (!signal?.aborted) {
      if (this.backlog.length) {
        yield this.backlog.shift();
        continue;
      }
      if (this.closed) return;
      await this.gate.wait(signal);
    }
  }

  get depth() {
    return this.backlog.length;
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
