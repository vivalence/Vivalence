import { Router } from "oak";

import withError from "./lib/error.js";
import withRoute from "./lib/route.js";
import createCall from "./lib/caller.js";
import { pre, post } from "./lib/middleware.js";

export default function createRouter() {
  const router = new Router();

  withError(router);

  router.create = createRouter;
  router.route = withRoute(router);
  router.call = { create: createCall };

  router.middleware = [];
  router.middleware.pre = pre(router);
  router.middleware.post = post(router);

  router.mw = router.middleware;

  router.route("/status", (body, ctx) => ({ status: "ok" }));

  return router;
}
