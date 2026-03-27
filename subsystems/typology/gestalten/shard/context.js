export const attach = (key, value) => async (ctx, next) => {
  ctx[key] = value;
  await next();
  ctx[key] = null;
  delete ctx[key];
};
