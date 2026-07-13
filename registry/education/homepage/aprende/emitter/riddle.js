import { Vector, v } from "@vivalence/typology";

// play · the tutor hands riddle steering to the riddler game mode. Any of literals /
// symbols / instructions steer; the riddler owns pool assembly + level sampling. The
// pooled buffers bind the caller's thread via this mode's own EMITTER trait.
export const riddle = new Vector().open(
  {
    nature: "/riddle",
    input: v.object({
      count: v.integer({ minimum: 1, maximum: 5 }).default(1), // riddles to cast
      literals: v.array(v.string()).optional(), // explicit vocabulary ids/slugs
      symbols: v.array(v.string()).optional(), // symbol sets the pool is drawn from
      instructions: v.string().optional(),
      limit: v.integer({ default: 12 }), // level-sample size
      thread: v.string().optional(), // binds the emitted buffers to the caller's thread
    }),
  },
  async (ctx) => {
    ctx.pool.add(
      await ctx.daemon.modes.game.riddler.emit.riddle.fromSymbols({
        literals: ctx.input.literals,
        symbols: ctx.input.symbols,
        instructions: ctx.input.instructions,
        numberOfRiddles: ctx.input.count,
        levelPoolSize: ctx.input.limit,
      }),
    );
  },
);
