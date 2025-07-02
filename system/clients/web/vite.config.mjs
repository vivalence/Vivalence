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
      "@client/components/": join(__dirname, "./src/components/"),
      "@client/shadcn/": join(__dirname, "./src/components/shadcn/"),
      "@client/icons/": join(__dirname, "./static/icons/"),
      "@client/context": join(__dirname, "./src/context.js"),

      "@vivalence/interface": join(__packages, "./interfaces/web/mod.js"),
      "@vivalence/shared": join(__packages, "./shared/client.js"),
      "@vivalence/trajectory": join(
        __packages,
        "./shared/src/trajectory/index.ts",
      ),
      // "@vivalence/schema": join(__packages, "./schema/mod.ts"),
    },
    extensions: [".ts", ".js", ".jsx", ".json", ".svelte", ".svg", ".mjs"],
  },
  plugins: [sveltekit()],
  server: {
    fs: { allow: ["../../.."] },
    watch: {
      usePolling: true,
      ignored: ["**/node_modules/**", "**/#*/**", "**/#*"],
      include: [
        "./src/**/*",
        "../../../modules/games/**/*.{html,svelte.js,svelte,css}",
        "../../../modules/strategies/**/*.{html,svelte.js,svelte,css}",
        "../../../packages/interfaces/display/**/*",
        "../../../packages/shared/**/*",
      ],
    },
  },
});
