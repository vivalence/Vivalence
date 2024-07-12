import Router from "@koa/router";

import predict from "./predict";
import validate from "./validate";
import deduplicate from "./deduplicate";

const router = new Router();

router.post("/predict", async (ctx, next) => {
    const input = ctx.request.body;
    const issues = await predict(input, ctx.locals);
    ctx.body = { data: issues };
});

router.post("/validate", async (ctx, next) => {
    const input = ctx.request.body;
    const result = await validate(input, ctx.locals);
    ctx.body = { data: result };
});

router.post("/deduplicate", async (ctx, next) => {
    const { unit } = ctx.request.body;

    if (!["pron", "det"].includes(unit.data.annotation.pos)) {
        return {
            isValid: false,
            message: "Unit deduplication not implemented for pos: " + unit.data.annotation.pos
        };
    }
    const issues = [];

    const validation = await deduplicate(unit, locals);

    if (!validation.isValid) issues.push(...validation.issues);
    issues.forEach((issue) => (issue.context.unit = unit));

    ctx.body = { data: { isValid: issues.length === 0, issues } };
});

export default router;
