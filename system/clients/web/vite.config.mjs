import { defineConfig } from "vite";
import { sveltekit } from "@sveltejs/kit/vite";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const __packages = join(__dirname, "../../../packages");

export default defineConfig({
  resolve: {
    alias: {
      "@client/lib/": join(__dirname, "./src/lib/"),
      "@client/auth": join(__dirname, "./src/auth.js"),
      "@client/user": join(__dirname, "./src/user.js"),
      "@client/generator": join(__dirname, "./src/generator.js"),

      "@client/components/": join(__dirname, "./src/components/"),
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
    fs: { allow: ["../../.."] },
    watch: {
      usePolling: true,
      ignored: ["**/node_modules/**", "**/#*"],
      include: [
        "./src/**/*",
        "../../../registry/@vivalence/games/**/*.{html,svelte.js,svelte,css}",
        "../../../registry/@vivalence/strategies/**/*.{html,svelte.js,svelte,css}",
        "../../../packages/interfaces/web/**/*",
        "../../../packages/shared/**/*",
      ],
    },
  },
});
