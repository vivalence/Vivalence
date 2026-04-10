import { Entity } from "../prototypes/entity.js";

export class Intent extends Entity {
  implements(trait) {
    return this.traits?.includes(trait.toUpperCase());
  }
}

export const IntentSchema = {
  name: "intent",
  kind: () => Intent,
  remote: { endpoint: "/entities/intent" },

  use: [
    async (ctx, next) => {
      await next();
      const mode = ctx.daemon.entities.mode.findOneLocal({
        id: ctx.entity.mode?.id ?? ctx.entity.mode,
      });
      if (!mode) throw new Error("Intent's mode not found");
      ctx.entity.mode = mode;
      mode.intents.add(ctx.entity);
    },
  ],
};
