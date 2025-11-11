import paladin from "@vivalence/paladin";
import { Path } from "@vivalence/typology";

import { defineConfig } from "vite";
import { sveltekit } from "@sveltejs/kit/vite";
import { dirname, join } from "@std/path";
import { fileURLToPath } from "node:url";

await paladin.ikiro; // temporary magic

const __dirname = dirname(fileURLToPath(import.meta.url));
const __repo = join(__dirname, "../../");
const __ss = join(__repo, "./subsystems");
const scope = paladin.scope.system;
const client = paladin.variant.clients.html;

export default defineConfig({
  resolve: {
    alias: {
      "$hut/typology": join(__dirname, "./src/typology/index.js"),
      "$hut/surface": join(__dirname, "./src/surface/index.js"),
      "$hut/view": join(__dirname, "./src/surface/view/index.js"),
      $hut: join(__dirname, "./src/app.js"),
      // "$client/generator": join(__dirname, "./src/generator/index.js"),
      // "$client/typology/": join(__dirname, "./src/typology/"),

      "@vivalence/shared": join(__ss, "./shared/mod.client.js"),
      "@vivalence/typology": join(__ss, "./typology/mod.client.js"),
      // "@vivalence/typology": join(__ss, "./typology/mod.client.js"),

      "@vivalence/vector/typology": join(__ss, "./vector/typology.js"), // ? needed ?
      "@vivalence/vector": join(__ss, "./vector/mod.js"), // ? needed ?

      "@vivalence/dapper": join(__repo, "./subsystems/surfaces/dapper/mod.js"), // ? needed ?
      "@vivalence/drapes": join(__repo, "./subsystems/surfaces/drapes/mod.js"), // ? needed ?

      // # "@client/shadcn/": join(__dirname, "./src/components/shadcn/"),
      "@static/icons/": join(__dirname, "./static/icons/"),

      // # "@assets/": env.get("VIVA_ASSETS_DIR") || join(env.get("VIVA_CONFIG_DIR"), "./assets/"), // i want to access to $viva_config_dir/assets present as @client/assets

      "@vivalence/surface": join(__repo, "./subsystems/surfaces/drapes/mod.js"),
    },
    extensions: [".ts", ".js", ".jsx", ".json", ".svelte", ".svg", ".mjs"],
  },
  plugins: [sveltekit()],
  server: {
    strictPort: true,
    host: client.statics.serve.hostname,
    port: parseInt(client.statics.serve.port),
    fs: { allow: ["../.."] },
    watch: {
      usePolling: true,

      ignored: ["**/node_modules/**", "**/#*"],
      include: [
        "./src/**/*",
        // # TODO VIVA_REGISTER_DIR
        "../../register/**/*.{html,svelte.js,svelte,css}",
        "../../subsystems/shared/**/*",
        "../../subsystems/typology/**/*",
        "../../subsystems/surfaces/**/*",
        // "../../../subsystems/typology/**/*",
        // "../../../subsystems/vector/**/*",
      ],
    },
  },
});
