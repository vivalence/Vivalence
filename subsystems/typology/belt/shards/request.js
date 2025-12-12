export const authorize = (auth) => {
  return async (ctx, next) => {
    ctx.request.headers.Authorization = `Bearer ${auth.access}`;
    await next();
  };
};
