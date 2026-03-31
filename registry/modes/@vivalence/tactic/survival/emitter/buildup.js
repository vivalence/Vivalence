import { array } from "@vivalence/typology";
// ── buildup ─────────────────────────────────────────────────────────
// conjugation paradigms. structured introduction → active recall → drill.
//
// see           → exhibit the full table
// recognize     → pick with paradigm-internal distractors
// connect       → match form ↔ translation
// build         → paradigm: fill the table yourself
// contextualize → sentences containing these forms
// speed         → judge, slower for weak, faster for familiar
// produce       → conjugation cards: forms without the scaffold, weakest first

export default async (ctx) => {
  const modes = ctx.daemon.modes.game;
  const buffers = [];

  const conjugations = await ctx.daemon.entities.literal.feed({
    limit: 1,
    blacklist: ctx.input.blacklist,
    where: { ontology: "conjugation", ...ctx.input.where },
    populate: ["uses.memories", "symbols"],
  });
  if (!conjugations.length) return [];

  const conjugation = conjugations[0];
  const conj = conjugation.trait.CONJUGATED;
  const bySlug = new Map(conjugation.uses.getItems().map((f) => [f.slug, f]));

  const infinitive = bySlug.get(conj.infinitive);
  const forms = Object.values(conj.paradigm)
    .map((slug) => bySlug.get(slug))
    .filter(Boolean);
  if (!forms.length) return [];

  const untouched = forms.filter((f) => {
    const m = f.memory;
    return !m || m.status === "UNTOUCHED";
  });
  const weak = forms.filter((f) => {
    const s = f.memory?.status;
    return s === "UNKNOWN" || s === "LEARNING";
  });
  const strong = forms.filter((f) => {
    const s = f.memory?.status;
    return s === "KNOWN" || s === "GRADUATED";
  });

  const symbols = conjugation.symbols.getItems();
  const tenseSymbol = symbols.find((s) => s.slug.startsWith("word.tense."));
  const moodSymbol = symbols.find((s) => s.slug.startsWith("word.mood."));
  const lemmaSymbol = symbols.find((s) => s.slug.startsWith("word.lemma."));

  const infinitiveText = infinitive?.trait?.TRANSLATED?.learning ?? "";
  const tenseLabel = tenseSymbol?.trait?.LABELED?.name ?? "";
  const moodLabel = moodSymbol?.trait?.LABELED?.name ?? "";
  const subtitle = [tenseLabel, moodLabel].filter(Boolean).join(" ");

  // ── 1. SEE — exhibit the full table
  buffers.push(
    await modes.exhibit.emit.present({
      layout: "table",
      title: infinitiveText,
      subtitle,
      literals: forms,
    }),
  );

  // ── 2. RECOGNIZE — pick with paradigm-internal distractors
  for (const lit of array.shuffle([...untouched, ...weak])) {
    const distractors = forms.filter((f) => f.id !== lit.id);
    if (distractors.length) {
      buffers.push(
        await modes.pick.emit.literal({
          literal: lit,
          distractors,
          recall: "LEARNING",
        }),
      );
    }
  }

  // ── 3. CONNECT — match form ↔ translation
  if (forms.length >= 2) {
    buffers.push(
      await modes.match.emit.batch({
        literals: forms,
        gameplay: "translate",
        recall: "LEARNING",
      }),
    );
  }

  // ── 4. BUILD — paradigm: fill the table yourself
  buffers.push(
    await modes.paradigm.emit.conjugation({
      conjugation,
      recall: "LEARNING",
      feedback: "realtime",
      order: "ordered",
    }),
  );

  // ── 5. CONTEXTUALIZE — sentences containing these forms
  for (const form of forms) {
    const sentences = await ctx.daemon.entities.literal.find(
      { ontology: "sentence", uses: form.id },
      { limit: 1 },
    );
    if (sentences.length) {
      buffers.push(
        await modes.exhibit.emit.present({
          layout: "pattern",
          title: form.trait?.TRANSLATED?.learning ?? "",
          literals: sentences,
        }),
      );
    }
  }

  // ── 6. SPEED — judge, paced by familiarity
  for (const lit of array.shuffle(forms)) {
    const isWeak = untouched.includes(lit) || weak.includes(lit);
    buffers.push(
      await modes.judge.emit.literal({
        literal: lit,
        recall: "LEARNING",
        distractors: forms.filter((f) => f.id !== lit.id),
        speed: { rate: isWeak ? "NORMAL" : "FAST" },
      }),
    );
  }

  // ── 7. PRODUCE — conjugation cards, weakest first
  const drillOrder = [...untouched, ...weak, ...strong];
  for (const lit of array.shuffle(drillOrder)) {
    buffers.push(
      await modes.conjugation.emit.literal({
        literal: lit,
        conjugation,
        infinitive,
        tense: tenseSymbol,
        mood: moodSymbol,
        lemma: lemmaSymbol,
        recall: "LEARNING",
      }),
    );
  }

  return buffers;
};
