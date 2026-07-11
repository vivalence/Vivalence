import { Vector, v } from "@vivalence/typology";

export const riddle = new Vector().open(
  {
    nature: "/riddle",
    input: v.object({
      // count: v.integer({ minimum: 1, maximum: 5 }).default(1), // riddles to cast
      // subject: v.string().optional(), // riddler owns the subject list, validates on its side
      // symbols: v.array(v.string()).optional(),
      // instructions: v.string().optional(),
      // limit: v.integer({ default: 12 }), // pool size per riddle
      // thread: v.string().optional(), // binds the emitted buffers to the caller's thread
    }),
  },
  async (ctx) => {
    // old
    // const steered = ctx.input.subject || ctx.input.symbols?.length;
    // const literals = steered
    //   ? undefined
    //   : (
    //       await ctx.daemon.entities.literal.byStrength(
    //         {},
    //         { limit: ctx.input.limit * ctx.input.count },
    //       )
    //     ).map((literal) => literal.id);
    // ctx.pool.add(
    //   await ctx.daemon.modes.game.riddler.emit.riddle.cast({
    //     riddles: ctx.input.count,
    //     literals,
    //     subject: ctx.input.subject,
    //     symbols: ctx.input.symbols,
    //     instructions: ctx.input.instructions,
    //     limit: ctx.input.limit,
    //     thread: ctx.input.thread,
    //   }),
    // );
  },
);
