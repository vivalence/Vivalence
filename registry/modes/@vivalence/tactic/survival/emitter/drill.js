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
      uses: { $in: [...forms].map((literal) => literal.id) }, // , ...weakVerbs
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

  ctx.pool.add(
    ctx.daemon.modes.game.paradigm.emit.conjugation({
      conjugation,
      recall: "LEARNING",
      feedback: "REALTIME",
      order: "ORDERED",
    }),
  );

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

// import { array } from "@vivalence/typology";

// export default async (ctx) => {
//   const limit = ctx.input.limit ?? 12;
//   const fed = await ctx.daemon.entities.literal.feed(ctx.input.where, {
//     limit,
//     blacklist: ctx.input.blacklist,
//   });
//   const errors = await ctx.daemon.entities.literal.byLastSignal(
//     ["FAILURE", "MISTAKE"],
//     ctx.input.where,
//     { limit: Math.ceil(limit / 3), blacklist: ctx.input.blacklist },
//   );
//   const fedIds = new Set(fed.map((form) => form.id));
//   const extra = errors.filter((error) => !fedIds.has(error.id));
//   const forms = [...extra, ...fed].slice(0, limit);
//   if (!forms.length) return;

//   const distractors = await ctx.daemon.entities.literal.find(ctx.input.where ?? {}, { limit: 30 });

//   const untouched = forms.filter((form) => !form.memory || form.memory.is.virgin);
//   if (untouched.length) {
//     ctx.pool.add(
//       ctx.daemon.modes.game.exhibit.emit.present({
//         layout: "TABLE",
//         title: ctx.input.title ?? "Forms",
//         literals: untouched,
//       }),
//     );
//   }

//   const practice = ctx.pool.section();

//   for (const form of forms) {
//     if (!form.memory || form.memory.is.virgin) {
//       practice.add(
//         ctx.daemon.modes.game.judge.emit.literal({
//           literal: form,
//           distractors,
//           recall: "LEARNING",
//           speed: { rate: "NORMAL" },
//         }),
//       );
//     } else if (form.memory.is.failed) {
//       practice.add(
//         ctx.daemon.modes.game.write.emit.literals({ literal: form, recall: "LEARNING" }),
//       );
//     } else if (form.memory.is.weak) {
//       practice.add(
//         ctx.daemon.modes.game.judge.emit.literal({
//           literal: form,
//           distractors,
//           recall: "LEARNING",
//           speed: { rate: "NORMAL" },
//         }),
//       );
//     } else {
//       practice.add(ctx.daemon.modes.game.write.emit.literals({ literal: form, recall: "KNOWN" }));
//     }
//   }

//   practice.apply(array.shuffle);
// };
