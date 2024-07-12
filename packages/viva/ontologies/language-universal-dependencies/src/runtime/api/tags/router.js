import Router from "@koa/router";

import predict from "./predict";
import autocomplete from "./autocomplete";

const router = new Router();

router.post("/predict", async (ctx, next) => {
    const { issue } = ctx.request.body;
    const issues = await predict(input, ctx.locals);
    ctx.body = { data: issues };
});

router.post("/autocomplete", async (ctx, next) => {
    const { issue } = ctx.request.body;
    const result = await autocomplete(input, ctx.locals);
    ctx.body = { data: result };
});

export default router;
