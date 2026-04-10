import { Entity } from "../prototypes/entity.js";

export class Turn extends Entity {
  role = null;
  parts = [];
  meta = null;
  thread = null;
  mode = null;
  parent = null;
}

export const TurnSchema = {
  name: "turn",
  kind: () => Turn,
  remote: { endpoint: "/userspace/entities/turn" },

  use: [
    async (ctx, next) => {
      await next();
      if (ctx.entity.thread)
        ctx.entity.thread =
          ctx.daemon.entities.thread.findOneLocal({
            id: ctx.entity.thread?.id ?? ctx.entity.thread,
          }) ?? ctx.entity.thread;
      if (ctx.entity.mode)
        ctx.entity.mode =
          ctx.daemon.entities.mode.findOneLocal({
            id: ctx.entity.mode?.id ?? ctx.entity.mode,
          }) ?? ctx.entity.mode;
    },
  ],
};
