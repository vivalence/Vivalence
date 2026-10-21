import { Vector, belt, v } from "@vivalence/typology";

export const hydration = new Vector().use(async (ctx, next) => {
  await next();
  ctx.entity.trait = belt.traits.cast(ctx.entity, v.buffer.traits);
  ctx.entity.on.release(() => ctx.runtime.entities.buffer.removeOne({ id: ctx.entity.id }));
});
