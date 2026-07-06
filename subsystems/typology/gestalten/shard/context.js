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

// export const fold = (vector, apply) => {vector.use(async (ctx, next) => (apply(ctx), next())); return vector;};
