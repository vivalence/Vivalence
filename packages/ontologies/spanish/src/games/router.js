import Router from "@koa/router";

import conjugations from "./conjugations/router";
import flashcards from "./flashcards/router";
import translations from "./translations/router";

const router = new Router();

router.use("/conjugations", conjugations.routes(), conjugations.allowedMethods());
router.use("/flashcards", flashcards.routes(), flashcards.allowedMethods());
router.use("/translations", translations.routes(), translations.allowedMethods());

export default router;
