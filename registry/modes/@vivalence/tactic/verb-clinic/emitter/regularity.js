import { array } from "@vivalence/typology";
// ── regularity contrast ────────────────────────────────────────────
// hold mood + tense constant. contrast regular vs irregular paradigms.
// exhibit the pattern break, then drill irregular forms until automatic.

export default async (ctx) => {
  const where = ctx.input.where ?? {};

  const regulars = await ctx.daemon.entities.literal.feed(
    { ontology: "conjugation", ...where, symbols: [...(where.symbols ?? []), "word.regularity.regular"] },
    { limit: 2, blacklist: ctx.input.blacklist, populate: ["uses.memories", "symbols", "memories"] },
  );
  const irregulars = await ctx.daemon.entities.literal.feed(
    { ontology: "conjugation", ...where, symbols: [...(where.symbols ?? []), "word.regularity.irregular"] },
    { limit: 2, blacklist: ctx.input.blacklist, populate: ["uses.memories", "symbols", "memories"] },
  );
  if (!regulars.length || !irregulars.length) return;

  const extract = (paradigm) => {
    const bySlug = new Map(paradigm.uses.getItems().map((f) => [f.slug, f]));
    const infinitive = bySlug.get(paradigm.trait.CONJUGATED.infinitive);
    const forms = Object.values(paradigm.trait.CONJUGATED.paradigm)
      .map((slug) => bySlug.get(slug))
      .filter(Boolean);
    const tenseSymbol = paradigm.symbols.getItems().find((s) => s.slug.startsWith("word.tense."));
    const moodSymbol = paradigm.symbols.getItems().find((s) => s.slug.startsWith("word.mood."));
    const lemmaSymbol = paradigm.symbols.getItems().find((s) => s.slug.startsWith("word.lemma."));
    return { paradigm, infinitive, forms, tenseSymbol, moodSymbol, lemmaSymbol };
  };

  const regularData = regulars.map(extract);
  const irregularData = irregulars.map(extract);
  const allForms = [...regularData, ...irregularData].flatMap((d) => d.forms);

  // ── 1. EXHIBIT — regular vs irregular side by side
  ctx.pool.add(
    ctx.daemon.modes.game.exhibit.emit.present({
      layout: "CONTRASTIVE",
      title: "Regular vs Irregular",
      literals: allForms,
    }),
  );

  // ── 2. PARADIGM — fill regular tables (show the pattern holds)
  for (const { paradigm } of regularData) {
    ctx.pool.add(
      ctx.daemon.modes.game.paradigm.emit.conjugation({
        conjugation: paradigm,
        recall: "LEARNING",
        feedback: "realtime",
        order: "ordered",
      }),
    );
  }

  // ── 3. PARADIGM — fill irregular tables (the hard part)
  for (const { paradigm } of irregularData) {
    ctx.pool.add(
      ctx.daemon.modes.game.paradigm.emit.conjugation({
        conjugation: paradigm,
        recall: "LEARNING",
        feedback: "realtime",
        order: "ordered",
      }),
    );
  }

  // ── 4. CONJUGATION — drill irregular forms specifically
  const games = ctx.pool.section();
  for (const { forms, infinitive, tenseSymbol, moodSymbol, lemmaSymbol } of irregularData) {
    for (const literal of forms) {
      games.add(
        ctx.daemon.modes.game.conjugation.emit.literal({
          literal,
          infinitive,
          tense: tenseSymbol,
          mood: moodSymbol,
          lemma: lemmaSymbol,
          recall: "LEARNING",
        }),
      );
    }
  }
  games.apply(array.shuffle);

  // ── 5. FLASHCARD — brute force irregular memorization
  const irregularForms = irregularData.flatMap((d) => d.forms);
  ctx.pool
    .section(
      ...irregularForms.map((literal) =>
        ctx.daemon.modes.game.flashcard.emit.literals({ literal, recall: "LEARNING" }),
      ),
    )
    .apply(array.shuffle);

  // ── 6. WRITE — all forms, irregulars are the real test
  ctx.pool
    .section(
      ...array.shuffle(allForms).map((literal) =>
        ctx.daemon.modes.game.write.emit.literals({ literal, recall: "LEARNING" }),
      ),
    )
    .apply(array.shuffle);
};
