import { Yield } from "./yield.js";

async function resolve(item) {
  if (item instanceof Pool) {
    const r = await item.drain();
    return r.buffers ?? [];
  }
  if (item instanceof Promise) return resolve(await item);
  if (!item) return [];
  if (item?.condition === "NOMINAL") return item.buffers;
  if (item?.condition) return [];
  if (Array.isArray(item)) return (await Promise.all(item.map(resolve))).flat();
  return [item];
}

export class Pool {
  items = [];

  static of(...args) {
    return new Pool().add(...args);
  }

  add(...args) {
    for (const arg of args) {
      if (!arg) continue;
      if (arg instanceof Promise) {
        this.items.push(arg);
        continue;
      }
      if (arg instanceof Pool) {
        this.items.push(arg);
        continue;
      }
      if (arg?.condition === "NOMINAL") {
        this.add(...arg.buffers);
        continue;
      }
      if (arg?.condition) continue;
      if (Array.isArray(arg)) {
        this.add(...arg);
        continue;
      }
      this.items.push(arg);
    }
    return this;
  }

  of(...args) {
    return Pool.of(...args);
  }

  section(...args) {
    const sub = Pool.of(...args);
    this.items.push(sub);
    return sub;
  }

  head(...args) {
    const prefix = Pool.of(...args);
    this.items.unshift(...prefix.items);
    return this;
  }

  apply(fn) {
    this.items = fn(this.items);
    return this;
  }

  flatten() {
    return this.items.flatMap((item) => (item instanceof Pool ? item.flatten() : [item]));
  }

  async drain() {
    const resolved = await Promise.all(this.items.map(resolve));
    const buffers = resolved.flat();
    return buffers.length ? Yield.NOMINAL(buffers) : Yield.EXHAUSTED();
  }

  get length() {
    return this.flatten().length;
  }
}
