export default function route(router) {
  return (path, handler) => {
    router.all(path, async (ctx) => {
      let body = {};
      try {
        body = await ctx.request.body.json();
      } catch (e) {}
      try {
        ctx.response.body = { data: await handler(body, ctx) };
      } catch (error) {
        console.error("[ERROR] router.route handler");
        console.error(error);
        ctx.response.status = 500;
        ctx.response.body = { error: error.toString() };
      }
    });
  };
}
