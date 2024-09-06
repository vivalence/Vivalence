// export default function route(router) {
//   return (path, handler) => {
//     router.all(path, async (ctx) => {
//       let body = {};
//       try {
//         body = await ctx.request.body.json();
//       } catch (e) {}
//       try {
//         ctx.response.body = { data: await handler(body, ctx) };
//       } catch (error) {
//         console.error("[ERROR] router.route handler");
//         console.error(error);
//         console.error({ path, body });
//         console.error(JSON.stringify(error, null, 2));
//         ctx.response.status = 500;
//         ctx.response.body = JSON.stringify({ error, path, body });
//       }
//     });
//   };
// }
export default function route(router) {
  return (path, ...args) => {
    if (args.length < 1) {
      throw new Error("At least a path and a handler are required");
    }

    if (typeof path !== "string") {
      throw new Error("Path must be a string");
    }

    const handler = args.pop();
    const middleware = args;

    if (typeof handler !== "function") {
      throw new Error("Handler must be a function");
    }

    router.all(path, ...middleware, async (ctx, next) => {
      let body = {};
      try {
        body = await ctx.request.body.json();
      } catch (e) {}
      try {
        ctx.response.body = { data: await handler(body, ctx) };
      } catch (error) {
        console.error("[ERROR] router.route handler");
        console.error(error);
        console.error({ path, body });
        console.error(JSON.stringify(error, null, 2));
        ctx.response.status = 500;
        ctx.response.body = JSON.stringify({ error, path, body });
      }
      await next();
    });
  };
}
