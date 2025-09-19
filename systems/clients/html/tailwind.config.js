import typography from "@tailwindcss/typography";
import theme from "./src/design/tailwind-classes.js";

const config = {
  purge: false,
  theme: theme,
  plugins: [typography],
  content: [
    "./src/**/*.{html,svelte,css}",
    "../../../interfaces/html/**/*.{html,svelte,css}",
    "../../../register/**/*.{html,svelte,css}",
  ],
  // safelist: [{pattern: /.*/, deep: false, variants: ["md"],},],
};

export default config;
