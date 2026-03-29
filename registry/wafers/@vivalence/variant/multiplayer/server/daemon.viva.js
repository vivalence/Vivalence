import paladin from "@vivalence/paladin";
import { Url, Env, Vector } from "@vivalence/typology";

export const manifest = {
  type: "circuit",
  slug: "daemon",
};

export const daemons = [
  {
    manifest: {
      type: "daemon",
      slug: "brazilian",
      version: "0.0.1",
      traits: ["ACTIVE"],
    },

    // docs: {name: "", valence: "", icon: { emoji: "" },},

    statics: {
      language: { known: "english", learning: "brazilian" },
    },

    kernel: [
      "@vivalence/domain/language-learning",
      "@vivalence/ontology/word",
      "@vivalence/ontology/sentence",
      "@vivalence/topology/english-to-brazilian:survival",
    ],

    modes: [
      "@vivalence/game/flashcard",
      "@vivalence/game/write",
      "@vivalence/game/shadow",
      "@vivalence/game/judge",
      "@vivalence/game/match",
      "@vivalence/game/pick",
      "@vivalence/game/cloze",
      "@vivalence/game/listen",
      "@vivalence/game/exhibit",
      "@vivalence/tactic/survival",
    ],

    lighthouse: {
      module: "@vivalence/lighthouse/multiplayer",
      statics: {
        remote: new Url(paladin.env.get("PUBLIC_VIVA_LIGHTHOUSE_REMOTE")),
      },
    },

    datamap: {
      module: "@vivalence/datamap/libsql",
      statics: {
        db: { file: `test-language.viva.db` },
      },
    },

    hallucinator: {
      module: "@vivalence/hallucinator/hal257",
      statics: {},
      secrets: {
        anthropic: paladin.secret.get("SECRET_VIVA_ANTHROPIC_API_KEY"),
      },
      profiles: {
        // DRONE: {provider: "anthropic", model: "claude-3-5-haiku-latest", dimensions: { speed: 0.6, cost: 0.2, intelligence: 0.4 }, params: { temperature: 0.7, maxTokens: 4000 },}, ACADEMIC: {provider: "anthropic", model: "claude-3-7-sonnet-latest", dimensions: { speed: 0.3, cost: 0.9, intelligence: 0.8 }, params: {thinking: { type: "enabled", budgetTokens: 12000 }, temperature: 0.7, maxTokens: 20000,},},
      },
    },

    consume: {
      // nlp: {module: "@vivalence/service/nlp-stanza", secrets: { key: paladin.secret.get("SERVICE_NLP_KEY") }, statics: {remote: new Url(paladin.env.get("SERVICE_NLP_REMOTE")), language: "es", processors: "tokenize,mwt,pos,lemma,depparse",},},
    },
  },
];

export const services = [
  // {slug: "nlp-stanza", module: "@vivalence/service/nlp-stanza", secrets: { key: paladin.secret.get("SERVICE_NLP_KEY") }, statics: {serve: new Url(paladin.env.get("SERVICE_NLP_SERVE")), processors: "tokenize,mwt,pos,lemma,depparse",},},
];
