import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
    plugins: [sveltekit()],
    logLevel: "info",
    mode: "development",
    server: {
        watch: {
            ignored: ["**/.#*"] // Ignores files starting with .# in any directory
        }
    }
});
