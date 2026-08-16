import { array, object } from "@vivalence/typology";

const CONTEXT = { tense: "word.tense.", mood: "word.mood.", suffix: "word.suffix.", regularity: "word.regularity." };
const FACETS = ["person", "number"];
const TOKEN = ["slot", "form", "gloss", "literal", "person", "number", "asset", "signal"];

const facet = (literal, branch) => {
  const value = literal?.symbol?.word?.[branch];
  return typeof value === "string" ? `word.${branch}.${value}` : null;
};

const named = (symbol) => symbol?.trait?.LABELED?.name ?? symbol?.slug?.split(".").pop();

const labelled = (labels, slug) => (slug ? (labels.get(slug) ?? slug.split(".").pop()) : undefined);

const cards = (rows) =>
  rows.flatMap((row) => {
    const conjugated = row.trait?.CONJUGATED;
    if (!conjugated?.paradigm) return [];
    const bySlug = new Map(row.uses.getItems().map((form) => [form.slug, form]));
    const forms = Object.entries(conjugated.paradigm)
      .map(([slot, slug]) => ({ slot, form: bySlug.get(slug) }))
      .filter((entry) => entry.form);
    if (!forms.length) return [];
    const symbols = row.symbols.getItems();
    const context = Object.fromEntries(
      Object.entries(CONTEXT).map(([key, prefix]) => [key, named(symbols.find((symbol) => symbol.slug.startsWith(prefix)))]),
    );
    return [{ row, infinitive: bySlug.get(conjugated.infinitive), forms, context: object.pluck(context, Object.keys(CONTEXT)) }];
  });

export const paradigms = async (ctx, rows) => {
  if (!rows.length) return [];
  const built = cards(rows);
  if (!built.length) return [];

  const slugs = array.unique(
    built.flatMap((card) => card.forms.flatMap(({ form }) => FACETS.map((branch) => facet(form, branch)))).filter(Boolean),
  );
  const labels = new Map(
    (await ctx.daemon.entities.symbol.find({ slug: { $in: slugs } })).map((symbol) => [symbol.slug, named(symbol)]),
  );

  return built.map((card) => ({
    ontology: "conjugation",
    known: card.infinitive?.trait?.TRANSLATED?.known ?? "",
    learning: card.infinitive?.trait?.TRANSLATED?.learning ?? card.row.symbol?.word?.lemma ?? "",
    context: card.context,
    tokens: card.forms.map(({ slot, form }) =>
      object.pluck(
        {
          slot,
          form: form.trait?.TRANSLATED?.learning ?? "",
          gloss: form.trait?.TRANSLATED?.known ?? "",
          literal: form.id,
          person: labelled(labels, facet(form, "person")),
          number: labelled(labels, facet(form, "number")),
          asset: form.trait?.VOCALIZED?.asset,
          signal: form.retention?.lastSignal ?? undefined,
        },
        TOKEN,
      ),
    ),
    literal: card.row.id,
    ...(card.infinitive?.trait?.VOCALIZED?.asset && { asset: card.infinitive.trait.VOCALIZED.asset }),
    ...(card.row.retention?.lastSignal && { signal: card.row.retention.lastSignal }),
  }));
};
