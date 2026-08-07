import paladin from "@vivalence/paladin";
import { Env, Url } from "@vivalence/typology";

export const manifest = {
  type: "variant",
  slug: "multiplayer",
};

// export const runtime = {slug: "runtime", traits: ["EMBEDDED"], statics: {serve: () => new Url(paladin.env.get("VIVA_RUNTIME_SERVE")),}, datamap: {module: "@viva/datamap/libsql", statics: {db: { file: `runtime.viva.db` },},},};

export const clients = {
  kajuit: {
    slug: "kajuit",
    // module: "@vivalence/kajuit",
    statics: {
      serve: () => new Url(paladin.env.get("VIVA_CLIENT_KAJUIT_SERVE")),
      lighthouse: {
        remote: () => new Url(paladin.env.get("PUBLIC_VIVA_LIGHTHOUSE_REMOTE")),
      },
    },
  },
};

export const runtime = {
  slug: "runtime",
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

export const lighthouse = {
  statics: {
    remote: () => new Url(paladin.env.get("PUBLIC_VIVA_LIGHTHOUSE_REMOTE")),
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
];

export const daemons = [
  {
    manifest: { type: "daemon", slug: "italian", version: "0.0.1" },
    docs: { name: "", valence: "", icon: { emoji: "" } },
    statics: { language: { known: "english", learning: "italian" } },
    kernel: [
      "@education/domain/language-learning",
      "@education/topology/word",
      "@education/topology/sentence",
      "@education/topology/conjugation",
      "@education/topography/english-to-italian",

      "@education/teacher/francesca",
      "@education/dashboard/dataspace",

      // "@education/homepage/aprende",
      // "@education/tactic/impara",

      // "@education/game/flashcard",
      // "@education/game/write",
      // "@education/game/nyan",
      // "@education/game/riddler",
      // "@education/game/exhibit",
      // "@education/game/judge",
      // "@education/game/listen",
      // "@education/game/match",
      // "@education/game/pick",
      // "@education/game/shadow",
      // "@education/game/paradigm",
      // "@education/game/conjugation",
    ],
    lighthouse: {
      module: "@viva/lighthouse/multiplayer",
      statics: {
        remote: () => new Url(paladin.env.get("PUBLIC_VIVA_LIGHTHOUSE_REMOTE")),
      },
    },
    datamap: {
      module: "@viva/datamap/libsql",
      statics: { db: { file: `test-language-italian.viva.db` } },
    },
    hallucinators: [
      {
        module: "@viva/hallucinator/openrouter",
        statics: {
          models: {
            fast: {
              id: "deepseek/deepseek-v4-flash",
              tune: [0.4, 0.4, 1.0, 1.0],
              context: 1048576,
              thinking: false,
            },
          },
        },
        secrets: { key: () => paladin.secret.get("SECRET_VIVA_OPENROUTER_API_KEY") },
      },
      {
        module: "@viva/hallucinator/anthropic",
        statics: {},
        secrets: { key: () => paladin.secret.get("SECRET_VIVA_ANTHROPIC_API_KEY") },
      },
    ],
  },
  // {
  //   manifest: { type: "daemon", slug: "spanish", version: "0.0.1" },
  //   docs: { name: "", valence: "", icon: { emoji: "" } },
  //   statics: { language: { known: "english", learning: "spanish" } },
  //   kernel: [
  //     "@education/domain/language-learning",
  //     "@education/topology/word",
  //     "@education/topology/sentence",
  //     "@education/topology/conjugation",
  //     "@education/topography/english-to-spanish",

  //     "@education/homepage/aprende",
  //     "@education/dashboard/dataspace",

  //     "@education/game/flashcard",
  //     "@education/game/write",
  //     "@education/game/nyan",
  //     "@education/game/riddler",

  //     "@education/tactic/clinic",
  //     "@education/tactic/five-fold-session",
  //     "@education/game/shadow",
  //     "@education/game/conjugation",
  //     "@education/game/judge",
  //     "@education/game/listen",
  //     "@education/game/paradigm",
  //     "@education/game/match",
  //     "@education/game/pick",
  //     "@education/game/cloze",
  //     "@education/game/exhibit",
  //     // "@education/teacher/dewey",
  //   ],
  //   lighthouse: {
  //     module: "@viva/lighthouse/multiplayer",
  //     statics: {
  //       remote: () => new Url(paladin.env.get("PUBLIC_VIVA_LIGHTHOUSE_REMOTE")),
  //     },
  //   },
  //   datamap: {
  //     module: "@viva/datamap/libsql",
  //     statics: { db: { file: `test-language-spanish.viva.db` } },
  //   },
  //   hallucinators: [
  //     {
  //       module: "@viva/hallucinator/anthropic",
  //       statics: {},
  //       secrets: {
  //         key: () => paladin.secret.get("SECRET_VIVA_ANTHROPIC_API_KEY"),
  //       },
  //     },
  //     {
  //       module: "@viva/hallucinator/elevenlabs",
  //       statics: {},
  //       secrets: {
  //         key: () => paladin.secret.get("SECRET_VIVA_ELEVENLABS_API_KEY"),
  //       },
  //     },
  //     {
  //       module: "@viva/hallucinator/deepgram",
  //       statics: {},
  //       secrets: {
  //         key: () => paladin.secret.get("SECRET_VIVA_DEEPGRAM_API_KEY"),
  //       },
  //     },
  //   ],
  //   // consume: {nlp: {module: "@viva/service/nlp-stanza", secrets: { key: () => paladin.secret.get("SECRET_VIVA_SERVICE_NLP_KEY") }, statics: {remote: () => new Url(paladin.env.get("SERVICE_NLP_REMOTE")), language: "es", processors: "tokenize,mwt,pos,lemma,depparse",},},},
  // },
  // {
  //   manifest: {
  //     type: "daemon",
  //     slug: "brazilian",
  //     version: "0.0.1",
  //     traits: ["ACTIVE"],
  //   },

  //   // docs: {name: "", valence: "", icon: { emoji: "" },},

  //   statics: {
  //     language: { known: "english", learning: "brazilian" },
  //   },

  //   kernel: [
  //     "@education/domain/language-learning",
  //     "@education/topology/word",
  //     "@education/topology/sentence",
  //     "@education/topology/conjugation",
  //     "@education/topography/english-to-brazilian",
  //     "@education/game/flashcard",
  //     "@education/game/write",
  //     "@education/game/shadow",
  //     "@education/game/judge",
  //     "@education/game/match",
  //     "@education/game/conjugation",
  //     "@education/game/paradigm",
  //     "@education/game/pick",
  //     "@education/game/cloze",
  //     "@education/game/listen",
  //     "@education/game/exhibit",
  //     "@education/tactic/five-fold-session",
  //     "@education/tactic/clinic",

  //     "@education/dashboard/dataspace",
  //     // "@education/teacher/dewey",
  //   ],

  //   lighthouse: {
  //     module: "@viva/lighthouse/multiplayer",
  //     statics: {
  //       remote: () => new Url(paladin.env.get("PUBLIC_VIVA_LIGHTHOUSE_REMOTE")),
  //     },
  //   },

  //   datamap: {
  //     module: "@viva/datamap/libsql",
  //     statics: {
  //       db: { file: `test-language.viva.db` },
  //     },
  //   },

  //   hallucinators: [
  //     {
  //       module: "@viva/hallucinator/anthropic",
  //       statics: {},
  //       secrets: {
  //         key: () => paladin.secret.get("SECRET_VIVA_ANTHROPIC_API_KEY"),
  //       },
  //     },
  //     // {module: "@viva/hallucinator/elevenlabs", statics: {}, secrets: { key: () => paladin.secret.get("SECRET_VIVA_ELEVENLABS_API_KEY") },}, {module: "@viva/hallucinator/deepgram", statics: {}, secrets: { key: () => paladin.secret.get("SECRET_VIVA_DEEPGRAM_API_KEY") },},
  //   ],

  //   consume: {
  //     // nlp: {module: "@viva/service/nlp-stanza", secrets: { key: () => paladin.secret.get("SECRET_VIVA_SERVICE_NLP_KEY") }, statics: {remote: () => new Url(paladin.env.get("SERVICE_NLP_REMOTE")), language: "es", processors: "tokenize,mwt,pos,lemma,depparse",},},
  //   },
  // },
];
