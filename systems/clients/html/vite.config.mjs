import { defineConfig } from "vite";
import { sveltekit } from "@sveltejs/kit/vite";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const __packages = join(__dirname, "../../../subsystems");

export default defineConfig({
  resolve: {
    alias: {
      "@client/app": join(__dirname, "./src/client.svelte.js"),

      "@client/lib/": join(__dirname, "./src/lib/"),
      "@client/components/": join(__dirname, "./src/components/"),
      "@client/views/": join(__dirname, "./src/components/views/"),
      "@client/shadcn/": join(__dirname, "./src/components/shadcn/"),
      "@client/icons/": join(__dirname, "./static/icons/"),

      "@vivalence/shared": join(__packages, "./shared/client.js"),
      "@vivalence/typology": join(__packages, "./typology/client.js"),
      "@vivalence/interface": join(__packages, "./interfaces/web/mod.js"),
      "@vivalence/vector": join(__packages, "./vector/mod.js"),
    },
    extensions: [".ts", ".js", ".jsx", ".json", ".svelte", ".svg", ".mjs"],
  },
  plugins: [sveltekit()],
  server: {
    strictPort: true,
    host: process.env["VIVA_CLIENTS_WEB_HOST"] || "localhost",
    port: parseInt(process.env["VIVA_CLIENTS_WEB_PORT"]) || 5173,

    fs: { allow: ["../../.."] },
    watch: {
      usePolling: true,

      ignored: ["**/node_modules/**", "**/#*"],
      include: [
        "./src/**/*",
        "../../../register/**/*.{html,svelte.js,svelte,css}",
        "../../../subsystems/interfaces/web/**/*",
        "../../../subsystems/shared/**/*",
      ],
    },
  },
});
