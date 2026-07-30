import { array, random, v, Vector } from "@vivalence/typology";

export const vocabolario = new Vector().open(
  {
    nature: "/vocabolario",
    input: v.object({
      where: v.object({}).optional(),
      limit: v.integer({ minimum: 1, maximum: 40 }).default(12),
      thread: v.string().optional(),
    }),
  },
  async (ctx) => {
    const game = ctx.daemon.modes.game;

    const words = await ctx.daemon.entities.literal.feed(ctx.input.where, {
      limit: ctx.input.limit,
      blacklist: ctx.input.blacklist,
      populate: ["memories"],
    });
    if (!words.length) return;

    const distractors = await ctx.daemon.entities.literal.feed(
      ctx.input.where,
      { limit: 30 },
    );

    const untouched = words.filter((word) =>
      !word.memory || word.memory.is.virgin
    );
    if (untouched.length) {
      ctx.pool.add(
        game.exhibit.emit.present({
          layout: "TABLE",
          title: "Nuove parole",
          literals: untouched,
        }),
      );
    }

    const practice = ctx.pool.section();

    for (const word of words) {
      const vocalized = word.traits?.includes("VOCALIZED");

      if (!word.memory || word.memory.is.virgin) {
        practice.add(
          game.judge.emit.literal({
            literal: word,
            distractors,
            recall: "LEARNING",
            speed: { rate: "SLOW" },
          }),
        );
      } else if (word.memory.is.failed) {
        practice.add(
          game.judge.emit.literal({
            literal: word,
            distractors,
            recall: "LEARNING",
            speed: { rate: "FAST" },
          }),
        );
      } else if (vocalized && random.coinflip(0.5)) {
        practice.add(
          game.listen.emit.literal({
            literal: word,
            distractors,
            gameplay: word.memory.is.weak ? "PICK" : "TYPE",
            recall: "KNOWN",
          }),
        );
      } else if (word.memory.is.weak) {
        practice.add(
          game.pick.emit.literal({ literal: word, recall: "LEARNING" }),
        );
      } else {
        practice.add(
          game.write.emit.literals({ literal: word, recall: "LEARNING" }),
        );
      }
    }

    if (words.length >= 4) {
      practice.add(
        game.match.emit.batch({
          literals: words.slice(0, 6),
          gameplay: "TRANSLATE",
          recall: "LEARNING",
        }),
      );
    }

    practice.apply(array.shuffle);
  },
);
