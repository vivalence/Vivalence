import { Vector, v } from "@vivalence/typology";
import { POOL_FACTOR, weightedSample } from "./sample.js";

export const nyan = new Vector().open(
  {
    nature: "/nyan",
    input: v.object({
      count: v.integer({ minimum: 5, maximum: 50 }).default(20),
      ontology: v.enum(["word", "sentence"]).default("word"),
      gameplay: v.enum(["PLAIN", "SUDDENDEATH"]).default("PLAIN"),
      layout: v.enum(["block", "river"]).default("block"),
      thread: v.string().optional(),
    }),
  },
  async (ctx) => {
    const pool = await ctx.daemon.entities.literal.feed(
      { symbols: [ctx.input.ontology] },
      { limit: Math.ceil(ctx.input.count * POOL_FACTOR) },
    );
    const literals = weightedSample(pool, ctx.input.count);
    if (!literals.length) return [];

    ctx.pool.add(
      await ctx.daemon.modes.game.nyan.emit.literals({
        literals,
        gameplay: ctx.input.gameplay,
        layout: ctx.input.layout,
        thread: ctx.input.thread,
      }),
    );
  },
);
