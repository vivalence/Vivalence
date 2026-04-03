import { object, array } from "@vivalence/typology";
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
  const conjugations = await ctx.daemon.entities.literal.feed(
    { ontology: "conjugation", ...ctx.input.where },
    {
      limit: 1,
      blacklist: ctx.input.blacklist,
      populate: ["uses.memories", "symbols", "memories"],
    },
  );

  if (!conjugations.length) return;

  const conjugation = conjugations[0];
  const bySlug = new Map(conjugation.uses.getItems().map((form) => [form.slug, form]));
  const infinitive = bySlug.get(conjugation.trait.CONJUGATED.infinitive);
  const forms = Object.values(conjugation.trait.CONJUGATED.paradigm)
    .map((slug) => bySlug.get(slug))
    .filter(Boolean);
  if (!forms.length) return;

  const weak = forms.filter((form) => !form.memory || form.memory.is.weak);

  const symbols = conjugation.symbols.getItems();
  const tenseSymbol = symbols.find((symbol) => symbol.slug.startsWith("word.tense."));
  const moodSymbol = symbols.find((symbol) => symbol.slug.startsWith("word.mood."));
  const lemmaSymbol = symbols.find((symbol) => symbol.slug.startsWith("word.lemma."));

  const dueVerbs = await ctx.daemon.entities.literal.due(
    object.merge(ctx.input.where, { ontology: "word" }, { symbols: ["word.part-of-speech.verb"] }),
    {
      limit: 4,
      blacklist: { literals: [...forms.map((form) => form.id), infinitive?.id].filter(Boolean) },
    },
  );

  const distractorPool = [...forms, ...dueVerbs];

  // ── 1. EXHIBIT — full table (only if conjugation itself is untouched)
  ctx.pool.add(
    (!conjugation.memory || conjugation.memory.is.virgin) &&
      ctx.daemon.modes.game.exhibit.emit.present({
        layout: "TABLE",
        title: infinitive?.trait?.TRANSLATED?.learning ?? "",
        subtitle: [tenseSymbol?.trait?.LABELED?.name, moodSymbol?.trait?.LABELED?.name]
          .filter(Boolean)
          .join(" "),
        literals: forms,
      }),
  );

  // ── 2. PICK — weak + due verbs, shuffled
  ctx.pool
    .section(
      [...weak, ...dueVerbs]
        .filter((l) => !l.memory?.is.failed)
        .map((literal) =>
          ctx.daemon.modes.game.pick.emit.literal({
            literal,
            distractors: distractorPool,
            recall: "LEARNING",
          }),
        ),
    )
    .apply(array.shuffle);

  // ── 3. MATCH — 6 weakest from conjugation uses + due verbs
  const matchPool = [...conjugation.uses.getItems(), ...dueVerbs]
    .sort((a, b) => (a.memory?.strength ?? 0) - (b.memory?.strength ?? 0))
    .slice(0, 6);

  ctx.pool.add(
    matchPool.length >= 2 &&
      ctx.daemon.modes.game.match.emit.batch({
        literals: matchPool,
        gameplay: "TRANSLATE",
        recall: "LEARNING",
      }),
  );

  // ── 4. PARADIGM — fill the table yourself
  ctx.pool.add(
    ctx.daemon.modes.game.paradigm.emit.conjugation({
      conjugation,
      recall: "LEARNING",
      feedback: "realtime",
      order: "ordered",
    }),
  );

  // ── 5. CONTEXTUALIZE — shadow untouched/unknown sentences, write learning+
  const sentences = await ctx.daemon.entities.literal.byStrength(
    {
      ontology: "sentence",
      uses: { $in: [...forms, ...dueVerbs].map((form) => form.id) },
      memories: { strength: { $gte: 0.1 } },
    },
    { limit: 4, populate: ["memories"] },
  );
  for (const sentence of sentences) {
    if (!sentence.memory || sentence.memory.is.virgin) {
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

  // ── 6. CONJUGATION — due verbs + weak conjugations, shuffled
  ctx.pool
    .section(
      ...array
        .shuffle([...dueVerbs, ...weak])
        .map((literal) => ctx.daemon.modes.game.conjugation.emit.literal({ literal })),
    )
    .apply(array.shuffle);

  // ── 7. JUDGE — due verbs + all conjugation forms, shuffled
  // ctx.pool .section(...array.shuffle([...dueVerbs, ...forms]).map((literal) => ctx.daemon.modes.game.judge.emit.literal({literal, recall: literal.memory?.is.succeeded ? "LEARNING" : "KNOWN", distractors: distractorPool,}),),) .apply(array.shuffle);
};
