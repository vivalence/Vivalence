import * as contexts from "../../schematics/primitives/contexts.js";
import { v } from "../../schematics/index.js";
import { ValidationError } from "../../prototypes/errors/vector.js";

export const bind = (key, value) => async (ctx, next) => {
  ctx[key] = value;
  await next();
};

export const scope = (key, value) => async (ctx, next) => {
  ctx[key] = value;
  await next();
  ctx[key] = null;
  delete ctx[key];
};

export const attach = (key, value) => async (ctx, next) => {
  ctx[key] = value;
  await next();
  ctx[key] = null;
  delete ctx[key];
};

export const lift = (set, source) => Object.fromEntries(Object.keys(set).map((word) => [word, source[word]]));

export const spread = (set, source) => async (ctx, next) => {
  Object.assign(ctx, lift(set, source));
  await next();
};

export const conform = (...sets) => {
  const schema = contexts.of(...sets);
  return async (ctx, next) => {
    const faults = v.faults(schema, ctx);
    if (faults.length) throw new ValidationError(faults, ctx.signal);
    await next();
  };
};
