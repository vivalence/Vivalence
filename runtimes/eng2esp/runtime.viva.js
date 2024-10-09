import { deepMerge } from "@vivalence/shared";
import curricula from "./curricula/index.js";

const modules = deepMerge(
  {
    domain: await import("@vivalence/domains/base/domain.viva.js"),
    ontology: await import(
      "@vivalence/ontologies/langugage-universal-dependencies/ontology.viva.js"
    ),

    corpora: [await import("@vivalence/corpora/eng-to-esp/corpus.viva.js")],
    games: [
      await import("@vivalence/games/prose/prose.viva.js"),
      await import("@vivalence/games/translations/translations.viva.js"),
      await import("@vivalence/games/flashcards/flashcards.viva.js"),
    ],
    tactics: [await import("@vivalence/tactics/applying-verb-conjugations/tactic.viva.js")],
    strategies: [],
  },
  ...curricula,
);

const manifest = {
  type: "Runtime",
  slug: "eng2esp",
  name: "English to Spanish using Universal Dependencies",
};

export { manifest, modules };

// games: [
//   "file://../viva_modules/games/flashcards/flashcards.viva.js",
//   "file://../viva_modules/games/translations/translations.viva.js",
//   "file://../viva_modules/games/conjugations/conjugations.viva.js",
// ],
// tactics: [
//   "file://../viva_modules/tactics/applying-verb-conjugations/tactic.viva.js",
//   "file://../viva_modules/tactics/article-morphology-of-gender-and-number/tactic.viva.js",
// ],
// strategies: ["file://../viva_modules/strategies/a1.viva.js"],
