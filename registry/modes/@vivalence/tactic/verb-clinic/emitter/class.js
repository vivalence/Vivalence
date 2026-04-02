import { array } from "@vivalence/typology";
// ── conjugation class patterns ─────────────────────────────────────
// hold mood + tense constant. vary lemma within same suffix class.
// show that regular -ar/-er/-ir verbs follow predictable endings.
// paradigm-heavy: the point is pattern recognition across the class.

export default async (ctx) => {
  const paradigms = await ctx.daemon.entities.literal.feed(
    { ontology: "conjugation", ...ctx.input.where },
    { limit: 6, blacklist: ctx.input.blacklist, populate: ["uses.memories", "symbols", "memories"] },
  );
  if (paradigms.length < 2) return;

  // group by suffix class
  const byClass = new Map();
  for (const paradigm of paradigms) {
    const suffix = paradigm.symbols.getItems().find((s) => s.slug.startsWith("word.suffix."));
    if (!suffix) continue;
    if (!byClass.has(suffix.slug)) byClass.set(suffix.slug, []);
    byClass.get(suffix.slug).push(paradigm);
  }

  for (const [suffixSlug, classParadigms] of byClass) {
    if (classParadigms.length < 2) continue;

    const classData = classParadigms.map((paradigm) => {
      const bySlug = new Map(paradigm.uses.getItems().map((f) => [f.slug, f]));
      const infinitive = bySlug.get(paradigm.trait.CONJUGATED.infinitive);
      const forms = Object.values(paradigm.trait.CONJUGATED.paradigm)
        .map((slug) => bySlug.get(slug))
        .filter(Boolean);
      return { paradigm, infinitive, forms };
    });

    const allForms = classData.flatMap((d) => d.forms);

    // ── 1. EXHIBIT — pattern across verbs of same class
    ctx.pool.add(
      ctx.daemon.modes.game.exhibit.emit.present({
        layout: "PATTERN",
        title: suffixSlug.replace("word.suffix.", "-") + " verbs",
        subtitle: "Same class, same endings",
        literals: allForms,
      }),
    );

    // ── 2. PARADIGM — fill the table for each verb
    for (const { paradigm } of classData) {
      ctx.pool.add(
        ctx.daemon.modes.game.paradigm.emit.conjugation({
          conjugation: paradigm,
          recall: "LEARNING",
          feedback: "realtime",
          order: "ordered",
        }),
      );
    }

    // ── 3. CONJUGATION — produce individual forms across verbs
    const games = ctx.pool.section();
    for (const { forms, infinitive, paradigm } of classData) {
      const tenseSymbol = paradigm.symbols.getItems().find((s) => s.slug.startsWith("word.tense."));
      const moodSymbol = paradigm.symbols.getItems().find((s) => s.slug.startsWith("word.mood."));
      const lemmaSymbol = paradigm.symbols.getItems().find((s) => s.slug.startsWith("word.lemma."));

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

    // ── 4. WRITE — produce forms, shuffled across verbs
    ctx.pool
      .section(
        ...allForms.map((literal) =>
          ctx.daemon.modes.game.write.emit.literals({ literal, recall: "LEARNING" }),
        ),
      )
      .apply(array.shuffle);
  }
};
