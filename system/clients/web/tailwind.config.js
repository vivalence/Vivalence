import typography from "@tailwindcss/typography";
import theme from "./src/style/tailwind-classes.js";

const config = {
  purge: false,
  theme: theme,
  plugins: [typography],
  content: [
    "./src/**/*.{html,svelte,css}",
    "../../../packages/interfaces/web/**/*.{html,svelte,css}",
    "../../../registry/@vivalence/strategy/**/*.{html,svelte,css}",
    "../../../registry/@vivalence/game/**/*.{html,svelte,css}",
  ],
  // safelist: [{pattern: /.*/, deep: false, variants: ["md"],},],
};

export default config;
