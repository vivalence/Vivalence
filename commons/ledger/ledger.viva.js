import paladin from "@vivalence/paladin";
import { v } from "@vivalence/typology";

// the ledger's word. every instance on this ledger inherits a slot it does not declare itself —
// runtime · lighthouse · datamap · hallucinators · clients · services — and its environment keys.
// an instance that declares a slot has said everything about it; a declared [] is "none".
// no manifest: the file at the ledger root IS the ledger — type and slug derive from its place.
// export const manifest = { slug: "…" } only to lock a name.

export const runtime = {
  manifest: { slug: "runtime" },
  statics: {
    serve: () => paladin.env.get("VIVA_RUNTIME_SERVE"),
    remote: () => paladin.env.get("PUBLIC_VIVA_RUNTIME_REMOTE"),
  },
};

export const lighthouse = {
  module: "@commons/lighthouse/multiplayer",
  statics: { remote: () => paladin.env.get("PUBLIC_VIVA_LIGHTHOUSE_REMOTE") },
};

export const datamap = { module: "@commons/datamap/libsql" };

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

export const clients = [
  {
    manifest: { type: "client", slug: "anima" },
    statics: { serve: () => paladin.env.get("VIVA_CLIENT_ANIMA_SERVE") },
  },
];

export const services = [
  {
    manifest: { type: "lighthouse", slug: "multiplayer" },
    module: "@commons/lighthouse/multiplayer",
    secrets: { jwt: () => paladin.secret.get("SECRET_VIVA_JWT") },
  },
];

// the ledger's own .env schema — what ledger/init scaffolds — plus what the slots above read.
// an instance's environment merges over this by key; its key wins.
export const environment = v.environment({
  VIVA_REPOSITORY_MOUNT: v.string().desc("Absolute path to the vivalence checkout. Repo-relative resolution needs it.").group("homes"),
  VIVA_RUNTIME_ORIGIN: v.url().desc("Scheme and authority the runtime is reachable at. Every address below derives from it.").default("http://localhost:2501").group("addresses"),
  VIVA_CLIENT_ANIMA_ORIGIN: v.url().desc("Scheme and authority the anima browser client is reachable at.").default("http://localhost:1794").group("addresses"),
  VIVA_RUNTIME_SERVE: v.url().desc("Base URL the runtime serves on. Everything else hangs off this latch.").default("${VIVA_RUNTIME_ORIGIN}/").group("addresses"),
  VIVA_CLIENT_ANIMA_SERVE: v.url().desc("Where the anima browser client serves.").default("${VIVA_CLIENT_ANIMA_ORIGIN}/").group("addresses"),
  PUBLIC_VIVA_RUNTIME_REMOTE: v.url().desc("Runtime address the browser bundle calls. Reaches it through publish(), not a thunk.").default("${VIVA_RUNTIME_SERVE}").group("addresses"),
  PUBLIC_VIVA_LIGHTHOUSE_REMOTE: v.url().desc("Lighthouse address as CONSUMED. Set it for a lighthouse on another host; unset, paladin computes this runtime's reach + the hosting service's seat.").group("addresses").optional(),
  SECRET_VIVA_JWT: v.string({ minLength: 24 }).desc("Lighthouse signing secret. Minted at first init; rotate with: openssl rand -base64 24").default(() => btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(24))))).group("keys"),
  SECRET_VIVA_ANTHROPIC_API_KEY: v.string().desc("Machine-wide Anthropic key. A key left blank leaves its hallucinator dormant.").group("keys").optional(),
  SECRET_VIVA_OPENROUTER_API_KEY: v.string().desc("Machine-wide OpenRouter key.").group("keys").optional(),
  SECRET_VIVA_ELEVENLABS_API_KEY: v.string().desc("Machine-wide ElevenLabs key.").group("keys").optional(),
  SECRET_VIVA_DEEPGRAM_API_KEY: v.string().desc("Machine-wide Deepgram key.").group("keys").optional(),
});
