import { Path, Vector } from "@vivalence/typology";

export const hydration = new Vector().use(async (ctx, next) => {
  await next();
  ctx.entity.runtime = ctx.runtime;
  ctx.entity.reference = new Path(`/daemon/${ctx.entity.slug}`);
  ctx.entity.connection = ctx.runtime.connection.branch(ctx.entity.reference.absolute);
  ctx.entity.aperture = ctx.entity.connection;
});
