import { Router } from "oak";

import createCall from "./lib/caller.js";
import withError from "./lib/error.js";
import { post, pre } from "./lib/middleware.js";
import withRoute from "./lib/route.js";

class VivaRouter extends Router {
  constructor() {
    super();
  }
}

export default function createRouter() {
  const router = new VivaRouter();

  withError(router);

  router.create = createRouter;
  router.route = withRoute(router);
  router.call = { create: createCall };

  router.middleware = [];
  router.middleware.pre = pre(router);
  router.middleware.post = post(router);

  router.mw = router.middleware;

  router.route("/status", (body, ctx) => ({ status: "ok" }));
  router.use(async (ctx, next) => {
    // trace everything:
    // console.log(ctx.request.url.pathname);
    await next();
  });

  return router;
}
