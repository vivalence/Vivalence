export const attach = (key, val) => async (ctx, next) => {
  ctx[key] = val;
  return await next();
};
