const wrap = (container) => (router) => {
  const executer = (handler) => router.middleware.push(container(handler));
  executer.compose = container;
  executer.inject = (...x) => {
    console.log("legacy middleware inject is deprecated, use compose instead");
    return container(...x);
  };
  return executer;
};

export const pre = wrap((handler) => async (ctx, next) => {
  if (ctx.request.body.has) {
    const body = await ctx.request.body.json();
    ctx.request.body.json = async () => await handler(body, ctx);
  }
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
