import { Vector, v } from "@vivalence/typology";

export const flashcard = new Vector().open(
  {
    nature: "/flashcard",
    input: v.object({
      count: v.integer({ minimum: 1, maximum: 50 }).default(20),
      thread: v.string().optional(),
    }),
  },
  async (ctx) => {
    const buffer = await ctx.daemon.modes.game["rep-o-gram"].emit.flashcard.feed({
      count: ctx.input.count,
      thread: ctx.input.thread,
    });
    if (buffer && !Array.isArray(buffer)) ctx.pool.add(buffer);
  },
);
