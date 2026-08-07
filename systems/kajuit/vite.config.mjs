import deno from "@deno/vite-plugin";
import { Url, Status } from "@vivalence/typology";
import { defineConfig } from "vite";
import { sveltekit } from "@sveltejs/kit/vite";
import { dirname, join } from "@std/path";
import { fileURLToPath } from "node:url";
const __dirname = dirname(fileURLToPath(import.meta.url));
const __repo = join(__dirname, "../../");
const __ss = join(__repo, "./subsystems");

async function serverConfig() {
  const paladin = (await import("@vivalence/paladin")).default;
  await paladin.variant.mount();
  const client = paladin.variant.clients.kajuit;
  // console.log("paladin.env", paladin.env);
  // const client = {slug: "kajuit", module: "@vivalence/kajuit", statics: {serve: new Url("http://0.0.0.0:1794"), lighthouse: {remote: new Url("http://100.71.241.160:2501/attached/process/lighthouse/multiplayer"),},},};
  // console.log({ client });

  // let allowedHosts = paladin.is.dev;
  // if (client.statics.remote) allowedHosts = [client.statics.remote.hostname];
  // if (paladin.env.has("VIVA_CLIENT_KAJUIT_ALLOWEDHOSTS")) allowedHosts = [paladin.env.get("VIVA_CLIENT_KAJUIT_ALLOWEDHOSTS")];

  return {
    cors: { origin: client.statics.remote?.absolute },
    origin: client.statics.remote?.absolute,
    // allowedHosts,

    host: client.statics.serve.hostname,
    port: parseInt(client.statics.serve.port),

    strictPort: true,
    fs: { allow: ["./", "../..", "../../node_modules"] },
    watch: {
      usePolling: false,
      ignored: ["**/node_modules/**", "**/#*", "**/bak/**"],
      include: [
        "./src/**/*",
        "../../registry/**/*.{html,svelte,js,css}",
        "../../subsystems/typology/**/*",
        "../../subsystems/dapper/**/*",
        "../../subsystems/drapes/**/*",
      ],
    },
  };
}

function beacon() {
  return {
    name: "viva-status-beacon",
    configureServer(server) {
      server.httpServer?.once("listening", () => console.log(new Status("alive")));
    },
  };
}

export default defineConfig(async ({ command }) => ({
  plugins: [sveltekit(), deno(), beacon()],
  logLevel: "info",
  build: {
    target: "es2022",
  },
  server: command === "serve" ? await serverConfig() : {},
  preview: command === "serve" ? await serverConfig() : {},
  ssr: {
    noExternal: true,
  },
  resolve: {
    alias: {
      // STABLE
      $telemetry: join(__dirname, "./src/telemetry.js"),
      $client: join(__dirname, "./src/client.js"),
      "@vivalence/kajuit": join(__dirname, "./src/typology/mod.js"),

      "@vivalence/typology": join(__ss, "./typology/mod.client.js"),
      "@vivalence/typology/schematics": join(__ss, "./typology/schematics/index.js"),

      "@vivalence/dapper/font.css": join(__repo, "./subsystems/dapper/primitives/font.css"),
      "@vivalence/dapper/bsp.css": join(__repo, "./subsystems/dapper/primitives/bsp.css"),

      "@vivalence/dapper": join(__repo, "./subsystems/dapper/mod.js"), // ? needed ?
      "@vivalence/drapes": join(__repo, "./subsystems/drapes/mod.js"), // ? needed ?

      // TBD
      // # "@client/shadcn/": join(__dirname, "./src/components/shadcn/"),
      // # "@assets/": env.get("VIVA_ASSETS_DIR") || join(env.get("VIVA_CONFIG_DIR"), "./assets/"), // i want to access to $viva_config_dir/assets present as @client/assets
      // "@static/icons/": join(__dirname, "./static/icons/"),
      // "$static/images/": join(__dirname, "./static/images/"),
    },
    extensions: [".ts", ".js", ".jsx", ".json", ".svelte", ".svg", ".mjs"],
  },
}));
