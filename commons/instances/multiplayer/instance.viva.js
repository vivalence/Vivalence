import paladin from "@vivalence/paladin";
import { v } from "@vivalence/typology";

export const manifest = { type: "instance", slug: "multiplayer", version: "0.0.1" };

export const environment = v.environment({
  VIVA_RUNTIME_ORIGIN: v.url().desc("Where this runtime process BINDS: scheme, host, port. Nothing else. Example: http://0.0.0.0:2502").default("http://localhost:2502").group("addresses"),
  PUBLIC_VIVA_LIGHTHOUSE_REMOTE: v.url().desc("Where a consumer REACHES the hosted lighthouse — this instance's own ghost verbs, a peer runtime, a browser. A literal, never derived. Example: https://lighthouse.vivalence.com/attached/process/lighthouse/multiplayer").default("http://localhost:2502/attached/process/lighthouse/multiplayer").group("addresses"),
  VIVA_LIGHTHOUSE_MOUNT: v.string().desc("Where the hosted lighthouse persists: db, migrations, tokens. Absolute. Example: /viva/lighthouse").group("mounts"),
  SECRET_VIVA_JWT: v.string({ minLength: 24 }).desc("Lighthouse signing secret. Every consumer runtime verifies against it. Generate with: openssl rand -base64 24").group("keys"),
});

export const runtime = {
  manifest: { slug: "runtime" },
  statics: { serve: () => paladin.env.get("VIVA_RUNTIME_ORIGIN") },
};

export const lighthouse = {
  module: "@commons/lighthouse/multiplayer",
  statics: { remote: () => paladin.env.get("PUBLIC_VIVA_LIGHTHOUSE_REMOTE") },
};

export const hallucinators = [];

export const clients = [{ manifest: { type: "client", slug: "ghost" } }];

export const daemons = [];

export const services = [
  {
    manifest: { type: "service", slug: "multiplayer" },
    module: "@commons/lighthouse/multiplayer",
    mountpoint: () => paladin.env.get("VIVA_LIGHTHOUSE_MOUNT"),
    datamap: { module: "@commons/datamap/libsql" },
    secrets: { jwt: () => paladin.secret.get("SECRET_VIVA_JWT") },
  },
];
