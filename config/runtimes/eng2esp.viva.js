export default function (config) {
  return;
  const manifest = {
    type: "runtime",
    slug: "eng2esp",
    name: "spanish",
    icon: { emoji: "" },
    version: "0.0.1",
    // traits: ["ACTIVE"],
  };

  const statics = { language: { known: "english", learning: "spanish" } };

  const domain = "@vivalence/domain/learning";
  const ontology = "@vivalence/ontology/language";

  const modules = {
    topic: ["@vivalence/topic/eng-to-esp"],
    game: ["@vivalence/game/flashcards"],
    tactic: ["@vivalence/tactic/spaced-repetition"],
    agent: ["@vivalence/agent/eva"],
  };

  const lighthouse = {
    module: "@vivalence/lighthouse/multiplayer",
    secret: { jwt: config.env.secrets.get("JWT_SECRET") },
    config: { authority: { url: config.env.get("VIVA_LIGHTHOUSE_URL") } },
  };

  const database = {
    module: "@vivalence/database/libsql",
    config: {
      db: { path: `/${manifest.slug}.viva.db` },
    },
  };

  const services = {
    brain: {
      module: "@vivalence/service/brain",
      secret: {
        providers: {
          anthropic: config.env.secrets.get("ANTHROPIC_API_KEY"),
        },
      },
      config: {
        profiles: {
          DRONE: {
            provider: "anthropic",
            model: "claude-3-5-haiku-latest",
            dimensions: { speed: 0.6, cost: 0.2, intelligence: 0.4 },
            params: { temperature: 0.7, maxTokens: 4000 },
          },
          ACADEMIC: {
            provider: "anthropic",
            model: "claude-3-7-sonnet-latest",
            dimensions: { speed: 0.3, cost: 0.9, intelligence: 0.8 },
            params: {
              thinking: { type: "enabled", budgetTokens: 12000 },
              temperature: 0.7,
              maxTokens: 20000,
            },
          },
        },
      },
    },
    nlp: {
      module: "@vivalence/service/nlp-stanza",
      data: config.joins.data.runtime(manifest.slug, "nlp"),
      secret: {
        env: {
          key: config.env.secrets.get("SERVICE_NLP_KEY"),
        },
      },
      config: {
        processors: "tokenize,mwt,pos,lemma,depparse",
        language: "la",
        env: {
          url: config.env.service.get("SERVICE_NLP_URL"),
          port: config.env.service.get("SERVICE_NLP_PORT"),
        },
      },
    },
  };

  return {
    manifest,
    lighthouse,
    database,
    domain,
    ontology,
    modules,
    services,
    statics,
  };
}
// export default function (config) {
//   return;
//   const manifest = {
//     type: "runtime",
//     slug: "eng2esp",
//     name: "English to Spanish",
//     icon: { emoji: "🇪🇸" },
//     version: "0.0.2",
//   };

//   const statics = { language: { known: "english", learning: "spanish" } };

//   const domain = "@vivalence/domain/learning";

//   const modules = {
//     ontology: "@vivalence/ontology/language",
//     corpora: ["@vivalence/corpus/cefr-eng-to-esp"],
//     games: [
//       //
//       "@vivalence/game/conjugations",
//       "@vivalence/game/flashcards",
//       "@vivalence/game/translations",
//       "@vivalence/game/prose",
//     ],
//     tactics: [
//       //
//       "@vivalence/tactic/sentences",
//       "@vivalence/tactic/spaced-repetition",
//       "@vivalence/tactic/article-practice",
//       "@vivalence/tactic/verb-conjugation-practice",
//       "@vivalence/tactic/pronominalization-practice",
//     ],
//   };

//   const services = {
//     database: {
//       // service: "@vivalence/services/database/libsql",
//       service: "@vivalence/service/libsql",
//       config: {
//         filePath: path.join(
//           config.env.get("VIVA_RUNTIMES_DIR"),
//           manifest.slug,
//           `${manifest.slug}.viva.db`,
//         ),
//       },
//     },
//     nlp: {
//       service: "@vivalence/service/nlp-stanza",
//       config: {
//         language: "es",
//         processors: "tokenize,mwt,pos,lemma,depparse",
//         env: {
//           url: config.env.get("SERVICE_NLP_URL"),
//           port: config.env.get("SERVICE_NLP_PORT"),
//           key: config.env.get("SERVICE_NLP_KEY"),
//         },
//       },
//     },
//   };

//   return { manifest, domain, modules, services, statics };
// }
