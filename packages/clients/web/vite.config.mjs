import { defineConfig } from "vite";
import { sveltekit } from "@sveltejs/kit/vite";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
export default defineConfig({
  resolve: {
    alias: {
      "@client/lib/": join(__dirname, "./src/lib/"),
      "@client/components/": join(__dirname, "./src/components/"),
      "@client/shadcn/": join(__dirname, "./src/components/shadcn/"),
      "@client/icons/": join(__dirname, "./static/icons/"),
      "@client/context": join(__dirname, "./src/context.js"),

      "@vivalence/interface": join(
        __dirname,
        "../../interfaces/display/mod.js",
      ),
      "@vivalence/shared": join(__dirname, "../../shared/client.js"),
      "@vivalence/schema": join(__dirname, "../../schema/mod.ts"),
      "@vivalence/trajectory": join(
        __dirname,
        "../../shared/src/trajectory/index.ts",
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
        "../../../modules/domain/**/games/**/*.{html,svelte.js,svelte,css}",
        "../../interfaces/display/**/*",
        "../../shared/**/*",
      ],
    },
  },
});
