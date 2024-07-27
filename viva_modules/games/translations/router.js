import Router from "@koa/router";

import generate from "./api/generate";
import evaluate from "./api/evaluate";

const router = new Router();

router.post("/generate", async (ctx, next) => {
  const inputs = ctx.request.body;
  const result = await generate(inputs, ctx.locals);
  ctx.body = { data: result };
});

router.post("/evaluate", async (ctx, next) => {
  const inputs = ctx.request.body;
  const result = await evaluate(inputs, ctx.locals);
  ctx.body = { data: result };
});

export default router;
