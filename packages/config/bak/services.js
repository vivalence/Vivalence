import * as path from "@std/path";

// this must somehow be available to daemon.

export default async function (config) {
  config.services = {
    database: {
      service: "@vivalence/service/libsql",
      config: {
        filePath: path.join(
          config.env.get("VIVA_DATA_DIR"),
          `daemon/daemon.viva.db`,
        ),
      },
    },
    brain: {
      service: "@vivalence/service/brain",
      config: {
        providers: {
          // openai: config.env.get("OPENAI_API_KEY"),
          // groq: config.env.get("GROQ_API_KEY"),
          anthropic: config.env.get("ANTHROPIC_API_KEY"),
          // customName: {
          //   name: "customName",
          //   apiKey: config.env.get("SOME_API_KEY"),
          //   baseURL: "",
          // },
        },
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
  };

  if (config.env.get("VIVA_IDENTITY_MODE") === "LOCALHOST")
    config.services.identity = {
      service: "@vivalence/service/localhost",
    };

  return config;
}
