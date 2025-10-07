export default function (config) {
  const manifest = {
    type: "runtime",
    slug: "eng2lat",
    name: "Latin Learning",
    icon: { emoji: "" },
    version: "0.0.1",
    traits: ["ACTIVE"],
  };

  const statics = { language: { known: "english", learning: "latin" } };

  const modules = {
    domain: "@vivalence/domain/learning",
    ontology: "@vivalence/ontology/language",
    topic: ["@vivalence/topic/eng-to-lat"],
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
    modules,
    services,
    statics,
  };
}
