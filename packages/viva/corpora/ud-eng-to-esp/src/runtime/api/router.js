import Router from "@koa/router";
import { annotationsFromText, unitFromAnnotation, unitsFromText } from "./index.js";

const router = new Router();

router.post("/annotationsFromText", async (ctx, next) => {
    const annotations = await annotationsFromText(ctx.request.body, ctx.locals, ctx.state);
    ctx.body = { data: annotations };
});

router.post("/unitFromAnnotation", async (ctx, next) => {
    const unit = await unitFromAnnotation(ctx.request.body, ctx.locals, ctx.state);
    ctx.body = { data: unit };
});

router.post("/unitsFromAnnotations", async (ctx, next) => {
    const annotations = ctx.request.body;
    const units = await Promise.all(
        annotations.map(async (annotation) => {
            return await unitFromAnnotation(annotation, ctx.locals, ctx.state);
        })
    );
    ctx.body = { data: units };
});

router.post("/unitsFromText", async (ctx, next) => {
    const { text } = ctx.request.body;
    const units = await unitsFromText({ text }, ctx.locals);
    ctx.body = { data: units };
});

export default router;
