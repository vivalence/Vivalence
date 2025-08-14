export const inject = (runtime) => async (ctx, next) => {
  ctx.runtime = runtime;
  await next();
};
