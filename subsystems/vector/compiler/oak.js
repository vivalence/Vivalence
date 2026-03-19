import { Router } from "@oak/oak/router";
import { compose } from "@oak/oak/middleware";

export function oak(vector) {
  const router = new Router();
  walk(router, vector, "", []);
  return compose([patch, router.routes(), router.allowedMethods()]);
}

async function patch(ctx, next) {
  ctx.input = ctx.request.hasBody
    ? await ctx.request.body.json().catch(() => null)
    : null;

  await next();

  if (ctx.output !== undefined) {
    ctx.response.type = ctx.response.type || "application/json";
    if (ctx.output instanceof Uint8Array || ctx.output instanceof ReadableStream) {
      ctx.response.body = ctx.output;
    } else {
      ctx.response.body = JSON.stringify(ctx.output);
    }
  }
}

function walk(router, vector, prefix, carry) {
  const mws = [...carry, ...vector.carry];

  for (const [pattern, effect] of vector.effects) {
    const path = normalize(prefix, pattern.nature);
    router.all(path, ...mws, dispatch(effect));
  }

  for (const [pattern, descendant] of vector.trajectories) {
    const next = prefix + "/" + pattern.nature;
    walk(router, descendant, next, mws);
  }
}

function normalize(prefix, nature) {
  return "/" + (prefix + "/" + nature).split("/").filter(Boolean).join("/");
}

function dispatch(effect) {
  return async (ctx) => {
    if (effect.length === 0) ctx.output = await effect();
    else if (effect.length === 1) ctx.output = await effect(ctx);
    else if (effect.length === 2) ctx.output = await effect(ctx.input, ctx);
  };
}
