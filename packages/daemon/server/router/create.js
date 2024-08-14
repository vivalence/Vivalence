import { Router } from "oak";

import caller from "./lib/caller.js";
import route from "./lib/route.js";

export default function createRouter() {
  const router = new Router();
  router.route = route(router);
  router.caller = caller;
  return router;
}
