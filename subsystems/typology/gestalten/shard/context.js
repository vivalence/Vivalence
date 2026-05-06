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
