import paladin from "@vivalence/paladin";
import { Env, Url } from "@vivalence/typology";

export const manifest = {
  type: "circuit",
  slug: "dev",
  traits: ["EMBEDDED"], // everything on this circuit will be auto-started (daemonized)
};

export const runtime = {
  // role "RUNTIME"
  slug: "liz",
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

export const clients = {
  // run with role = "client":
  shell: {
    slug: "shell",
    module: "@vivalence/shell", // implicit
    // env: new Env({}),
    statics: {
      lighthouse: {
        remote: new Url(paladin.env.get("PUBLIC_VIVA_LIGHTHOUSE_REMOTE")),
      },
    },
  },
  html: {
    slug: "html",
    module: "@vivalence/html", // implicit
    statics: {
      serve: new Url(paladin.env.get("VIVA_CLIENT_HTML_SERVE")),
      lighthouse: {
        remote: new Url(paladin.env.get("PUBLIC_VIVA_LIGHTHOUSE_REMOTE")),
      },
    }, // ... more space for design & functional config. client modules. xxx
  },
};

export const services = [
  // role = "process"
  {
    slug: "multiplayer",
    module: "@vivalence/lighthouse/multiplayer",
    secrets: { jwt: paladin.secret.get("JWT_SECRET") },
    statics: { serve: new Url(paladin.env.get("VIVA_LIGHTHOUSE_SERVE")) },
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
    // optional
    // datamap: {module: "@vivalence/datamap/libsql", statics: {db: { file: `lighthouse.viva.db` },},},
  },
];

// this export is optional on all circuits: ie type implies gestalt.
// export const scopes: Map<string:[Path|Url|T<Signature>]> // lookup pointers.
// ... as the control vector.

// optional future music
// export const control = new Vector()
//   .use(async (ctx, next) => {
//     (async () => await runtime.ikiro)();
//     await next();
//   })
//   .open(`/ikiro`, async (ctx) => {
//     // const runtime = await import( "@vivalence/runtime");
//     // const process = (async () => await runtime.ikiro)();
//     // map processes and clients * up
//   });
