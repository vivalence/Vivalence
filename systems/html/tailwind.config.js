import typography from "@tailwindcss/typography";
import theme from "./src/design/tailwind-classes.js";

const config = {
  purge: false,
  theme: theme,
  plugins: [typography],
  content: [
    "./src/**/*.{html,svelte,css}",
    "../../../subsystems/surfaces/drapes/**/*.{html,svelte,css}",
    "../../../subsystems/typology/views/**/*.{html,svelte,css}", // aspirational
    "../../../registry/**/*.{html,svelte,css}",
  ],
  // safelist: [{pattern: /.*/, deep: false, variants: ["md"],},],
};

export default config;
