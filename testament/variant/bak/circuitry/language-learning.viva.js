import paladin from "@vivalence/paladin";
import { Url, Env } from "@vivalence/typology";
import { Vector } from "@vivalence/vector";

export const manifest = {
  type: "circuit",
  slug: "language-learning",
};

export const daemons = [
  {
    manifest: {
      type: "daemon",
      slug: "ger2esp",
      version: "0.0.1",
      traits: ["ACTIVE"],
    },

    docs: {
      name: "para estudiar espanol",
      valence: "para estudiar espanol. deutsch nach spanish",
      icon: { emoji: "" },
    },

    statics: {
      language: { known: "german", learning: "spanish" },
    },

    kernel: [
      "@vivalence/ontology/language",
      "@vivalence/topology/spanish",
      "@vivalence/domain/learning",
    ],

    modes: [
      "@vivalence/agent/eva",
      // "@vivalence/game/flashcards", "@vivalence/game/translations", "@vivalence/tactic/koans", "@vivalence/tactic/drill", "@vivalence/teacher/iroh", "@vivalence/teacher/miyagi",
    ],

    authority: {
      module: "@vivalence/lighthouse/multiplayer",
      statics: {
        remote: new Url(paladin.env.get("PUBLIC_VIVA_LIGHTHOUSE_REMOTE")),
      },
    },

    datamap: {
      module: "@vivalence/datamap/libsql",
      statics: {
        db: { file: `ger2esp.viva.db` },
      },
    },

    consume: {
      nlp: {
        slug: "nlp",
        module: "@vivalence/service/nlp-stanza",
        provider: "nlp-stanza", // implies: slug: "nlp", module: "@vivalence/service/nlp-stanza",
        statics: {
          remote: new Url(paladin.env.get("SERVICE_NLP_REMOTE")),
          language: "es",
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
