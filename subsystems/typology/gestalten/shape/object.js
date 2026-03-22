import { is, middleware } from "@vivalence/typology";

export const strategy = (apply, effect) => async (input) => {
  const ctx = { input };
  await apply(ctx, async (c) => {
    const result = await effect(c);
    if (!is.undefined(result)) c.output = result;
  });
  return ctx.output;
};

export function object(vector, carry = strategy) {
  const output = {};

  for (const [pattern, descendant] of vector.trajectories) {
    output[pattern.nature] = object(
      descendant,
      vector.carry.length
        ? (apply, effect) => carry(middleware.compose([...vector.carry, apply]), effect)
        : carry,
    );
  }

  for (const [pattern, effect] of vector.effects) {
    const key = pattern.nature;
    const fn = carry(middleware.compose(vector.carry), effect);
    if (output[key]) Object.assign(fn, output[key]);
    output[key] = fn;
  }

  return output;
}

export function proxy(vector, carry = strategy) {
  return proxyNode(vector, carry, {});
}

function proxyEffect(carry, mw, fn, params) {
  return carry(mw, (ctx) => {
    ctx.params = { ...params, ...ctx.params };
    return fn(ctx);
  });
}

function proxyNode(vector, carry, params) {
  const next = vector.carry.length
    ? (apply, fn) => carry(middleware.compose([...vector.carry, apply]), fn)
    : carry;
  const mw = middleware.compose(vector.carry);

  return new Proxy(Object.create(null), {
    get(_, key) {
      if (typeof key === "symbol") return undefined;

      for (const [pattern, fn] of vector.effects) {
        if (pattern.type === "literal" && pattern.nature === key)
          return proxyEffect(carry, mw, fn, params);
      }

      for (const [pattern, descendant] of vector.trajectories) {
        if (pattern.type === "literal" && pattern.nature === key)
          return proxyNode(descendant, next, params);
      }

      for (const [pattern, fn] of vector.effects) {
        if (pattern.type === "parameter" || pattern.type === "wildcard") {
          const merged =
            pattern.type === "parameter" ? { ...params, [pattern.nature.slice(1)]: key } : params;
          return proxyEffect(carry, mw, fn, merged);
        }
      }

      for (const [pattern, descendant] of vector.trajectories) {
        if (pattern.type === "parameter" || pattern.type === "wildcard") {
          const merged =
            pattern.type === "parameter" ? { ...params, [pattern.nature.slice(1)]: key } : params;
          return proxyNode(descendant, next, merged);
        }
      }

      for (const [pattern, fn] of vector.effects) {
        if (pattern.type === "remainder") return proxyRemainder(carry, mw, fn, params, 0, key);
      }
    },
  });
}

function proxyRemainder(carry, mw, fn, params, index, key) {
  const merged = { ...params, [index]: key };
  const invoke = proxyEffect(carry, mw, fn, merged);
  return new Proxy(invoke, {
    get(target, next) {
      if (typeof next === "symbol") return target[next];
      return proxyRemainder(carry, mw, fn, merged, index + 1, next);
    },
  });
}
