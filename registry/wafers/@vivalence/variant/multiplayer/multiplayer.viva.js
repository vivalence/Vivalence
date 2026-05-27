import paladin from "@vivalence/paladin";
import { Env, Url } from "@vivalence/typology";

export * as circuitry from "./circuitry.js";

export const manifest = {
  type: "variant",
  slug: "multiplayer",
  // traits: ["EMBEDDED"], // everything on this circuit will be auto-started (daemonized)
};

// export const runtime = {slug: "runtime", traits: ["EMBEDDED"], statics: {serve: () => new Url(paladin.env.get("VIVA_RUNTIME_SERVE")),}, datamap: {module: "@vivalence/datamap/libsql", statics: {db: { file: `runtime.viva.db` },},},};

export const clients = {
  kajuit: {
    slug: "kajuit",
    // module: "@vivalence/kajuit",
    statics: {
      serve: () => new Url(paladin.env.get("VIVA_CLIENT_KAJUIT_SERVE")),
      lighthouse: {
        remote: () => new Url(paladin.env.get("PUBLIC_VIVA_LIGHTHOUSE_REMOTE")),
      },
    },
  },
};

export const runtime = {
  slug: "runtime",
  // traits: ["EMBEDDED"],
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
    // traits: ["ATTACHED"],
    module: "@vivalence/lighthouse/multiplayer",
    secrets: { jwt: () => paladin.secret.get("SECRET_VIVA_JWT") },
    statics: { serve: () => new Url(paladin.env.get("VIVA_LIGHTHOUSE_SERVE")) },
    datamap: {
      module: "@vivalence/datamap/libsql",
      statics: { db: { file: `lighthouse.viva.db` } },
    },
  },
];
