import { array } from "@vivalence/typology";
// ── buildup ─────────────────────────────────────────────────────────
// conjugation paradigms. structured introduction → active recall → drill.
//
// exhibit     → full table (only if conjugation untouched)
// pick        → weak conjugations (paradigm distractors) + due verbs (similarity distractors), shuffled
// match       → if weak conjugations
// paradigm    → fill the table
// shadow/write → sentences containing these forms
// conjugation → due verbs + weak conjugations, shuffled
// judge       → due verbs + all conjugation forms, shuffled

export default async (ctx) => {
  const conjugations = await ctx.daemon.entities.literal.feed({
    limit: 1,
    blacklist: ctx.input.blacklist,
    where: { ontology: "conjugation", ...ctx.input.where },
    populate: ["uses.memories", "symbols", "memories"],
  });

  if (!conjugations.length) return [];

  const conjugation = conjugations[0];
  const bySlug = new Map(conjugation.uses.getItems().map((form) => [form.slug, form]));
  const infinitive = bySlug.get(conjugation.trait.CONJUGATED.infinitive);
  const forms = Object.values(conjugation.trait.CONJUGATED.paradigm)
    .map((slug) => bySlug.get(slug))
    .filter(Boolean);
  if (!forms.length) return [];

  const weak = forms.filter((form) => !form.memory || form.memory.is.weak);

  const symbols = conjugation.symbols.getItems();
  const tenseSymbol = symbols.find((symbol) => symbol.slug.startsWith("word.tense."));
  const moodSymbol = symbols.find((symbol) => symbol.slug.startsWith("word.mood."));
  const lemmaSymbol = symbols.find((symbol) => symbol.slug.startsWith("word.lemma."));

  const dueVerbs = await ctx.daemon.entities.literal.due({
    limit: 4,
    blacklist: { literals: [...forms.map((form) => form.id), infinitive?.id].filter(Boolean) },
    where: { ontology: "word", ...ctx.input.where, symbol: { word: { "part-of-speech": "verb" } } },
  });

  const distractorPool = [...forms, ...dueVerbs];
  const buffers = [];

  // ── 1. EXHIBIT — full table (only if conjugation itself is untouched)
  if (!conjugation.memory || conjugation.memory.is.virgin) {
    buffers.push(
      await ctx.daemon.modes.game.exhibit.emit.present({
        layout: "table",
        title: infinitive?.trait?.TRANSLATED?.learning ?? "",
        subtitle: [tenseSymbol?.trait?.LABELED?.name, moodSymbol?.trait?.LABELED?.name]
          .filter(Boolean)
          .join(" "),
        literals: forms,
      }),
    );
  }

  // ── 2. PICK — weak + due verbs, shuffled. pick emitter handles dice ranking.
  for (const literal of array.shuffle([...weak, ...dueVerbs])) {
    buffers.push(
      await ctx.daemon.modes.game.pick.emit.literal({
        literal,
        distractors: distractorPool,
        recall: "LEARNING",
      }),
    );
  }

  // ── 3. MATCH — if weak conjugations exist
  if (weak.length >= 2) {
    buffers.push(
      await ctx.daemon.modes.game.match.emit.batch({
        literals: forms,
        gameplay: "translate",
        recall: "LEARNING",
      }),
    );
  }

  // ── 4. PARADIGM — fill the table yourself
  buffers.push(
    await ctx.daemon.modes.game.paradigm.emit.conjugation({
      conjugation,
      // recall: !conjugation.memory?.status ? "KNOWN" : "LEARNING",
      recall: "LEARNING",
      feedback: "realtime",
      order: "ordered",
    }),
  );

  // ── 5. CONTEXTUALIZE — shadow untouched/unknown sentences, write learning+
  for (const sentence of await ctx.daemon.entities.literal.find(
    { ontology: "sentence", uses: { $in: forms.map((form) => form.id) } },
    { limit: forms.length, populate: ["memories"] },
  )) {
    if (!sentence.memory || sentence.memory.is.weak) {
      buffers.push(
        await ctx.daemon.modes.game.shadow.emit.literals({
          literal: sentence,
          recall: "LEARNING",
          speed: { rate: "SLOW" },
        }),
      );
    } else if (sentence.memory.status === "LEARNING") {
      buffers.push(
        await ctx.daemon.modes.game.write.emit.literals({
          literal: sentence,
          recall: "LEARNING",
        }),
      );
    }
  }

  // ── 6. CONJUGATION — due verbs + weak conjugations, shuffled
  for (const literal of array.shuffle([...dueVerbs, ...weak])) {
    buffers.push(
      await ctx.daemon.modes.game.conjugation.emit.literal({
        literal,
        infinitive,
        tense: tenseSymbol,
        mood: moodSymbol,
        lemma: lemmaSymbol,
        recall: "LEARNING",
      }),
    );
  }

  // ── 7. JUDGE — due verbs + all conjugation forms, shuffled
  for (const literal of array.shuffle([...dueVerbs, ...forms])) {
    buffers.push(
      await ctx.daemon.modes.game.judge.emit.literal({
        literal,
        recall: literal.memory?.failed ? "KNOWN" : "LEARNING",
        distractors: distractorPool.filter((form) => form.id !== literal.id),
      }),
    );
  }

  return buffers;
};
