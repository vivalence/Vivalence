import paladin from "@vivalence/paladin";
import { v } from "@vivalence/typology";

export const manifest = { type: "instance", slug: "hello-world", version: "0.0.1" };

export const datamap = { module: "@commons/datamap/libsql" };

export const lighthouse = {
  module: "@commons/lighthouse/multiplayer",
  statics: { remote: () => paladin.env.get("PUBLIC_VIVA_LIGHTHOUSE_REMOTE") },
};

export const hallucinators = [
  {
    module: "@commons/hallucinator/anthropic",
    secrets: { key: () => paladin.secret.get("SECRET_VIVA_ANTHROPIC_API_KEY") },
  },
  {
    module: "@commons/hallucinator/openrouter",
    secrets: { key: () => paladin.secret.get("SECRET_VIVA_OPENROUTER_API_KEY") },
  },
];

export const daemons = [
  {
    manifest: { type: "daemon", slug: "hello", version: "0.0.1" },
    kernel: [
        "./mode.viva.js"
        // or: "@commons/demo/hello-world"
    ],
    consume: {
      reader: { module: "@commons/service/reader" },
    },
  },
];

export const runtime = {
  manifest: { slug: "runtime" },
  statics: { serve: () => paladin.env.get("VIVA_RUNTIME_SERVE") },
};

export const clients = [
  {
    manifest: { type: "client", slug: "kajuit" },
    statics: { serve: () => paladin.env.get("VIVA_CLIENT_KAJUIT_SERVE") },
  },
];

export const services = [
  {
    manifest: { type: "service", slug: "multiplayer" },
    module: "@commons/lighthouse/multiplayer",
    secrets: { jwt: () => paladin.secret.get("SECRET_VIVA_JWT") },
    statics: { serve: () => paladin.env.get("VIVA_LIGHTHOUSE_SERVE") },
  },
];

export const environment = v.environment({
  VIVA_RUNTIME_ORIGIN: v.url().desc("Scheme and authority the runtime is reachable at. Every address below derives from it.").default("http://localhost:2501").group("addresses"),
  VIVA_CLIENT_KAJUIT_ORIGIN: v.url().desc("Scheme and authority the kajuit browser client is reachable at.").default("http://localhost:1794").group("addresses"),
  VIVA_RUNTIME_SERVE: v.url().desc("Base URL the runtime serves on. Everything else hangs off this latch.").default("${VIVA_RUNTIME_ORIGIN}/").group("addresses"),
  VIVA_LIGHTHOUSE_SERVE: v.url().desc("Where the hosted lighthouse attaches inside the runtime's own path tree.").default("${VIVA_RUNTIME_ORIGIN}/attached/process/lighthouse/multiplayer").group("addresses"),
  VIVA_CLIENT_KAJUIT_SERVE: v.url().desc("Where the kajuit browser client serves.").default("${VIVA_CLIENT_KAJUIT_ORIGIN}/").group("addresses"),
  PUBLIC_VIVA_RUNTIME_REMOTE: v.url().desc("Runtime address the browser bundle calls. Reaches it through publish(), not a thunk.").default("${VIVA_RUNTIME_SERVE}").group("addresses"),
  PUBLIC_VIVA_LIGHTHOUSE_REMOTE: v.url().desc("Lighthouse address as CONSUMED — by the daemons, and by the browser after publish().").default("${VIVA_LIGHTHOUSE_SERVE}").group("addresses"),
  SECRET_VIVA_JWT: v.string({ minLength: 24 }).desc("Lighthouse signing secret. Minted at first init; rotate with: openssl rand -base64 24").default(() => btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(24))))).group("keys"),
  SECRET_VIVA_ANTHROPIC_API_KEY: v.string().desc("Anthropic key. Declare either provider, both, or neither — a key left blank leaves its hallucinator dormant.").group("keys").optional(),
  SECRET_VIVA_OPENROUTER_API_KEY: v.string().desc("OpenRouter key. The alternative provider. With neither key the daemon attaches no hallucinator and /hello/agent answers as the bot.").group("keys").optional(),
});
