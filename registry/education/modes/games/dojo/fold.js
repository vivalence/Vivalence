const FACETS = { infinitive: "lemma", tense: "tense", mood: "mood", person: "person", number: "number" };

const VERBAL = ["tense", "mood"];

export const verbal = (context) => VERBAL.some((key) => typeof context?.[key] === "string");

export const context = (literal) => {
  const word = literal.symbol?.word;
  if (!word || typeof word.person !== "string") return undefined;
  const pairs = Object.entries(FACETS)
    .map(([key, facet]) => [key, word[facet]])
    .filter(([, value]) => typeof value === "string");
  const facets = Object.fromEntries(pairs);
  if (verbal(facets) || !("infinitive" in facets)) return facets;
  const { infinitive, ...rest } = facets;
  return { lemma: infinitive, ...rest };
};

export const fromLiteral = (literal) => ({
  ontology: literal.ontology,
  known: literal.trait?.TRANSLATED?.known,
  learning: literal.trait?.TRANSLATED?.learning,
  example: literal.trait?.EXEMPLIFIED,
  context: context(literal),
  tokens: literal.trait?.ANNOTATED?.tokens,
  asset: literal.trait?.VOCALIZED?.asset,
  literal: literal.id,
  signal: literal.retention?.lastSignal ?? literal.retentions?.[0]?.lastSignal ?? undefined,
  status: literal.retention?.status ?? literal.retentions?.[0]?.status ?? undefined,
});

export const speakable = (knowable) => Boolean(knowable?.known && knowable?.learning);

export const table = (knowable) => knowable?.ontology === "conjugation";

export const authored = (pair) => ({
  ontology: (pair.learning ?? "").split(/\s+/).length > 2 ? "sentence" : "word",
  ...pair,
});
