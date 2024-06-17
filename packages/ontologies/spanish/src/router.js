import Router from "@koa/router";

import api from "./api/router";
import corpus from "./corpus/router";
import games from "./games/router";

const router = new Router();

router.use("/api", api.routes(), api.allowedMethods());
router.use("/corpus", corpus.routes(), corpus.allowedMethods());
router.use("/games", games.routes(), games.allowedMethods());

export default router;
