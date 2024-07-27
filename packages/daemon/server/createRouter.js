import { Router } from "https://deno.land/x/oak/mod.ts";

// not a decorator
const addRouteDecorator = (router) => {
  router.route = (path, handler) => {
    router.all(path, async (ctx) => {
      // doesnt yet handle GET requests
      let body = {};
      try {
        body = await ctx.request.body.json();
      } catch (e) {}
      try {
        ctx.response.body = { data: await handler(body, ctx) };
      } catch (error) {
        ctx.response.body = { error };
      }
    });
  };
  return router;
};

export default function createRouter() {
  const router = new Router();
  return addRouteDecorator(router);
}
