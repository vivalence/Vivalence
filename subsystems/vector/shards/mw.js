export const identity = (key, val) => async (ctx, next) => {
  ctx[key] = val;
  return await next();
};
