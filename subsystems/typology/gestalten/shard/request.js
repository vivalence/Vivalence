export const authorize = (auth) => {
  return async (ctx, next) => {
    console.log("request auth depracated in favor of connection auth.");
    ctx.request.headers.Authorization = `Bearer ${auth.access}`;
    await next();
  };
};
