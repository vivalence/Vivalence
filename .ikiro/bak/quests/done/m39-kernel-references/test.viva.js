import paladin from "@vivalence/paladin";
import { App, Url, svelte, v } from "@vivalence/typology";

export const manifest = { type: "variant", slug: "test", version: "0.0.1" };

const hello = {
  manifest: {
    type: "game",
    slug: "hello",
    name: "Hello",
    version: "0.0.1",
    traits: ["APPLICATION", "STANDALONE"],
  },
  app: new App(
    svelte`
      <script>
        const { buffer } = $props();
      </script>

      <h1>hello {buffer.data.name}</h1>
    `,
    v.buffer({ data: { name: v.string().default("inline") } }),
  ),
};

export const runtime = {
  slug: "runtime",
  statics: { serve: () => new Url(paladin.env.get("VIVA_RUNTIME_SERVE")) },
  datamap: {
    module: "@viva/datamap/libsql",
    statics: { db: { file: `runtime.viva.db` } },
  },
};

export const lighthouse = {
  statics: { remote: () => new Url(paladin.env.get("PUBLIC_VIVA_LIGHTHOUSE_REMOTE")) },
};

export const daemons = [
  {
    manifest: { type: "daemon", slug: "playground", version: "0.0.1" },
    docs: { name: "Playground", valence: "testbed", icon: { emoji: "T" } },
    statics: {},
    kernel: [
      "@playground/playground/spawner",
      "@playground/playground/spawned",
      "./greeter/greeter.viva.js",
      hello,
    ],
    lighthouse: {
      module: "@viva/lighthouse/multiplayer",
      statics: { remote: () => new Url(paladin.env.get("PUBLIC_VIVA_LIGHTHOUSE_REMOTE")) },
    },
    datamap: {
      module: "@viva/datamap/libsql",
      statics: { db: { file: `playground.viva.db` } },
    },
    hallucinators: [],
    consume: {},
  },
];

export const services = [
  {
    slug: "multiplayer",
    module: "@viva/lighthouse/multiplayer",
    secrets: { jwt: () => paladin.secret.get("SECRET_VIVA_JWT") },
    statics: { serve: () => new Url(paladin.env.get("VIVA_LIGHTHOUSE_SERVE")) },
    datamap: {
      module: "@viva/datamap/libsql",
      statics: { db: { file: `lighthouse.viva.db` } },
    },
  },
];
