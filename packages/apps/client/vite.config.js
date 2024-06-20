import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
    plugins: [sveltekit()],
    mode: "development",
    logLevel: "info",
    server: {
        watch: {
            ignored: ["**/.#*"]
        }
    }
});
