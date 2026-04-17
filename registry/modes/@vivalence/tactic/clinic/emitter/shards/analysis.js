import { object } from "@vivalence/typology";

export function analysis(ctx) {
  return {
    // ── queries (ontology-scoped, auto-inherit ctx.input.where + blacklist) ─
    sentences: (opts = {}) => fetchFeed(ctx, "sentence", opts),
    words: (opts = {}) => fetchFeed(ctx, "word", opts),
    conjugations: (opts = {}) => fetchFeed(ctx, "conjugation", opts),
    verbs: (opts = {}) =>
      fetchByStrength(ctx, "word", {
        ...opts,
        where: object.merge({ symbols: ["word.part-of-speech.verb"] }, opts.where ?? {}),
      }),

    byStrength: (ontology, opts = {}) => fetchByStrength(ctx, ontology, opts),

    find: (ontology, opts = {}) =>
      ctx.daemon.entities.literal.find(
        mergedWhere(ctx, ontology, opts.where),
        { populate: opts.populate, limit: opts.limit, orderBy: opts.orderBy },
      ),

    novel: (ontology, opts = {}) =>
      ctx.daemon.entities.literal.novel(mergedWhere(ctx, ontology, opts.where), mergedOpts(ctx, opts)),

    due: (ontology, opts = {}) =>
      ctx.daemon.entities.literal.due(mergedWhere(ctx, ontology, opts.where), mergedOpts(ctx, opts)),

    errors: (ontology, opts = {}) =>
      ctx.daemon.entities.literal.byLastSignal(
        ["MISTAKE", "FAILURE"],
        mergedWhere(ctx, ontology, opts.where),
        mergedOpts(ctx, opts),
      ),

    // ── decoders (pure) ───────────────────────────────────────────────────
    paradigm,
    bundles,
    failedTokenIndices,
    pickWeakForms,
    weakest,
    weightedPick,
    shuffle,
    assess,
    phase,
  };
}

function fetchFeed(ctx, ontology, opts) {
  return ctx.daemon.entities.literal.feed(
    mergedWhere(ctx, ontology, opts.where),
    mergedOpts(ctx, opts),
  );
}

function fetchByStrength(ctx, ontology, opts) {
  return ctx.daemon.entities.literal.byStrength(
    mergedWhere(ctx, ontology, opts.where),
    mergedOpts(ctx, opts),
  );
}

function mergedWhere(ctx, ontology, extra = {}) {
  const baseSymbols = ctx.input.where?.symbols;
  const extraSymbols = extra?.symbols;
  const merged = object.merge({}, ctx.input.where ?? {}, { ontology }, extra);
  if (Array.isArray(baseSymbols) || Array.isArray(extraSymbols)) {
    merged.symbols = [...(baseSymbols ?? []), ...(extraSymbols ?? [])];
  }
  return merged;
}

function mergedOpts(ctx, opts) {
  return {
    limit: opts.limit,
    blacklist: opts.blacklist ?? ctx.input.blacklist,
    populate: opts.populate,
  };
}

// ── decoders ─────────────────────────────────────────────────────────────

export function paradigm(conjugation) {
  const bySlug = new Map(conjugation.uses.getItems().map((form) => [form.slug, form]));
  const symbols = conjugation.symbols.getItems();
  return {
    infinitive: bySlug.get(conjugation.trait.CONJUGATED.infinitive),
    forms: Object.values(conjugation.trait.CONJUGATED.paradigm)
      .map((slug) => bySlug.get(slug))
      .filter(Boolean),
    tenseSymbol: symbols.find((symbol) => symbol.slug.startsWith("word.tense.")),
    moodSymbol: symbols.find((symbol) => symbol.slug.startsWith("word.mood.")),
    lemmaSymbol: symbols.find((symbol) => symbol.slug.startsWith("word.lemma.")),
    bySlug,
  };
}

export function bundles(conjugations) {
  return conjugations.map((conjugation) => ({ paradigm: conjugation, ...paradigm(conjugation) }));
}

export function failedTokenIndices(sentence) {
  const failedSlugs = new Set(
    sentence.uses
      .getItems()
      .filter((word) => word.memory?.is?.failed)
      .map((word) => word.slug),
  );
  if (!failedSlugs.size) return [];
  const tokens = sentence.trait?.ANNOTATED?.tokens ?? [];
  return tokens
    .map((token, index) => ({ token, index }))
    .filter(
      ({ token }) => token.deprel !== "punct" && token.literal && failedSlugs.has(token.literal),
    )
    .map(({ index }) => index);
}

export function pickWeakForms(conjugation, forms, count) {
  const formIds = new Set(forms.map((form) => form.id));
  return conjugation.uses
    .getItems()
    .filter((literal) => formIds.has(literal.id))
    .slice(0, count);
}

export function weakest(items, count) {
  const flat = items[0]?.paradigm ? items.flatMap((item) => item.forms) : items;
  return [...flat]
    .filter((form) => form.memory)
    .sort((a, b) => (a.memory.strength ?? 0) - (b.memory.strength ?? 0))
    .slice(0, count);
}

export function weightedPick(entries, weightFn) {
  const weighted = entries.map((entry) => ({ entry, weight: Math.max(weightFn(entry), 0.01) }));
  const total = weighted.reduce((sum, row) => sum + row.weight, 0);
  let cursor = Math.random() * total;
  return (weighted.find((row) => (cursor -= row.weight) <= 0) ?? weighted[0]).entry;
}

export function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function assess(items) {
  const forms = items[0]?.paradigm ? items.flatMap((item) => item.forms) : items;
  const total = forms.length;
  if (!total) {
    return { total: 0, avgStrength: 0, errorRate: 0, unseenRatio: 1, phase: "FAMILIARIZE", forms };
  }

  const reviewed = forms.filter((form) => form.memory);
  const unseenRatio = (total - reviewed.length) / total;
  const avgStrength = forms.reduce((sum, form) => sum + (form.memory?.strength ?? 0), 0) / total;
  const errors = reviewed.filter(
    (form) => form.memory.lastSignal === "MISTAKE" || form.memory.lastSignal === "FAILURE",
  );
  const errorRate = reviewed.length ? errors.length / reviewed.length : 0;

  let derived;
  if (avgStrength < 0.3 || errorRate > 0.5) derived = "FAMILIARIZE";
  else if (avgStrength < 0.6) derived = "EXPAND";
  else derived = "CONSOLIDATE";

  return { total, avgStrength, errorRate, unseenRatio, phase: derived, forms };
}

export function phase(items) {
  return assess(items).phase;
}
