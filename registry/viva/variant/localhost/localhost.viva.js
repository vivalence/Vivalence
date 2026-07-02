import paladin from "@vivalence/paladin";
import { Url } from "@vivalence/typology";

export const manifest = {
  type: "variant",
  slug: "localhost",
  version: "0.0.1",
};

export const runtime = {
  slug: "runtime",
  traits: ["EMBEDDED"],
  statics: {
    serve: () => new Url(paladin.env.get("VIVA_RUNTIME_SERVE")),
  },
  datamap: {
    module: "@viva/datamap/libsql",
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
        remote: () => new Url(paladin.env.get("PUBLIC_VIVA_LIGHTHOUSE_REMOTE")),
      },
    },
  },
  kajuit: {
    slug: "kajuit",
    statics: {
      serve: () => new Url(paladin.env.get("VIVA_CLIENT_KAJUIT_SERVE")),
      lighthouse: {
        remote: () => new Url(paladin.env.get("PUBLIC_VIVA_LIGHTHOUSE_REMOTE")),
      },
    },
  },
};

export const services = [
  {
    slug: "multiplayer",
    module: "@viva/lighthouse/multiplayer",
    secrets: { jwt: () => paladin.secret.get("SECRET_VIVA_JWT") },
    statics: { serve: () => new Url(paladin.env.get("VIVA_LIGHTHOUSE_SERVE")) },
    datamap: {
      module: "@viva/datamap/libsql",
      statics: { db: { file: `lighthouse.viva.db` } },
    },
  },
  {
    slug: "nlp-stanza",
    module: "@viva/service/nlp-stanza",
    secrets: { key: () => paladin.secret.get("SECRET_VIVA_SERVICE_NLP_KEY") },
    statics: {
      serve: () => new Url(paladin.env.get("SERVICE_NLP_SERVE")),
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
      "@education/domain/language-learning",
      "@education/ontology/word",
      "@education/ontology/sentence",
      "@education/ontology/conjugation",
      "@education/corpus/english-to-brazilian",
    ],

    modes: [
      "@education/game/flashcard",
      "@education/game/write",
      "@education/game/shadow",
      "@education/game/conjugation",
      "@education/game/judge",
      "@education/game/match",
      "@education/game/pick",
      "@education/game/cloze",
      "@education/game/listen",
      "@education/game/paradigm",
      "@education/game/exhibit",
      "@education/tactic/five-fold-session",
      "@education/tactic/clinic",
      "@education/dashboard/dataspace",
      "@education/teacher/dewey",
    ],

    lighthouse: {
      module: "@viva/lighthouse/multiplayer",
      statics: {
        remote: () => new Url(paladin.env.get("PUBLIC_VIVA_LIGHTHOUSE_REMOTE")),
      },
    },

    datamap: {
      module: "@viva/datamap/libsql",
      statics: {
        db: { file: `localhost.viva.db` },
      },
    },

    hallucinators: [
      {
        module: "@viva/hallucinator/anthropic",
        statics: {},
        secrets: { key: () => paladin.secret.get("SECRET_VIVA_ANTHROPIC_API_KEY") },
      },
      {
        module: "@viva/hallucinator/elevenlabs",
        statics: {},
        secrets: { key: () => paladin.secret.get("SECRET_VIVA_ELEVENLABS_API_KEY") },
      },
      {
        module: "@viva/hallucinator/deepgram",
        statics: {},
        secrets: { key: () => paladin.secret.get("SECRET_VIVA_DEEPGRAM_API_KEY") },
      },
    ],

    consume: {
      nlp: {
        module: "@viva/service/nlp-stanza",
        secrets: { key: () => paladin.secret.get("SECRET_VIVA_SERVICE_NLP_KEY") },
        statics: {
          remote: () => new Url(paladin.env.get("SERVICE_NLP_REMOTE")),
          language: "es",
          processors: "tokenize,mwt,pos,lemma,depparse",
        },
      },
    },
  },
];
