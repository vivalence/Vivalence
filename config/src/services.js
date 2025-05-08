export default async function (config) {
  config.services = {
    ...config.services,
    llm: {
      service: "@vivalence/service/llm",
      config: {
        providers: {
          // openai: config.env.get("OPENAI_API_KEY"),
          // groq: config.env.get("GROQ_API_KEY"),
          anthropic: config.env.get("ANTHROPIC_API_KEY"),
        },
        profiles: {
          QUICKBOT: {
            provider: "anthropic",
            model: "claude-3-5-haiku-latest",
            dimensions: { speed: 0.6, cost: 0.2, intelligence: 0.4 },
            params: { temperature: 0.7, max_tokens: 4000 },
          },
          STRATEGIST: {
            provider: "anthropic",
            model: "claude-3-7-sonnet-latest",
            dimensions: { speed: 0.3, cost: 0.9, intelligence: 0.8 },
            params: { temperature: 0.7, max_tokens: 4000 },
          },
        },
      },
    },
    database: {
      service: "@vivalence/service/libsql",
      config: {
        filePath: config.env.get("VIVA_DATABASE_PATH"),
      },
    },
    identity: {
      service: "@vivalence/service/identity",
      config: { mode: "SINGLEPLAYER", env: {} },
    },
  };
  // config.services = await Repository.services.load({...config.services, database: {service: "@vivalence/service/libsql", config: {filePath: config.env.get("VIVA_DATABASE_PATH"),},}, identity: { service: "@vivalence/service/identity", config: { mode: "SINGLEPLAYER", env: {} } },});

  return config;
}
