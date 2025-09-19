import { defineConfig } from "vite";
import { sveltekit } from "@sveltejs/kit/vite";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const __packages = join(__dirname, "../../../subsystems");

// # const repodir, registerdir, configdir,

export default defineConfig({
  resolve: {
    alias: {
      // # "@assets/": env.get("VIVA_ASSETS_DIR") || join(env.get("VIVA_CONFIG_DIR"), "./assets/"),

      "@client/app": join(__dirname, "./src/app.js"),
      "@client/interface": join(__dirname, "./src/interface/index.js"),
      "@client/views": join(__dirname, "./src/views/index.js"),

      "@client/typology/": join(__dirname, "./src/typology/"),
      "@client/interface/": join(__dirname, "./src/interface/"),
      // # "@client/shadcn/": join(__dirname, "./src/components/shadcn/"),
      "@static/icons/": join(__dirname, "./static/icons/"),

      // # "@interface/": join(__dirname, "../../../interfaces/html/mod.js"),
      "@vivalence/interface": join(
        __dirname,
        "../../../interfaces/html/mod.js",
      ),

      "@vivalence/shared": join(__packages, "./shared/client.js"),
      "@vivalence/typology": join(__packages, "./typology/client.js"),
      "@vivalence/vector": join(__packages, "./vector/mod.js"),
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
