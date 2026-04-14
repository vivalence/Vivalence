export class Pipe {
  listeners = new Set();

  send(value) {
    for (const listener of this.listeners) listener(value);
  }

  tap(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
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
    let resolve = null;
    const untap = this.tap((value) => {
      buffer.push(value);
      if (resolve) { resolve(); resolve = null; }
    });
    try {
      while (!signal?.aborted) {
        if (buffer.length) { yield buffer.shift(); continue; }
        await new Promise((r) => {
          resolve = r;
          signal?.addEventListener("abort", () => r(), { once: true });
        });
      }
    } finally { untap(); }
  }

  [Symbol.asyncIterator]() {
    return this.stream();
  }
}
