import { Vector, v } from "@vivalence/typology";
import { POOL_FACTOR, weightedSample } from "./sample.js";

export const activation = new Vector().open(
  {
    nature: "/activation",
    input: v.object({
      count: v.integer({ minimum: 5, maximum: 50 }).default(20),
      gameplay: v.string().optional(),
      thread: v.string().optional(),
    }),
  },
  async (ctx) => {
    const pool = await ctx.daemon.entities.literal.feed(
      { symbols: ["word"] },
      { limit: Math.ceil(ctx.input.count * POOL_FACTOR) },
    );
    const literals = weightedSample(pool, ctx.input.count);
    if (!literals.length) return [];

    ctx.pool.add(
      await ctx.daemon.modes.game.nyan.emit.literals({
        literals,
        gameplay: ctx.input.gameplay,
        thread: ctx.input.thread,
      }),
    );
  },
);
