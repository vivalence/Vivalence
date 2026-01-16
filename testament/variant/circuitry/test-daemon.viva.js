import paladin from "@vivalence/paladin";
import { Url, Env } from "@vivalence/typology";
import { Vector } from "@vivalence/vector";

export const manifest = {
  type: "circuit",
  slug: "test-daemon",
};

export const daemons = [
  {
    manifest: {
      type: "daemon",
      slug: "test-language",
      version: "0.0.1",
      traits: ["ACTIVE"],
    },

    docs: {
      name: "para estudiar espanol",
      valence: "para estudiar espanol. english to spanish.",
      icon: { emoji: "" },
    },

    statics: {
      language: { known: "english", learning: "spanish" },
    },

    kernel: [
      "@vivalence/ontology/language",
      "@vivalence/topic/spanish",
      "@vivalence/domain/learning",
    ],

    modes: [
      "@vivalence/teacher/dewey",
      // "@vivalence/game/flashcards", "@vivalence/game/translations", "@vivalence/tactic/koans", "@vivalence/tactic/drill", "@vivalence/teacher/iroh", "@vivalence/teacher/miyagi",
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
        anthropic: paladin.secret.get("ANTHROPIC_API_KEY"),
      },
      profiles: {
        // DRONE: {provider: "anthropic", model: "claude-3-5-haiku-latest", dimensions: { speed: 0.6, cost: 0.2, intelligence: 0.4 }, params: { temperature: 0.7, maxTokens: 4000 },}, ACADEMIC: {provider: "anthropic", model: "claude-3-7-sonnet-latest", dimensions: { speed: 0.3, cost: 0.9, intelligence: 0.8 }, params: {thinking: { type: "enabled", budgetTokens: 12000 }, temperature: 0.7, maxTokens: 20000,},},
      },
      // optional
      // datamap: {module: "@vivalence/datamap/libsql", statics: {db: { file: `lighthouse.viva.db` },},},
    },

    consume: {
      nlp: {
        module: "@vivalence/service/nlp-stanza",
        secrets: { key: paladin.secret.get("SERVICE_NLP_KEY") },
        statics: {
          remote: new Url(paladin.env.get("SERVICE_NLP_REMOTE")),
          language: "es",
          processors: "tokenize,mwt,pos,lemma,depparse",
        },
      },
    },
  },
];

export const services = [
  // variant.mode = "process"
  {
    // cake to be fabricated into a process by runtime, controlled via the control vector exported by the nlp.viva.js service module.
    slug: "nlp-stanza",
    module: "@vivalence/service/nlp-stanza",
    secrets: { key: paladin.secret.get("SERVICE_NLP_KEY") },
    statics: {
      serve: new Url(paladin.env.get("SERVICE_NLP_SERVE")),
      processors: "tokenize,mwt,pos,lemma,depparse",
    },
  },
];

//

// export const control = new Vector()
//   .use(async (ctx, next) => {
//     (async () => await runtime.ikiro)();
//     await next();
//   })
//   .open(`/ikiro`, async (ctx) => {
//     // const runtime = await import( "@vivalence/runtime");
//     // const process = (async () => await runtime.ikiro)();
//     // map processes and clients * up
//   });
