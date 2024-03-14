import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  // setup alases
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"), // "@": "/src",
      $util: path.resolve(__dirname, "./src/utility"), // "$util": "/src/util",
      $types: path.resolve(__dirname, "./src/types"),
      $components: path.resolve(__dirname, "./src/components"),
    },
  },
  plugins: [react()],
});
