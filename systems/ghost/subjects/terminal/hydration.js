import { Vector, belt, v } from "@vivalence/typology";

export const hydration = new Vector().use(async (ctx, next) => {
  await next();
  ctx.entity.trait = belt.traits.cast(ctx.entity, v.traits.terminal);
  ctx.entity.client = ctx.client;
  ctx.entity.runtime = ctx.runtime;
  ctx.entity.repository = ctx.repository;
  ctx.entity.controller = ctx.client.controller.branch(`terminal/${ctx.entity.id}`);
});
