import paladin from "@vivalence/paladin";
import { Env, Url } from "@vivalence/typology";

export const manifest = {
  type: "circuit",
  slug: "multiplayer-starter",
  traits: ["EMBEDDED"], // everything on this circuit will be auto-started (daemonized)
};

export const runtime = {
  slug: "kajuit",
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

export const services = [
  {
    slug: "hanse",
    module: "@vivalence/lighthouse/multiplayer",
    secrets: { jwt: paladin.secret.get("JWT_SECRET") },
    statics: {
      serve: new Url(paladin.env.get("VIVA_LIGHTHOUSE_SERVE")),
    },
    datamap: {
      module: "@vivalence/datamap/libsql",
      statics: { db: { file: `lighthouse.viva.db` } },
    },
  },

  {
    slug: "hal",
    module: "@vivalence/hallucinator/hal257",
    secrets: { anthropic: "KEY" },
    statics: {},
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
];
