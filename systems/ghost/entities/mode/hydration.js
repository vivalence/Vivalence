import { Vector } from "@vivalence/typology";

export const hydration = new Vector().use(async (ctx, next) => {
  await next();
  ctx.entity.runtime = ctx.runtime;
  ctx.entity.host = ctx.entity.daemon === null ? ctx.runtime : ctx.entity.daemon;
  ctx.entity.reference = ctx.entity.host.reference.branch(`/mode/${ctx.entity.type}/${ctx.entity.slug}`);
  ctx.entity.connection = ctx.entity.host.aperture.branch(`/mode/${ctx.entity.type}/${ctx.entity.slug}`);
});
