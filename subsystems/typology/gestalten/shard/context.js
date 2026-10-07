import { contexts, v, ValidationError } from "@vivalence/typology";

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

export const lift = (set, bearer) => Object.fromEntries(Object.keys(set).map((word) => [word, bearer[word]]));

export const spread = (set, bearer) => async (ctx, next) => {
  Object.assign(ctx, lift(set, bearer));
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
