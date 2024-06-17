import Router from "@koa/router";

import generate from "./api/generate";
import evaluate from "./api/evaluate";

const router = new Router();

// @lj: future
// import Component from "./ui/Conjugations.svelte"; router.get("/ui/:filename", async (ctx) => {const fullPath = path.join(__dirname, "ui", ctx.params.filename); console.log("Serving file:", fullPath); try {const fileContent = fs.readFileSync(fullPath, "utf-8"); ctx.body = fileContent; ctx.type = "application/javascript";} catch (err) {ctx.status = 404; ctx.body = "File not found";}});

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
