import { middleware, steer, Signal } from "@vivalence/typology";

const route = (steps) => new Signal(steps.map((s) => s.nature).join("/"));

export const object = (vector, execute = steer.strategy.request) =>
  steer.trie.fold(vector, {
    node: (f) => {
      const namespace = {};
      for (const child of f.trajectories) namespace[child.key] = child.namespace;
      const compiled = f.effect !== undefined ? execute(f.carry, f.effect, f.steps, route(f.steps)) : undefined;
      const value = compiled !== undefined ? Object.assign(compiled, namespace) : namespace;
      return f.signature ? { key: f.signature.nature, namespace: value } : value;
    },
  });

export function proxy(vector, execute = steer.strategy.request) {
  return proxyNode(vector, execute, {}, new Signal(), [], []);
}

const wrap = (fn, params) => (ctx) => {
  ctx.params = { ...params, ...ctx.params };
  return fn(ctx);
};

const matchChild = (vector, key, params) => {
  let param, wild, rem;
  for (const [pattern, child] of vector.trajectories) {
    if (pattern.type === "literal" && pattern.nature === key) return { pattern, child, params };
    if (pattern.type === "parameter" && !param)
      param = { pattern, child, params: { ...params, [pattern.nature.slice(1)]: key } };
    if (pattern.type === "wildcard" && !wild) wild = { pattern, child, params };
    if (pattern.type === "remainder" && !rem) rem = { pattern, child, params };
  }
  return param ?? wild ?? rem;
};

function proxyNode(vector, execute, params, signal, steps, carry) {
  const here = [...carry, ...vector.carry];

  return new Proxy(Object.create(null), {
    get(_, key) {
      if (typeof key === "symbol") return undefined;

      const m = matchChild(vector, key, params);
      if (!m) return undefined;

      const { pattern, child, params: merged } = m;
      const childSteps = [...steps, pattern];
      const childSignal = signal.branch(key);
      const childCarry = [...here, ...child.carry];

      if (pattern.type === "remainder" && child.effect != null)
        return proxyRemainder(execute, childCarry, child.effect, merged, 0, key, childSteps, signal);

      const sub = child.trajectories.size
        ? proxyNode(child, execute, merged, childSignal, childSteps, here)
        : undefined;

      if (child.effect != null) {
        const callable = execute(middleware.compose(childCarry), wrap(child.effect, merged), childSteps, childSignal);
        return sub ? Object.assign(callable, sub) : callable;
      }

      return sub;
    },
  });
}

function proxyRemainder(execute, carry, fn, params, index, key, steps, signal) {
  const merged = { ...params, [index]: key };
  const invoke = execute(middleware.compose(carry), wrap(fn, merged), steps, signal.branch(key));
  return new Proxy(invoke, {
    get(target, next) {
      if (typeof next === "symbol") return target[next];
      return proxyRemainder(execute, carry, fn, merged, index + 1, next, steps, signal.branch(key));
    },
  });
}
