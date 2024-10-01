export function pre(router) {
  return async function (handler) {
    router.middleware.push(async (ctx, next) => {
      const body = await ctx.request.body.json();
      ctx.request.body.json = async () => await handler(body, ctx);
      await next();
    });
  };
}

export function post(router) {
  return async function (handler) {
    router.middleware.push(async (ctx, next) => {
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
  };
}
