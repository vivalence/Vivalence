import curriculum from "./curriculum/index.js";
import schema from "./schema/index.js";

const manifest = {
  type: "curriculum",
  slug: "cefr-eng-to-esp",
  name: "CEFR - English to Spanish",
  icon: { emoji: "🇪🇺" },
  version: "0.0.3",
};

const modules = {
  games: [
    //
    "@vivalence/game/conjugations",
    "@vivalence/game/flashcards",
    "@vivalence/game/translations",
    "@vivalence/game/prose",
  ],
  tactics: [
    //
    "@vivalence/tactic/spaced-repetition",
    "@vivalence/tactic/article-practice",
    "@vivalence/tactic/verb-conjugation-practice",
    "@vivalence/tactic/pronominalization-practice",
  ],
  strategies: [],
  topologies: [
    "@vivalence/topology/verbs/lemmas",
    "@vivalence/topology/verbs/conjugations/ser",
    "@vivalence/topology/verbs/conjugations/estar",
  ], //
};

export { curriculum, manifest, modules, schema };
