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
      populate: ["retentions"],
    });
    if (!sentences.length) return;

    const practice = ctx.pool.section();

    for (const sentence of sentences) {
      const vocalized = sentence.traits?.includes("VOCALIZED");

      if (!sentence.retention || sentence.retention.is.virgin) {
        practice.add(
          game["rep-o-gram"].emit.shadow.literals({
            literal: sentence,
            recall: "LEARNING",
            preview: { speed: { rate: "SLOW" } },
          }),
        );
      } else if (vocalized) {
        practice.add(
          game["rep-o-gram"].emit.listen.literal({
            literal: sentence,
            gameplay: sentence.retention.is.failed ? "PICK" : "TYPE",
            recall: "LEARNING",
          }),
        );
      } else if (sentence.retention.is.failed) {
        practice.add(
          game["rep-o-gram"].emit.shadow.literals({
            literal: sentence,
            recall: "LEARNING",
            preview: { speed: { rate: "SLOW" } },
          }),
        );
      } else {
        practice.add(
          game["rep-o-gram"].emit.write.literals({ literal: sentence, recall: "LEARNING" }),
        );
      }
    }

    practice.apply(array.shuffle);
  },
);
