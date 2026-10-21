import { Vector } from "@vivalence/typology";

export const hydration = new Vector().use(async (ctx, next) => {
  await next();
  ctx.entity.url = ctx.runtime.attach.url.branch(`/file/${ctx.entity.id}`).absolute;
});
