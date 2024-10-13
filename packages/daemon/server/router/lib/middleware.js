const wrap = (h) => (router) => {
  const y = (handler) => router.middleware.push(h(handler));
  y.inject = h;
  return y;
};

export const pre = wrap((handler) => async (ctx, next) => {
  const body = await ctx.request.body.json();
  ctx.request.body.json = async () => await handler(body, ctx);
  await next();
});

export const post = wrap((handler) => async (ctx, next) => {
  await next();
  if (ctx.response.body) {
    if (!ctx.response.body.data) {
      const body = ctx.response.body;
      ctx.response.body = (await handler(body, ctx)) || body;
    } else if (ctx.response.body.data) {
      const body = ctx.response.body.data;
      ctx.response.body.data = (await handler(body, ctx)) || body;
    }
  }
});
