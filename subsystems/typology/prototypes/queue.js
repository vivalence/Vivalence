import { atom } from "nanostores";
import * as fromm from "../gestalten/fromm/index.js";
import * as promise from "../gestalten/belt/promise.js";

export class Queue {
  $backlog = atom([]);
  closed = false;
  gate = promise.waiter();

  get backlog() {
    return this.$backlog.get();
  }

  enqueue(value) {
    this.$backlog.set([...this.backlog, value]);
    this.gate.wake();
    return this;
  }

  flush() {
    this.$backlog.set([]);
    return this;
  }

  close() {
    this.closed = true;
    this.gate.wake();
  }

  async *drain(signal) {
    while (!signal?.aborted) {
      if (this.backlog.length) {
        const [head, ...rest] = this.backlog;
        this.$backlog.set(rest);
        yield head;
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
