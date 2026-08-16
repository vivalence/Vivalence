import { array, object } from "@vivalence/typology";

const TENSE = "word.tense.";
const MOOD = "word.mood.";

const facet = (literal, branch) => {
  const value = literal?.symbol?.word?.[branch];
  return typeof value === "string" ? `word.${branch}.${value}` : null;
};

const named = (symbol) => symbol?.trait?.LABELED?.name ?? symbol?.slug?.split(".").pop();

const labelled = (labels, slug) => (slug ? (labels.get(slug) ?? slug.split(".").pop()) : undefined);

export const conjugate = async (ctx, paradigms) => {
  if (!paradigms.length) return [];

  const cards = paradigms.flatMap((paradigm) => {
    const conjugated = paradigm.trait?.CONJUGATED;
    if (!conjugated?.paradigm) return [];

    const bySlug = new Map(paradigm.uses.getItems().map((form) => [form.slug, form]));
    const infinitive = bySlug.get(conjugated.infinitive);
    const symbols = paradigm.symbols.getItems();
    const tense = named(symbols.find((symbol) => symbol.slug.startsWith(TENSE)));
    const mood = named(symbols.find((symbol) => symbol.slug.startsWith(MOOD)));

    return object
      .values(conjugated.paradigm)
      .map((slug) => bySlug.get(slug))
      .filter(Boolean)
      .map((form) => ({ form, infinitive, tense, mood }));
  });
  if (!cards.length) return [];

  const slugs = array.unique(
    cards.flatMap((card) => [facet(card.form, "person"), facet(card.form, "number")]).filter(Boolean),
  );
  const labels = new Map(
    (await ctx.daemon.entities.symbol.find({ slug: { $in: slugs } })).map((symbol) => [
      symbol.slug,
      named(symbol),
    ]),
  );

  return array.shuffle(cards).map((card) => ({
    ontology: "conjugation",
    known: card.form.trait?.TRANSLATED?.known ?? card.infinitive?.trait?.TRANSLATED?.known ?? "",
    learning: card.form.trait?.TRANSLATED?.learning ?? "",
    context: {
      infinitive: card.infinitive?.trait?.TRANSLATED?.learning,
      tense: card.tense,
      mood: card.mood,
      person: labelled(labels, facet(card.form, "person")),
      number: labelled(labels, facet(card.form, "number")),
    },
    literal: card.form.id,
    ...(card.form.trait?.VOCALIZED?.asset && { asset: card.form.trait.VOCALIZED.asset }),
  }));
};
