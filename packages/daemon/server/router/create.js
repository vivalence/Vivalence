import { Router } from "oak";

import error from "./lib/error.js";
import caller from "./lib/caller.js";
import route from "./lib/route.js";
import { pre, post } from "./lib/middleware.js";

export default function createRouter() {
  const router = new Router();

  error(router);

  router.create = createRouter;
  router.route = route(router);
  router.caller = caller;
  router.middleware = [];
  router.middleware.pre = pre(router);
  router.middleware.post = post(router);

  router.route("/status", (body, ctx) => ({ status: "ok" }));

  return router;
}
