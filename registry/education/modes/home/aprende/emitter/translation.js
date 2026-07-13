import { Vector, v } from "@vivalence/typology";

export const translation = new Vector().open(
  {
    nature: "/translation",
    input: v.object({
      count: v.integer({ minimum: 1, maximum: 50 }).default(20),
      thread: v.string().optional(),
    }),
  },
  async (ctx) => {
    const buffer = await ctx.daemon.modes.game.write.emit.feed({
      limit: ctx.input.count,
      thread: ctx.input.thread,
    });
    if (buffer && !Array.isArray(buffer)) ctx.pool.add(buffer);
  },
);
