import { fromm, promise } from "@vivalence/typology";
import { atom } from "nanostores";

export class Pipe {
  listeners = new Set();

  send(value) {
    for (const listener of this.listeners) listener(value);
  }

  tap(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  reactive(seed = null, step = (_, value) => value) {
    const store = atom(seed);
    this.tap((value) => store.set(step(store.get(), value)));
    return store;
  }

  to(...sinks) {
    for (const target of sinks) this.tap(fromm.sink(target).write);
    return this;
  }

  from(...sources) {
    for (const origin of sources)
      (async () => {
        for await (const value of fromm.source(origin).read) this.send(value);
      })();
    return this;
  }

  observe() {
    const controller = new AbortController();
    const iterator = this.stream(controller.signal);
    iterator.unsubscribe = () => controller.abort();
    return iterator;
  }

  subscribe(callback) {
    return this.tap(callback);
  }

  async *stream(signal) {
    const buffer = [];
    const gate = promise.waiter();
    const untap = this.tap((value) => {
      buffer.push(value);
      gate.wake();
    });
    try {
      while (!signal?.aborted) {
        if (buffer.length) {
          yield buffer.shift();
          continue;
        }
        await gate.wait(signal);
      }
    } finally {
      untap();
    }
  }

  [Symbol.asyncIterator]() {
    return this.stream();
  }
}
