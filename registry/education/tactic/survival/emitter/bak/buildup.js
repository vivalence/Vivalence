import { object, array } from "@vivalence/typology";

function extractParadigm(conjugation) {
  const bySlug = new Map(conjugation.uses.getItems().map((form) => [form.slug, form]));
  const symbols = conjugation.symbols.getItems();
  return {
    infinitive: bySlug.get(conjugation.trait.CONJUGATED.infinitive),
    forms: Object.values(conjugation.trait.CONJUGATED.paradigm)
      .map((slug) => bySlug.get(slug))
      .filter(Boolean),
    tenseSymbol: symbols.find((symbol) => symbol.slug.startsWith("word.tense.")),
    moodSymbol: symbols.find((symbol) => symbol.slug.startsWith("word.mood.")),
  };
}

export default async (ctx) => {
  const [conjugation] = await ctx.daemon.entities.literal.feed(
    { ontology: "conjugation", ...ctx.input.where },
    {
      limit: 1,
      blacklist: ctx.input.blacklist,
      populate: ["uses.memories", "symbols", "memories"],
    },
  );
  if (!conjugation) return;

  const { infinitive, forms, tenseSymbol, moodSymbol } = extractParadigm(conjugation);
  if (!forms.length) return;

  const weakVerbs = await ctx.daemon.entities.literal.byStrength(
    object.merge(ctx.input.where, { ontology: "word" }, { symbols: ["word.part-of-speech.verb"] }),
    {
      limit: 4,
      blacklist: { literals: [...forms.map((form) => form.id), infinitive?.id].filter(Boolean) },
    },
  );
  const sentences = await ctx.daemon.entities.literal.byStrength(
    {
      ontology: "sentence",
      uses: { $in: [...forms, ...weakVerbs].map((literal) => literal.id) },
      memories: { strength: { $gte: 0.1 } },
    },
    { limit: 2, populate: ["memories"] },
  );

  if (conjugation.memory?.is?.virgin ?? true) {
    ctx.pool.add(
      ctx.daemon.modes.game.exhibit.emit.present({
        layout: "TABLE",
        title: infinitive?.trait?.TRANSLATED?.learning ?? "",
        subtitle: [tenseSymbol?.trait?.LABELED?.name, moodSymbol?.trait?.LABELED?.name]
          .filter(Boolean)
          .join(" "),
        literals: forms,
      }),
    );
  }
  ctx.pool.add(
    ctx.daemon.modes.game.paradigm.emit.conjugation({
      conjugation,
      recall: "LEARNING",
      feedback: "realtime",
      order: "ordered",
    }),
  );

  const practice = ctx.pool.section();
  const distractors = [...forms, ...weakVerbs];

  for (const word of [...forms, ...weakVerbs]) {
    if (!word.memory || word.memory.is.virgin) {
      practice.add(
        ctx.daemon.modes.game.pick.emit.literal({
          literal: word,
          distractors,
          recall: "LEARNING",
        }),
      );
    } else if (word.memory.is.weak) {
      practice.add(ctx.daemon.modes.game.conjugation.emit.literal({ literal: word }));
    } else if (word.memory.is.failed) {
      practice.add(
        ctx.daemon.modes.game.write.emit.literals({ literal: word, recall: "LEARNING" }),
      );
    }
  }
  practice.apply(array.shuffle);

  for (const sentence of sentences) {
    if (!sentence.memory || sentence.memory.is.failed || sentence.memory.is.virgin) {
      ctx.pool.add(
        ctx.daemon.modes.game.shadow.emit.literals({
          literal: sentence,
          recall: "LEARNING",
          speed: { rate: "SLOW" },
        }),
      );
    } else if (sentence.memory.is.weak) {
      ctx.pool.add(
        ctx.daemon.modes.game.write.emit.literals({
          literal: sentence,
          recall: "LEARNING",
        }),
      );
    }
  }
};
