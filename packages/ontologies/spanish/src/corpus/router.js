import Router from "@koa/router";

import remedy from "./remedy";
import tags from "./tags/router";
import units from "./units/router";

const router = new Router();

router.use("/tags", tags.routes(), tags.allowedMethods());
router.use("/units", units.routes(), units.allowedMethods());

router.post("/remedy", async (ctx, next) => {
    const { issue } = ctx.request.body;

    if (issue.context.unit) {
        const { data: unit } = await ctx.locals.supabase
            .from("Unit")
            .select(`*, _TagToUnit(*, Tag: A (*))`)
            .eq("id", issue.context.unit.id)
            .single();

        issue.context.unit = unit;
        issue.context.unit.tags = unit._TagToUnit.map((r) => r.Tag);
        delete issue.context.unit._TagToUnit;
    }

    const result = await remedy(issue, ctx.locals);

    ctx.body = { data: result };
});

export default router;
