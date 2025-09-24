import { defineConfig } from "vite";
import { sveltekit } from "@sveltejs/kit/vite";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const __repo = join(__dirname, "../../../");
const __ss = join(__repo, "./subsystems");

// TODO:
// i need access to $viva_config_dir/assets
// present as @client/assets

export default defineConfig({
  resolve: {
    alias: {
      "@client/app": join(__dirname, "./src/app.js"),
      "@client/generator": join(__dirname, "./src/generator/index.js"),

      "@client/typology": join(__dirname, "./src/typology/index.js"),
      "@client/typology/": join(__dirname, "./src/typology/"),

      "@client/surface/views": join(__dirname, "./src/surface/views/index.js"),
      "@client/surface": join(__dirname, "./src/surface/index.js"),

      // # "@client/shadcn/": join(__dirname, "./src/components/shadcn/"),
      "@static/icons/": join(__dirname, "./static/icons/"),

      "@vivalence/surface": join(__repo, "./surfaces/html/mod.js"),

      "@vivalence/shared": join(__ss, "./shared/client.js"),
      "@vivalence/typology": join(__ss, "./typology/client.js"),
      "@vivalence/vector": join(__ss, "./vector/mod.js"),

      // # "@assets/": env.get("VIVA_ASSETS_DIR") || join(env.get("VIVA_CONFIG_DIR"), "./assets/"),
    },
    extensions: [".ts", ".js", ".jsx", ".json", ".svelte", ".svg", ".mjs"],
  },
  plugins: [sveltekit()],
  server: {
    strictPort: true,
    host: process.env["VIVA_CLIENTS_HTML_HOST"] || "localhost",
    port: parseInt(process.env["VIVA_CLIENTS_HTML_PORT"]) || 5173,

    fs: { allow: ["../../.."] },
    watch: {
      usePolling: true,

      ignored: ["**/node_modules/**", "**/#*"],
      include: [
        "./src/**/*",
        // # TODO VIVA_REGISTER_DIR
        "../../../register/**/*.{html,svelte.js,svelte,css}",
        "../../../interfaces/html/**/*",
        "../../../subsystems/shared/**/*",
      ],
    },
  },
});
