export function weightedPick(entries, weightFn) {
  const weighted = entries.map((entry) => ({ entry, weight: Math.max(weightFn(entry), 0.01) }));
  const total = weighted.reduce((sum, row) => sum + row.weight, 0);
  let cursor = Math.random() * total;
  return (weighted.find((row) => (cursor -= row.weight) <= 0) ?? weighted[0]).entry;
}

export function extractParadigm(conjugation) {
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

export function avgStrengthOfParadigms(paradigms) {
  const forms = paradigms.flatMap((paradigm) => paradigm.uses.getItems());
  if (!forms.length) return 0;
  return forms.reduce((sum, form) => sum + (form.memory?.strength ?? 0), 0) / forms.length;
}
