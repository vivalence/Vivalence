import Router from "@koa/router";

import generate from "./api/generate";
import evaluate from "./api/evaluate";

const router = new Router();

router.post("/generate/fromTagIds", async (ctx, next) => {
  const inputs = ctx.request.body;
  const result = await generate.fromTagIds(inputs, ctx.locals);
  ctx.body = { data: result };
});

router.post("/generate/fromUnitIds", async (ctx, next) => {
  const inputs = ctx.request.body;
  const result = await generate.fromUnitIds(inputs, ctx.locals);
  ctx.body = { data: result };
});

router.post("/generate/fromUnits", async (ctx, next) => {
  const inputs = ctx.request.body;
  const result = await generate.fromUnits(inputs, ctx.locals);
  ctx.body = { data: result };
});

router.post("/evaluate", async (ctx, next) => {
  const inputs = ctx.request.body;
  const result = await evaluate(inputs, ctx.locals);
  ctx.body = { data: result };
});

export default router;
