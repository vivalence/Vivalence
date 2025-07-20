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
      "@client/app": join(__dirname, "./src/app.js"),
      "@client/components/": join(__dirname, "./src/components/"),
      "@client/icons/": join(__dirname, "./static/icons/"),
      "@client/shadcn/": join(__dirname, "./src/components/shadcn/"),

      //  # DEPRACATED
      "@client/context": join(__dirname, "./src/context.js"),
      //  # IDEAS
      //  # "@client/identity": join(__dirname, "./src/app.js"),
      //  # "@client/entities": join(__dirname, "./src/lib/entities/index.js"),

      "@vivalence/interface": join(__packages, "./interfaces/web/mod.js"),
      "@vivalence/shared": join(__packages, "./shared/client.js"),
      "@vivalence/trajectory": join(
        __packages,
        "./shared/src/trajectory/index.ts",
      ),
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
        "../../../registry/modules/games/**/*.{html,svelte.js,svelte,css}",
        "../../../registry/modules/strategies/**/*.{html,svelte.js,svelte,css}",
        "../../../packages/interfaces/web/**/*",
        "../../../packages/shared/**/*",
      ],
    },
  },
});
