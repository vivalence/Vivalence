import { Vector, v } from "@vivalence/typology";

export const flashcard = new Vector().open(
  {
    nature: "/flashcard",
    valence: `Start a flashcard recall session on the learner's screen — words and sentences, both directions. Pick count.`,
    input: v.object({
      count: v.integer({ minimum: 1, maximum: 50 }).default(20),
    }),
  },
  async (ctx) => {
    const emission = await ctx.mode.emit.deck({
      count: ctx.input.count,
      games: ["flashcard"],
      thread: ctx.input.thread,
    });
    return {
      message: emission.entities.buffer.length
        ? `Flashcards on screen.`
        : "Nothing available for that selection.",
      ...emission,
    };
  },
);
