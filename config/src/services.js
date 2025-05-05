// import Repository from "@vivalence/repository";

export default async function (config) {
  config.services = {
    ...config.services,
    llm: {
      service: "@vivalence/service/llm-litellm",
      config: {
        keys: {
          openai: config.env.get("OPENAI_API_KEY"),
          groq: config.env.get("GROQ_API_KEY"),
          anthropic: config.env.get("ANTHROPIC_API_KEY"),
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
