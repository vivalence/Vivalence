import { Router } from "oak";
import { compose } from "oak/middleware";
import { join } from "$std/path/mod.ts";
import config from "@vivalence/config";
import notFoundMiddleware from "./middleware/notFound.js";

function caller(runtime) {
  return (requestContext) => {
    return async (path, body = {}, params = {}) => {
      // console.log("caller request:path", path, body, params);
      const ctx = {
        state: requestContext ? { ...requestContext.state } : {},
        locals: requestContext ? { ...requestContext.locals } : {},
        // ...(requestContext || {}),
        request: {
          method: params.method || "POST",
          body: { json: async () => body },
          headers: requestContext?.request.headers || new Headers(),
          // ...(requestContext ? { ...requestContext.request } : {}),
          url: new URL(join(config.env.get("DAEMON_URL"), path)),
        },
        response: { body: {}, status: 404, headers: new Headers() },
        runtime,
      };

      const composedMiddleware = compose([
        notFoundMiddleware,
        runtime.router.routes(),
        runtime.router.allowedMethods(),
      ]);

      await composedMiddleware(ctx);
      return ctx.response.body.data || ctx.response.body;
    };
  };
}

function route(router) {
  return (path, handler) => {
    router.all(path, async (ctx) => {
      let body = {};
      try {
        body = await ctx.request.body.json();
      } catch (e) {}
      try {
        ctx.response.body = { data: await handler(body, ctx) };
      } catch (error) {
        ctx.response.status = 500;
        ctx.response.body = { error };
      }
    });
  };
}

export default function createRouter() {
  const router = new Router();
  router.route = route(router);
  router.caller = caller;
  return router;
}
