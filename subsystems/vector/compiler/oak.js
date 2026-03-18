import { Router } from "@oak/oak/router";
import { compose } from "@oak/oak/middleware";

export function oak(vector) {
  const router = new Router();
  walk(router, vector, "", []);
  return compose([router.routes(), router.allowedMethods()]);
}

function walk(router, vector, prefix, carry) {
  const mws = [...carry, ...vector.carry];

  for (const [pattern, effect] of vector.effects) {
    const path = prefix + "/" + pattern.nature;
    router.all(path, ...mws, dispatch(effect));
  }

  for (const [pattern, descendant] of vector.trajectories) {
    const path = prefix + "/" + pattern.nature;
    walk(router, descendant, path, mws);
  }
}

function dispatch(effect) {
  return async (ctx) => {
    if (effect.length === 0) ctx.output = await effect();
    else if (effect.length === 1) ctx.output = await effect(ctx);
    else if (effect.length === 2) ctx.output = await effect(ctx.input, ctx);
  };
}
