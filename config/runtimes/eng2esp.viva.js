export default function (config) {
  return;
  const manifest = {
    type: "runtime",
    slug: "eng2esp",
    name: "English to Spanish",
    icon: { emoji: "🇪🇸" },
    version: "0.0.2",
  };

  const statics = { language: { known: "english", learning: "spanish" } };

  const domain = "@vivalence/domain/learning";

  const modules = {
    ontology: "@vivalence/ontology/language",
    corpora: ["@vivalence/corpus/cefr-eng-to-esp"],
    games: [
      //
      "@vivalence/game/conjugations",
      "@vivalence/game/flashcards",
      "@vivalence/game/translations",
      "@vivalence/game/prose",
    ],
    tactics: [
      //
      "@vivalence/tactic/sentences",
      "@vivalence/tactic/spaced-repetition",
      "@vivalence/tactic/article-practice",
      "@vivalence/tactic/verb-conjugation-practice",
      "@vivalence/tactic/pronominalization-practice",
    ],
  };

  const services = {
    database: {
      // service: "@vivalence/services/database/libsql",
      service: "@vivalence/service/libsql",
      config: {
        filePath: path.join(
          config.env.get("VIVA_RUNTIMES_DIR"),
          manifest.slug,
          `${manifest.slug}.viva.db`,
        ),
      },
    },
    nlp: {
      service: "@vivalence/service/nlp-stanza",
      config: {
        language: "es",
        processors: "tokenize,mwt,pos,lemma,depparse",
        env: {
          url: config.env.get("SERVICE_NLP_URL"),
          port: config.env.get("SERVICE_NLP_PORT"),
          key: config.env.get("SERVICE_NLP_KEY"),
        },
      },
    },
  };

  return { manifest, domain, modules, services, statics };
}
