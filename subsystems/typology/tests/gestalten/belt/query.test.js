import { specimen, object, query } from "@vivalence/typology";
import { topography } from "@vivalence/typology/scenarios";

const literals = [...topography.nouns, ...topography.verbs, ...topography.sentences];

specimen.describe("the operators, against the shapes MikroORM would receive", () => {
  specimen.it("matches scalars and the comparison family", () => {
    const ranked = literals.filter(query.where({ trait: { RANKED: { rank: { $lte: 2 } } } }));
    specimen.expect(ranked.map((row) => row.slug).sort()).toEqual(["casa.noun", "parlare.verb"]);
    specimen.expect(literals.filter(query.where({ trait: { RANKED: { rank: { $lt: 2 } } } })).map((row) => row.slug))
      .toEqual(["parlare.verb"]);
    specimen.expect(literals.filter(query.where({ trait: { RANKED: { rank: { $gt: 2 } } } })).map((row) => row.slug))
      .toEqual(["del.contraction"]);
    specimen.expect(literals.filter(query.where({ slug: { $in: ["casa.noun"] } })).length).toBe(1);
    specimen.expect(literals.filter(query.where({ slug: { $ne: "casa.noun" } })).length).toBe(3);
  });

  specimen.it("compiles $like the way SQL reads it, and negates through $not", () => {
    const lemma = query.where({ slug: { $like: "%.noun" } });
    specimen.expect(literals.filter(lemma).map((row) => row.slug)).toEqual(["casa.noun"]);
    const rest = query.where({ slug: { $not: { $like: "%.noun" } } });
    specimen.expect(literals.filter(rest).length).toBe(3);
  });

  specimen.it("walks collections with $some/$every/$none, not an invented $all", () => {
    const words = query.where({ symbols: { $some: { slug: "word" } } });
    specimen.expect(literals.filter(words).map((row) => row.slug).sort())
      .toEqual(["casa.noun", "del.contraction", "parlare.verb"]);
    const untagged = query.where({ symbols: { $none: { slug: { $like: "proficiency.%" } } } });
    specimen.expect(literals.filter(untagged).map((row) => row.slug))
      .toEqual(["del.contraction", "la-casa-e-grande"]);
  });

  specimen.it("returns null on an operator it cannot compile, so the caller stays conservative", () => {
    specimen.expect(query.where({ slug: { $fulltext: "x" } })).toBe(null);
    specimen.expect(query.where({ $and: [{ slug: { $overlap: [1] } }] })).toBe(null);
  });
});

specimen.describe("what the five existing match() call sites still get", () => {
  specimen.it("keeps scalar equality, array containment and nested recursion", () => {
    specimen.expect(object.match({ slug: "a", trait: { RANKED: { rank: 1 } } }, { slug: "a" })).toBe(true);
    specimen.expect(object.match({ traits: ["A", "B"] }, { traits: ["A"] })).toBe(true);
    specimen.expect(object.match({ traits: ["A"] }, { traits: ["A", "B"] })).toBe(false);
    specimen.expect(object.match({ trait: { RANKED: { rank: 1 } } }, { trait: { RANKED: { rank: 2 } } })).toBe(false);
  });

  specimen.it("splits the corpus the way the italian exemplar's sinks do", () => {
    const words = literals.filter(query.where("word"));
    const sentences = literals.filter(query.where("sentence"));
    specimen.expect(words.length).toBe(3);
    specimen.expect(sentences.map((row) => row.slug)).toEqual(["la-casa-e-grande"]);
    specimen.expect(words.filter((row) => sentences.includes(row))).toEqual([]);
  });
});
