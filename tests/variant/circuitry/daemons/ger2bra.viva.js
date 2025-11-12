// import { Url, Env } from "@vivalence/typology";
// import paladin from "@vivalence/paladin";

// lighthouse,
// datamap,

// const authority : { // read globally
//   secret: { jwt: config.env.secrets.get("JWT_SECRET") },
//   url: config.env.get("VIVA_LIGHTHOUSE_URL"),
// };

// const datamap : { // assume default by fallback on daemon.datamap ::: null
//   module: "@vivalence/datamap/libsql",
//   config: {
//     db: { path: `/${manifest.slug}.viva.db` },
//   },
// };

// const halucinators : {DRONE: {slug: "drone", type: "llm", provider: "anthropic", model: "claude-3-5-haiku-latest", dimensions: { speed: 0.6, cost: 0.2, intelligence: 0.4 }, params: { temperature: 0.7, maxTokens: 4000 },}, ACADEMIC: {slug: "academic", provider: "anthropic", model: "claude-3-7-sonnet-latest", dimensions: { speed: 0.3, cost: 0.9, intelligence: 0.8 }, config: {thinking: { type: "enabled", budgetTokens: 12000 }, temperature: 0.7, maxTokens: 20000,},},}; const hallucinator : {module: "@vivalence/service/hal", secret: {providers: { anthropic: config.env.secrets.get("ANTHROPIC_API_KEY") },}, config: {provider: "anthropic", profiles: {DRONE: {provider: "anthropic", model: "claude-3-5-haiku-latest", dimensions: { speed: 0.6, cost: 0.2, intelligence: 0.4 }, params: { temperature: 0.7, maxTokens: 4000 },}, ACADEMIC: {provider: "anthropic", model: "claude-3-7-sonnet-latest", dimensions: { speed: 0.3, cost: 0.9, intelligence: 0.8 }, config: {thinking: { type: "enabled", budgetTokens: 12000 }, temperature: 0.7, maxTokens: 20000,},},},},};
