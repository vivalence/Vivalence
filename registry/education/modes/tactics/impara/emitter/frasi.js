import { array, v, Vector } from "@vivalence/typology";

export const frasi = new Vector().open(
  {
    nature: "/frasi",
    input: v.object({
      where: v.object({}).optional(),
      limit: v.integer({ minimum: 1, maximum: 20 }).default(6),
      thread: v.string().optional(),
    }),
  },
  async (ctx) => {
    const game = ctx.daemon.modes.game;

    const sentences = await ctx.daemon.entities.literal.feed(ctx.input.where, {
      limit: ctx.input.limit,
      blacklist: ctx.input.blacklist,
      populate: ["memories"],
    });
    if (!sentences.length) return;

    const practice = ctx.pool.section();

    for (const sentence of sentences) {
      const vocalized = sentence.traits?.includes("VOCALIZED");

      if (!sentence.memory || sentence.memory.is.virgin) {
        practice.add(
          game.shadow.emit.literals({
            literal: sentence,
            recall: "LEARNING",
            speed: { rate: "SLOW" },
          }),
        );
      } else if (vocalized) {
        practice.add(
          game.listen.emit.literal({
            literal: sentence,
            gameplay: sentence.memory.is.failed ? "PICK" : "TYPE",
            recall: "LEARNING",
          }),
        );
      } else if (sentence.memory.is.failed) {
        practice.add(
          game.shadow.emit.literals({
            literal: sentence,
            recall: "LEARNING",
            speed: { rate: "SLOW" },
          }),
        );
      } else {
        practice.add(
          game.write.emit.literals({ literal: sentence, recall: "LEARNING" }),
        );
      }
    }

    practice.apply(array.shuffle);
  },
);
