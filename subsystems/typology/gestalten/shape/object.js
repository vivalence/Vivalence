import { middleware, steer, Signal } from "@vivalence/typology";

// the eager namespace builder: a Vector trie → nested callable object, where a node
// that is BOTH a leaf and a branch becomes a callable carrying its sub-namespace.
// A thin step over steer.trie.fold — the carry accumulates in the frame (root outermost),
// so the old execute-wrapping is gone. Descendants carry {key, namespace} so the
// parent can assemble; the root (signature null) returns the bare namespace.
export const object = (vector, execute = steer.strategy.request) =>
  steer.trie.fold(vector, {
    effect: (f) => ({
      key: f.pattern.nature,
      fn: execute(f.carry, f.effect, f.steps, f.signal.branch(f.pattern.nature)),
    }),
    node: (f) => {
      const output = {};
      for (const child of f.trajectories) output[child.key] = child.namespace;
      for (const { key, fn } of f.effects) {
        if (output[key]) Object.assign(fn, output[key]);
        output[key] = fn;
      }
      return f.signature ? { key: f.signature.nature, namespace: output } : output;
    },
  });

export function proxy(vector, execute = steer.strategy.request) {
  return proxyNode(vector, execute, {}, new Signal(), []);
}

function proxyEffect(execute, mw, fn, params, steps, signal) {
  // i thin i ought to loose the symbol and literal dsl here.
  return execute(
    mw,
    (ctx) => {
      ctx.params = { ...params, ...ctx.params };
      return fn(ctx);
    },
    steps,
    signal,
  );
}

function proxyNode(vector, execute, params, signal, steps) {
  const next = vector.carry.length
    ? (apply, effect, s, sig) =>
        execute(middleware.compose([...vector.carry, apply]), effect, s, sig)
    : execute;
  const mw = middleware.compose(vector.carry);

  return new Proxy(Object.create(null), {
    get(_, key) {
      if (typeof key === "symbol") return undefined;

      for (const [pattern, fn] of vector.effects) {
        if (pattern.type === "literal" && pattern.nature === key)
          return proxyEffect(execute, mw, fn, params, [...steps, pattern], signal.branch(key));
      }

      for (const [pattern, descendant] of vector.trajectories) {
        if (pattern.type === "literal" && pattern.nature === key)
          return proxyNode(descendant, next, params, signal.branch(key), [...steps, pattern]);
      }

      for (const [pattern, fn] of vector.effects) {
        if (pattern.type === "parameter" || pattern.type === "wildcard") {
          const merged =
            pattern.type === "parameter" ? { ...params, [pattern.nature.slice(1)]: key } : params;
          return proxyEffect(execute, mw, fn, merged, [...steps, pattern], signal.branch(key));
        }
      }

      for (const [pattern, descendant] of vector.trajectories) {
        if (pattern.type === "parameter" || pattern.type === "wildcard") {
          const merged =
            pattern.type === "parameter" ? { ...params, [pattern.nature.slice(1)]: key } : params;
          return proxyNode(descendant, next, merged, signal.branch(key), [...steps, pattern]);
        }
      }

      for (const [pattern, fn] of vector.effects) {
        if (pattern.type === "remainder")
          return proxyRemainder(execute, mw, fn, params, 0, key, [...steps, pattern], signal);
      }
    },
  });
}

function proxyRemainder(execute, mw, fn, params, index, key, steps, signal) {
  const merged = { ...params, [index]: key };
  const invoke = proxyEffect(execute, mw, fn, merged, steps, signal.branch(key));
  return new Proxy(invoke, {
    get(target, next) {
      if (typeof next === "symbol") return target[next]; // are symbol and literal part of the language here?
      return proxyRemainder(execute, mw, fn, merged, index + 1, next, steps, signal.branch(key));
    },
  });
}
