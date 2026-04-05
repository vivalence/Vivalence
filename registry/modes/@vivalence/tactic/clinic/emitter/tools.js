// ── pure functions for the clinic emitter ──────────────────────────

export function extractParadigm(paradigm) {
  const bySlug = new Map(paradigm.uses.getItems().map((f) => [f.slug, f]));
  const infinitive = bySlug.get(paradigm.trait.CONJUGATED.infinitive);
  const forms = Object.values(paradigm.trait.CONJUGATED.paradigm)
    .map((slug) => bySlug.get(slug))
    .filter(Boolean);
  const tenseSymbol = paradigm.symbols.getItems().find((s) => s.slug.startsWith("word.tense."));
  const moodSymbol = paradigm.symbols.getItems().find((s) => s.slug.startsWith("word.mood."));
  const lemmaSymbol = paradigm.symbols.getItems().find((s) => s.slug.startsWith("word.lemma."));
  return { paradigm, infinitive, forms, tenseSymbol, moodSymbol, lemmaSymbol };
}

export function assess(items) {
  const forms = items[0]?.paradigm ? items.flatMap((d) => d.forms) : items;
  const total = forms.length;
  if (!total) return { total: 0, avgStrength: 0, errorRate: 0, unseenRatio: 1, phase: "FAMILIARIZE", forms };

  const unseen = forms.filter((f) => !f.memory);
  const reviewed = forms.filter((f) => f.memory);
  const avgStrength = forms.reduce((sum, f) => sum + (f.memory?.strength ?? 0), 0) / total;
  const unseenRatio = unseen.length / total;

  const errors = reviewed.filter(
    (f) => f.memory.lastSignal === "MISTAKE" || f.memory.lastSignal === "FAILURE",
  );
  const errorRate = reviewed.length ? errors.length / reviewed.length : 0;

  let phase;
  if (avgStrength < 0.3 || errorRate > 0.5) phase = "FAMILIARIZE";
  else if (avgStrength < 0.6) phase = "EXPAND";
  else phase = "CONSOLIDATE";

  return { total, avgStrength, errorRate, unseenRatio, phase, forms };
}

export function weightedPick(entries, weightFn) {
  const weighted = entries.map((e) => ({ entry: e, weight: Math.max(weightFn(e), 0.01) }));
  const total = weighted.reduce((sum, w) => sum + w.weight, 0);
  let r = Math.random() * total;
  return (weighted.find((w) => (r -= w.weight) <= 0) ?? weighted[0]).entry;
}

// bottom N forms by strength — adapts to distribution instead of fixed thresholds
export function weakest(forms, n) {
  return [...forms]
    .filter((f) => f.memory)
    .sort((a, b) => (a.memory.strength ?? 0) - (b.memory.strength ?? 0))
    .slice(0, n);
}

export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
