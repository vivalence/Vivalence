import { Vector, belt, v } from "@vivalence/typology";

export const hydration = new Vector().use(async (ctx, next) => {
  await next();
  const DOCKED = v.traits.Docked.repair(v.traits.Docked.cast(ctx.entity.trait.DOCKED));
  const trait = { ...ctx.entity.trait, DOCKED };
  ctx.entity.trait = belt.traits.cast({ ...ctx.entity, trait }, v.traits.terminal);
  ctx.entity.client = ctx.client;
  ctx.entity.repository = ctx.repository;
  ctx.entity.controller = ctx.client.controller.branch(`terminal/${ctx.entity.id}`);
});
