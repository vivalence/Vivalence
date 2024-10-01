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

    router.all(path, ...middleware, async (ctx) => {
      let body = {};
      try {
        if (ctx.request.body) {
          if (typeof ctx.request.body.json === "function") {
            body = await ctx.request.body.json();
          } else if (typeof ctx.request.body === "object") {
            body = ctx.request.body;
          }
        }
      } catch (e) {
        console.error("[ERROR] @daemon/server/router/route.js - body parsing");

        console.error(e);
      }
      try {
        const data = await handler(body, ctx);
        if (data && data.error) throw data.error;
        ctx.response.body = { data };
      } catch (error) {
        console.error("[ERROR] @router.route handler @", path);
        console.trace(error);

        ctx.response.body = { error };
        ctx.response.status = 500;
      }
    });
  };
}
