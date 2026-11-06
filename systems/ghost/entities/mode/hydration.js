import { Vector } from "@vivalence/typology";

export const hydration = new Vector().use(async (ctx, next) => {
  await next();
  const daemon = ctx.entity.daemon === null ? ctx.runtime : ctx.entity.daemon;
  ctx.entity.reference = daemon.reference.branch(`/mode/${ctx.entity.type}/${ctx.entity.slug}`);
  ctx.entity.connection = daemon.aperture.branch(`/mode/${ctx.entity.type}/${ctx.entity.slug}`);
  ctx.entity.entities = ctx.runtime.entities.branch(ctx.entity.connection, ["literal", "symbol", "view", "file", "note", "thread", "turn", "buffer"]);
});
