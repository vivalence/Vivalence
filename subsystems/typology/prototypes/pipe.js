import * as fromm from "../gestalten/fromm/index.js";
import { atom } from "nanostores";
import { Queue } from "./queue.js";

export class Pipe {
  listeners = new Set();

  send(value) {
    for (const listener of this.listeners) listener(value);
  }

  tap(target) {
    const listener = fromm.sink(target).write;
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  from(...sources) {
    for (const origin of sources)
      (async () => {
        for await (const value of fromm.source(origin).read) this.send(value);
      })();
    return this;
  }

  fold(seed, step) {
    const store = atom(seed);
    this.tap((value) => store.set(step(store.get(), value)));
    return store;
  }

  async *drain(signal) {
    const queue = new Queue();
    const untap = this.tap(queue);
    try {
      yield* queue.drain(signal);
    } finally {
      untap();
    }
  }

  [Symbol.asyncIterator]() {
    return this.drain();
  }
}
