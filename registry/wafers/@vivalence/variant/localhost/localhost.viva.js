import paladin from "@vivalence/paladin";
import { Url } from "@vivalence/typology";

export const manifest = {
  owner: "@vivalence",
  type: "variant",
  slug: "localhost",
  version: "0.0.1",
};

export const runtime = {
  slug: "runtime",
  traits: ["EMBEDDED"],
  statics: {
    serve: new Url(paladin.env.get("VIVA_RUNTIME_SERVE")),
  },
  datamap: {
    module: "@vivalence/datamap/libsql",
    statics: {
      db: { file: `runtime.viva.db` },
    },
  },
};

export const clients = {
  ghost: {
    slug: "ghost",
    statics: {
      lighthouse: {
        remote: new Url(paladin.env.get("PUBLIC_VIVA_LIGHTHOUSE_REMOTE")),
      },
    },
  },
  kajuit: {
    slug: "kajuit",
    statics: {
      serve: new Url(paladin.env.get("VIVA_CLIENT_KAJUIT_SERVE")),
      lighthouse: {
        remote: new Url(paladin.env.get("PUBLIC_VIVA_LIGHTHOUSE_REMOTE")),
      },
    },
  },
};

export const services = [
  {
    slug: "multiplayer",
    module: "@vivalence/lighthouse/multiplayer",
    secrets: { jwt: paladin.secret.get("SECRET_VIVA_JWT") },
    statics: { serve: new Url(paladin.env.get("VIVA_LIGHTHOUSE_SERVE")) },
    datamap: {
      module: "@vivalence/datamap/libsql",
      statics: { db: { file: `lighthouse.viva.db` } },
    },
  },
  {
    slug: "nlp-stanza",
    module: "@vivalence/service/nlp-stanza",
    secrets: { key: paladin.secret.get("SECRET_VIVA_SERVICE_NLP_KEY") },
    statics: {
      serve: new Url(paladin.env.get("SERVICE_NLP_SERVE")),
      processors: "tokenize,mwt,pos,lemma,depparse",
    },
  },
];

export const daemons = [
  {
    manifest: {
      type: "daemon",
      slug: "brazilian",
      version: "0.0.1",
      traits: ["ACTIVE"],
    },

    docs: {
      name: "",
      valence: "",
      icon: { emoji: "" },
    },

    statics: {
      language: { known: "english", learning: "brazilian" },
    },

    kernel: [
      "@vivalence/domain/language-learning",
      "@vivalence/ontology/word",
      "@vivalence/ontology/sentence",
      "@vivalence/ontology/conjugation",
      "@vivalence/corpus/english-to-brazilian",
    ],

    modes: [
      "@vivalence/game/flashcard",
      "@vivalence/game/write",
      "@vivalence/game/shadow",
      "@vivalence/game/conjugation",
      "@vivalence/game/judge",
      "@vivalence/game/match",
      "@vivalence/game/pick",
      "@vivalence/game/cloze",
      "@vivalence/game/listen",
      "@vivalence/game/paradigm",
      "@vivalence/game/exhibit",
      "@vivalence/tactic/five-fold-session",
      "@vivalence/tactic/clinic",
      "@vivalence/dashboard/dataspace",
      "@vivalence/teacher/dewey",
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
        db: { file: `localhost.viva.db` },
      },
    },

    hallucinators: [
      {
        module: "@vivalence/hallucinator/anthropic",
        statics: {},
        secrets: { key: paladin.secret.get("SECRET_VIVA_ANTHROPIC_API_KEY") },
      },
      {
        module: "@vivalence/hallucinator/elevenlabs",
        statics: {},
        secrets: { key: paladin.secret.get("SECRET_VIVA_ELEVENLABS_API_KEY") },
      },
      {
        module: "@vivalence/hallucinator/deepgram",
        statics: {},
        secrets: { key: paladin.secret.get("SECRET_VIVA_DEEPGRAM_API_KEY") },
      },
    ],

    consume: {
      nlp: {
        module: "@vivalence/service/nlp-stanza",
        secrets: { key: paladin.secret.get("SECRET_VIVA_SERVICE_NLP_KEY") },
        statics: {
          remote: new Url(paladin.env.get("SERVICE_NLP_REMOTE")),
          language: "es",
          processors: "tokenize,mwt,pos,lemma,depparse",
        },
      },
    },
  },
];
