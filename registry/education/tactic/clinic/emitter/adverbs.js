import { array } from "@vivalence/typology";

export default async (ctx) => {
  const game = ctx.daemon.modes.game;
  const all = await ctx.daemon.entities.literal.find(
    {
      ...ctx.input.where,
      ontology: "word",
      symbols: [...(ctx.input.where?.symbols ?? []), "word.part-of-speech.adverb"],
    },
    { populate: ["memories"] },
  );
  if (!all.length) return;

  const virgin = all.filter((word) => !word.memory);
  if (virgin.length) {
    ctx.pool.add(
      game.exhibit.emit.present({ layout: "TABLE", title: "Adverbs", literals: virgin }),
    );
  }

  const distractors = all;
  const practice = ctx.pool.section();

  for (const word of all) {
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
    } else if (word.memory.is.weak) {
      practice.add(game.write.emit.literals({ literal: word, recall: "LEARNING" }));
    }
  }

  if (all.length >= 4) {
    practice.add(
      game.match.emit.batch({
        literals: all.slice(0, 6),
        gameplay: "TRANSLATE",
        recall: "LEARNING",
      }),
    );
  }
  practice.apply(array.shuffle);
};
