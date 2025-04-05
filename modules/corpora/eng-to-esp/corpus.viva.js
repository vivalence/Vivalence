import curriculum from "./curriculum/index.js";
import topology from "./topology/index.js";

const manifest = {
  type: "corpus",
  slug: "cefr-eng-to-esp",
  name: "CEFR - English to Spanish",
  icon: { emoji: "🇪🇺" },
  version: "0.0.4",
  traits: ["TOPOLOGICAL"],
};

const modules = {
  domain: "@vivalence/domain/base",
  ontology: "@vivalence/ontology/language",
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
  // strategies: [],
  // curricula: ["@vivalence/langauge/", "@vivalence/topology/verbs",],
  // topologies: ["@vivalence/topology/nouns", "@vivalence/topology/verbs",],
};

// const requires = {services:{}}

export { manifest, modules, curriculum, topology };
