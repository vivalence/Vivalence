import { Vector, v } from "@vivalence/typology";

export const translation = new Vector().open(
  {
    nature: "/translation",
    valence: `Start a translation-writing session on the learner's screen — type the translation from memory, per-token scoring. Pick count.`,
    input: v.object({
      count: v.integer({ minimum: 1, maximum: 50 }).default(20),
    }),
  },
  async (ctx) => {
    const emission = await ctx.mode.emit.deck({
      count: ctx.input.count,
      games: ["write"],
      thread: ctx.thread,
    });
    return {
      message: emission.output.buffer.length
        ? `Translation session on screen.`
        : "Nothing available for that selection.",
      ...emission.output,
    };
  },
);
