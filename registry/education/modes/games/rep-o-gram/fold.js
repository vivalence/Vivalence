export const fromLiteral = (literal) => ({
  ontology: literal.ontology,
  known: literal.trait?.TRANSLATED?.known,
  learning: literal.trait?.TRANSLATED?.learning,
  example: literal.trait?.EXEMPLIFIED,
  tokens: literal.trait?.ANNOTATED?.tokens,
  asset: literal.trait?.VOCALIZED?.asset,
  literal: literal.id,
});

export const speakable = (knowable) => Boolean(knowable?.known && knowable?.learning);

export const authored = (pair) => ({
  ontology: (pair.learning ?? "").split(/\s+/).length > 2 ? "sentence" : "word",
  ...pair,
});
