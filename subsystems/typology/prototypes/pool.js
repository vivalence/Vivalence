// import { Yield } from "./yield.js";

// @beef maybe inline into pool?
export const Condition = Object.freeze({
  NOMINAL: "NOMINAL",
  EXHAUSTED: "EXHAUSTED",
  ERROR: "ERROR",
});

export const Yield = Object.freeze({
  NOMINAL: (buffers, meta) => ({ condition: Condition.NOMINAL, buffers, ...meta }),
  EXHAUSTED: (meta) => ({ condition: Condition.EXHAUSTED, buffers: [], ...meta }),
  ERROR: (error, meta) => ({ condition: Condition.ERROR, buffers: [], error, ...meta }),
});

// single source of truth for a value's pool-shape (patternmap form, like pattern.js's
// probe). resolve (eager → buffers) and add (lazy → items) both dispatch on this, so
// the shape truth-table can't drift between them.
const SHAPES = [
  [(item) => !item, "empty"],
  [(item) => item instanceof Promise, "promise"],
  [(item) => item instanceof Pool, "pool"],
  [(item) => item?.condition === Condition.NOMINAL, "nominal"],
  [(item) => item?.condition, "spent"], // EXHAUSTED / ERROR
  [(item) => Array.isArray(item), "array"],
  [() => true, "buffer"],
];
const classify = (item) => SHAPES.find(([test]) => test(item))[1];

async function resolve(item) {
  switch (classify(item)) {
    case "promise": return resolve(await item);
    case "pool": return (await item.drain()).buffers ?? [];
    case "nominal": return item.buffers;
    case "array": return (await Promise.all(item.map(resolve))).flat();
    case "buffer": return [item];
    default: return []; // empty | spent
  }
}

export class Pool {
  items = [];

  static of(...args) {
    return new Pool().add(...args);
  }

  add(...args) {
    for (const arg of args) {
      switch (classify(arg)) {
        case "promise":
        case "pool":
        case "buffer":
          this.items.push(arg);
          break;
        case "nominal":
          this.add(...arg.buffers);
          break;
        case "array":
          this.add(...arg);
          break;
        // empty | spent → skip
      }
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
