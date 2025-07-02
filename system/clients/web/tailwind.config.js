import typography from "@tailwindcss/typography";
import theme from "./src/style/tailwind-classes.js";

const config = {
  purge: false,
  theme: theme,
  plugins: [typography],
  content: [
    "./src/**/*.{html,svelte,css}",
    "../../../packages/interfaces/web/**/*.{html,svelte,css}",
    "../../../modules/games/**/*.{html,svelte,css}",
    // "./themes/**/*",
  ],
  // safelist: [{pattern: /.*/, deep: false, variants: ["md"],},],
};

export default config;
