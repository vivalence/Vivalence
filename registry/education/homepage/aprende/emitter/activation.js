import { Vector, v } from "@vivalence/typology";
import { POOL_FACTOR, weightedSample } from "./sample.js";

// activation · the classic typing trainer — weakness-ranked words, rank-weighted-sampled,
// all handed to nyan (one buffer, nyan expands by ontology internally).
export const activation = new Vector().open(
  {
    nature: "/activation",
    input: v.object({
      source: v.enum(["byWeakness", "byDue"], { default: "byWeakness" }),
      count: v.integer({ minimum: 5, maximum: 50 }).default(20),
      gameplay: v.string().optional(),
      thread: v.string().optional(), // binds emitted buffers to the caller's thread
    }),
  },
  async (ctx) => {
    const limit = ctx.input.count * POOL_FACTOR;
    const where = { ontology: "word" },
      opts = { limit };

    // console.log("[aprende/emit/activation]", { input: ctx.input, where, opts });

    const fetch = {
      byWeakness: (limit) => ctx.daemon.entities.literal.byStrength(where, opts),
      byDue: (limit) => ctx.daemon.entities.literal.due(where, opts),
    }[ctx.input.source];

    const pool = await fetch();
    const literals = weightedSample(pool, ctx.input.count);

    if (!literals.length) {
      console.log("[aprende/activationn] NO LITERALS PULLED");
      return [];
    }

    ctx.pool.add(
      await ctx.daemon.modes.game.nyan.emit.literals({
        literals,
        gameplay: ctx.input.gameplay,
        thread: ctx.input.thread,
      }),
    );
  },
);
