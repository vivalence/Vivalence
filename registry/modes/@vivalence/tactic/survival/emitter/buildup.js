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

function pickWeakForms(conjugation, forms, count) {
  const formIds = new Set(forms.map((form) => form.id));
  return conjugation.uses
    .getItems()
    .filter((literal) => formIds.has(literal.id))
    .slice(0, count);
}

async function fetchWeakVerbs(ctx, { forms, infinitive, count }) {
  return ctx.daemon.entities.literal.byStrength(
    object.merge(ctx.input.where, { ontology: "word" }, { symbols: ["word.part-of-speech.verb"] }),
    {
      limit: count,
      blacklist: { literals: [...forms.map((form) => form.id), infinitive?.id].filter(Boolean) },
    },
  );
}

async function fetchContextSentences(ctx, { literals, count }) {
  return ctx.daemon.entities.literal.byStrength(
    {
      ontology: "sentence",
      uses: { $in: literals.map((literal) => literal.id) },
      memories: { strength: { $gte: 0.1 } },
    },
    { limit: count, populate: ["memories"] },
  );
}

function emitExhibit(ctx, { conjugation, infinitive, forms, tenseSymbol, moodSymbol }) {
  ctx.pool.add(
    (conjugation.memory?.is?.virgin ?? true) &&
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

function emitPick(ctx, { weakForms, weakVerbs, forms }) {
  ctx.pool
    .section(
      [...weakForms, ...weakVerbs].map((literal) =>
        ctx.daemon.modes.game.pick.emit.literal({
          literal,
          distractors: [...forms, ...weakVerbs],
          recall: "LEARNING",
        }),
      ),
    )
    .apply(array.shuffle);
}

function emitMatch(ctx, { weakForms, weakVerbs }) {
  ctx.pool.add(
    ctx.daemon.modes.game.match.emit.batch({
      literals: [...weakForms, ...weakVerbs],
      gameplay: "TRANSLATE",
      recall: "LEARNING",
    }),
  );
}

function emitParadigm(ctx, { conjugation }) {
  // @beef only add if trace shows last paradigm with this conjugation was failure!
  //       OR  memory strength is abysmal.
  ctx.pool.add(
    ctx.daemon.modes.game.paradigm.emit.conjugation({
      conjugation,
      recall: "LEARNING",
      feedback: "realtime",
      order: "ordered",
    }),
  );
}

function emitContextualize(ctx, { sentences }) {
  for (const sentence of sentences) {
    if (sentence.memory?.is?.virgin ?? true) {
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
}

function emitConjugation(ctx, { weakVerbs, weakForms }) {
  ctx.pool
    .section(
      ...array
        .shuffle([...weakVerbs, ...weakForms])
        .map((literal) => ctx.daemon.modes.game.conjugation.emit.literal({ literal })),
    )
    .apply(array.shuffle);
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

  const weakForms = pickWeakForms(conjugation, forms, 2);
  const weakVerbs = await fetchWeakVerbs(ctx, { forms, infinitive, count: 4 });
  const sentences = await fetchContextSentences(ctx, {
    literals: [...forms, ...weakVerbs],
    count: 2,
  });

  emitExhibit(ctx, { conjugation, infinitive, forms, tenseSymbol, moodSymbol });
  emitPick(ctx, { weakForms, weakVerbs, forms });
  emitMatch(ctx, { weakForms, weakVerbs });
  emitParadigm(ctx, { conjugation });
  emitContextualize(ctx, { sentences });
  emitConjugation(ctx, { weakVerbs, weakForms });
};
