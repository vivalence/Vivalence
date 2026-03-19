import deno from "@deno/vite-plugin";
import { defineConfig } from "vite";
import { sveltekit } from "@sveltejs/kit/vite";
import { dirname, join } from "@std/path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const __repo = join(__dirname, "../../");
const __ss = join(__repo, "./subsystems");

async function serverConfig() {
  const paladin = (await import("@vivalence/paladin")).default;
  await paladin.ikiro;
  const client = paladin.variant.clients.html;

  // let allowedHosts = paladin.is.dev;
  // if (client.statics.remote) allowedHosts = [client.statics.remote.hostname];
  // if (paladin.env.has("VIVA_CLIENT_HTML_ALLOWEDHOSTS")) allowedHosts = [paladin.env.get("VIVA_CLIENT_HTML_ALLOWEDHOSTS")];

  return {
    cors: { origin: client.statics.remote?.absolute },
    origin: client.statics.remote?.absolute,
    // allowedHosts,

    host: client.statics.serve.hostname,
    port: parseInt(client.statics.serve.port),

    strictPort: true,
    fs: { allow: ["./", "../..", "../../node_modules"] },
    watch: {
      usePolling: true,
      ignored: ["**/node_modules/**", "**/#*"],
      include: [
        "./src/**/*",
        "../../register/**/*.{html,svelte.js,svelte,css}",
        "../../subsystems/typology/**/*",
        "../../subsystems/shared/**/*",
        "../../subsystems/dapper/**/*",
        "../../subsystems/drapes/**/*",
      ],
    },
  };
}

export default defineConfig(async ({ command }) => ({
  plugins: [sveltekit(), deno()],
  logLevel: "info",
  server: command === "serve" ? await serverConfig() : {},
  preview: command === "serve" ? await serverConfig() : {},
  ssr: {
    noExternal: true,
  },
  resolve: {
    alias: {
      // legacy
      "$client/typology": join(__dirname, "./src/typology/index.js"),
      "$client/surface": join(__dirname, "./src/surface/index.js"),
      "$client/view": join(__dirname, "./src/surface/view/index.js"),
      "$hut/typology": join(__dirname, "./src/typology/index.js"),
      "$hut/surface": join(__dirname, "./src/surface/index.js"),
      "$hut/view": join(__dirname, "./src/surface/view/index.js"),
      "@vivalence/surface": join(__repo, "./subsystems/drapes/mod.js"),
      $hut: join(__dirname, "./src/app.js"),

      // STABLE
      $client: join(__dirname, "./src/client.js"),

      "@vivalence/html/typology": join(__dirname, "./src/typology/index.js"),
      "@vivalence/html/surface": join(__dirname, "./src/surface/index.js"),

      "@vivalence/shared": join(__ss, "./shared/mod.client.js"),
      "@vivalence/typology": join(__ss, "./typology/mod.client.js"),

      "@vivalence/dapper/font.css": join(__repo, "./subsystems/dapper/primitives/font.css"),
      "@vivalence/dapper/bsp.css": join(__repo, "./subsystems/dapper/primitives/bsp.css"),
      "@vivalence/dapper": join(__repo, "./subsystems/dapper/mod.js"), // ? needed ?
      "@vivalence/drapes": join(__repo, "./subsystems/drapes/mod.js"), // ? needed ?

      // TBD
      // # "@client/shadcn/": join(__dirname, "./src/components/shadcn/"),
      // # "@assets/": env.get("VIVA_ASSETS_DIR") || join(env.get("VIVA_CONFIG_DIR"), "./assets/"), // i want to access to $viva_config_dir/assets present as @client/assets
      "@static/icons/": join(__dirname, "./static/icons/"),
      "$static/images/": join(__dirname, "./static/images/"),
    },
    extensions: [".ts", ".js", ".jsx", ".json", ".svelte", ".svg", ".mjs"],
  },
}));
