import { Entity } from "../prototypes/entity.js";

export class Mode extends Entity {
  intents = new Set();

  implements(trait) {
    return this.traits?.includes(trait.toUpperCase());
  }
}

export const ModeSchema = {
  name: "mode",
  kind: () => Mode,
  remote: { endpoint: "/entities/mode" },

  use: [
    async (ctx, next) => {
      await next();
      if (ctx.entity.implements("BUFFERED")) {
        ctx.entity.buffered = await ctx.entity.connection.call("/buffered");
        ctx.entity.buffer = (desc = {}) => ({
          mode: ctx.entity.id,
          data: { ...(ctx.entity.buffered?.schema?.data ?? {}), ...(desc.data ?? {}) },
          literals: desc.literals ?? [],
          symbols: desc.symbols ?? [],
        });
      }
    },

    async (ctx, next) => {
      await next();
      ctx.entity.daemon = ctx.daemon;
      ctx.entity.mount = ctx.mount.branch(`/mode/${ctx.entity.type}/${ctx.entity.slug}`);
      ctx.entity.connection = ctx.connection.branch(ctx.entity.mount.nature);
      ctx.entity.call = ctx.entity.connection.call.bind(ctx.entity.connection);
      ctx.entity.link = ctx.link.branch(`/${ctx.entity.type}/${ctx.entity.slug}`);
      ctx.entity.intents = new Set();
    },
  ],
};
