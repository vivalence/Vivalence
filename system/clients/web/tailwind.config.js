import typography from "@tailwindcss/typography";
import theme from "./src/style/tailwind-classes.js";

const config = {
  purge: false,
  theme: theme,
  plugins: [typography],
  content: [
    "./src/**/*.{html,svelte,css}",
    "../../../subsystems/interfaces/web/**/*.{html,svelte,css}",
    "../../../register/@vivalence/strategy/**/*.{html,svelte,css}",
    "../../../register/@vivalence/agent/**/*.{html,svelte,css}",
    "../../../register/@vivalence/game/**/*.{html,svelte,css}",
  ],
  // safelist: [{pattern: /.*/, deep: false, variants: ["md"],},],
};

export default config;
