const wrap = (router, composer) => {
  const executer = (handler) => {
    router.middleware.push(composer(handler));
  };
  executer.compose = composer;
  return executer;
};

export const pre = (router) =>
  wrap(router, (handler) => {
    return async function (ctx, next) {
      // console.log(ctx.request.body.has, ctx.request.body.json);
      if (ctx.request.body.has !== false && ctx.request.body.json) {
        const body = await ctx.request.body.json();
        ctx.request.body.json = async () => await handler(body, ctx);
      }
      await next();
    };
  });

export const post = (router) =>
  wrap(router, (handler) => {
    return async function (ctx, next) {
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
    };
  });
