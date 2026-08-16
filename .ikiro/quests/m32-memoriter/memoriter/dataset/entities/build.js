import { string } from "@vivalence/typology";

const slugify = (text) => string.fold(text.replace(/-/g, " ")).replace(/\s+/g, "-");

export const root = (slug, name, description) => ({
  slug,
  traits: ["ONTOLOGICAL", "LABELED", "TOPOGRAPHICAL"],
  trait: { ONTOLOGICAL: {}, LABELED: { name, description }, TOPOGRAPHICAL: {} },
});

export const ontological = (slug, name, description) => ({
  slug,
  traits: ["ONTOLOGICAL", "LABELED"],
  trait: { ONTOLOGICAL: {}, LABELED: { name, description } },
});

export const structural = (slug, name, description) => ({
  slug,
  traits: ["STRUCTURAL", "LABELED"],
  trait: { STRUCTURAL: {}, LABELED: { name, description } },
});

export const lemma = (word) => ({
  slug: `word.lemma.${slugify(word)}`,
  traits: ["ONTOLOGICAL", "LABELED"],
  trait: { ONTOLOGICAL: {}, LABELED: { name: word, description: `Lemma: ${word}` } },
});

let counter = 0;

export const word =
  (pos, ...basesymbols) =>
  (la, en, exLa, exEn, ...symbols) => ({
    slug: `${slugify(la)}.${pos}`,
    traits: ["TRANSLATED", "EXEMPLIFIED", "RANKED"],
    trait: {
      TRANSLATED: { known: en, learning: la },
      EXEMPLIFIED: { known: exEn, learning: exLa },
      RANKED: { rank: ++counter },
    },
    symbols: [
      { slug: "word" },
      lemma(la),
      { slug: `word.part-of-speech.${pos}` },
      ...basesymbols.map((slug) => ({ slug })),
      ...symbols.map((slug) => ({ slug })),
    ],
  });

export const sentence = (la, en, lemmas, ...symbols) => ({
  slug: slugify(la),
  traits: ["TRANSLATED", "RANKED"],
  trait: {
    TRANSLATED: { known: en, learning: la },
    RANKED: { rank: ++counter },
  },
  symbols: [
    { slug: "sentence" },
    ...lemmas.map((w) => lemma(w)),
    ...symbols.map((slug) => ({ slug })),
  ],
});

export const vocalize = (literal, path) => ({
  ...literal,
  traits: [...literal.traits, "VOCALIZED"],
  trait: { ...literal.trait, VOCALIZED: { asset: { path } } },
});

export const depict = (literal, path) => ({
  ...literal,
  traits: [...literal.traits, "DEPICTED"],
  trait: { ...literal.trait, DEPICTED: { asset: { path } } },
});

export const lemmasOf = (literals) =>
  Object.values(
    Object.fromEntries(
      literals
        .flatMap((literal) => literal.symbols)
        .filter((symbol) => symbol.slug.startsWith("word.lemma."))
        .map((symbol) => [symbol.slug, symbol]),
    ),
  );
