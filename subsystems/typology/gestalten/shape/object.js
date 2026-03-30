import { middleware, steer, Signal } from "@vivalence/typology";

export function object(vector, execute = steer.direct, signal = new Signal(), steps = []) {
  const output = {};

  for (const [pattern, descendant] of vector.trajectories) {
    const child = signal.branch(pattern.nature);
    output[pattern.nature] = object(
      descendant,
      vector.carry.length
        ? (apply, effect, s, sig) => execute(middleware.compose([...vector.carry, apply]), effect, s, sig)
        : execute,
      child,
      [...steps, pattern],
    );
  }

  for (const [pattern, effect] of vector.effects) {
    const key = pattern.nature;
    const leaf = signal.branch(pattern.nature);
    const fn = execute(middleware.compose(vector.carry), effect, [...steps, pattern], leaf);
    if (output[key]) Object.assign(fn, output[key]);
    output[key] = fn;
  }

  return output;
}

export function proxy(vector, execute = steer.direct) {
  return proxyNode(vector, execute, {}, new Signal(), []);
}

function proxyEffect(execute, mw, fn, params, steps, signal) {
  return execute(mw, (ctx) => {
    ctx.params = { ...params, ...ctx.params };
    return fn(ctx);
  }, steps, signal);
}

function proxyNode(vector, execute, params, signal, steps) {
  const next = vector.carry.length
    ? (apply, effect, s, sig) => execute(middleware.compose([...vector.carry, apply]), effect, s, sig)
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
        if (pattern.type === "remainder") return proxyRemainder(execute, mw, fn, params, 0, key, [...steps, pattern], signal);
      }
    },
  });
}

function proxyRemainder(execute, mw, fn, params, index, key, steps, signal) {
  const merged = { ...params, [index]: key };
  const invoke = proxyEffect(execute, mw, fn, merged, steps, signal.branch(key));
  return new Proxy(invoke, {
    get(target, next) {
      if (typeof next === "symbol") return target[next];
      return proxyRemainder(execute, mw, fn, merged, index + 1, next, steps, signal.branch(key));
    },
  });
}
