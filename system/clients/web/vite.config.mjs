import { defineConfig } from "vite";
import { sveltekit } from "@sveltejs/kit/vite";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const __packages = join(__dirname, "../../../subsystems");

export default defineConfig({
  resolve: {
    alias: {
      "@client/lib/": join(__dirname, "./src/lib/"),
      "@client/authority": join(__dirname, "./src/authority.js"),
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
        "../../../register/@vivalence/game/**/*.{html,svelte.js,svelte,css}",
        "../../../register/@vivalence/strategy/**/*.{html,svelte.js,svelte,css}",
        "../../../register/@vivalence/agent/**/*.{html,svelte.js,svelte,css}",
        "../../../subsystems/interfaces/web/**/*",
        "../../../subsystems/shared/**/*",
      ],
    },
  },
});
