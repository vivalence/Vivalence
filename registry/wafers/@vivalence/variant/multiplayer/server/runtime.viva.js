import paladin from "@vivalence/paladin";
import { Env, Url } from "@vivalence/typology";

export const manifest = {
  type: "circuit",
  slug: "runtime",
  traits: ["EMBEDDED"], // everything on this circuit will be auto-started (daemonized)
};

// export const runtime = {slug: "runtime", traits: ["EMBEDDED"], statics: {serve: () => new Url(paladin.env.get("VIVA_RUNTIME_SERVE")),}, datamap: {module: "@vivalence/datamap/libsql", statics: {db: { file: `runtime.viva.db` },},},};

export const runtime = {
  slug: "runtime",
  traits: ["EMBEDDED"],
  statics: {
    serve: () => new Url(paladin.env.get("VIVA_RUNTIME_SERVE")),
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
    slug: "multiplayer",
    module: "@vivalence/lighthouse/multiplayer",
    secrets: { jwt: () => paladin.secret.get("SECRET_VIVA_JWT") },
    statics: { serve: () => new Url(paladin.env.get("VIVA_LIGHTHOUSE_SERVE")) },
    datamap: {
      module: "@vivalence/datamap/libsql",
      statics: { db: { file: `lighthouse.viva.db` } },
    },
  },
];
