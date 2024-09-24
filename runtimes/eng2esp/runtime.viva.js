import { deepMerge } from "@vivalence/shared";
import * as m1 from "./curricula/m1.js";

const manifest = {
  type: "Runtime",
  slug: "eng2esp",
  name: "English to Spanish using Universal Dependencies",
};

const modules = deepMerge(
  {
    domain: await import("@vivalence/domains/base/domain.viva.js"),
    ontology: await import(
      "@vivalence/ontologies/langugage-universal-dependencies/ontology.viva.js"
    ),
    corpora: [await import("@vivalence/corpora/eng-to-esp/corpus.viva.js")],
    games: [],
    tactics: [await import("@vivalence/tactics/applying-verb-conjugations/tactic.viva.js")],
    strategies: [],
  },
  m1.modules,
);

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
