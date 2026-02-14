import typography from "@tailwindcss/typography";
import { tailwindClasses } from "@vivalence/dapper";

const config = {
  purge: false,
  theme: tailwindClasses,
  plugins: [typography],
  content: [
    "./src/**/*.{html,svelte,css}",
    "../../subsystems/dapper/**/*.{js,html,svelte,css}",
    "../../subsystems/drapes/**/*.{js,html,svelte,css}",
    "../../subsystems/typology/views/**/*.{html,svelte,css}", // aspirational
    "../../registry/**/*.{html,svelte,css}",
  ],
  // safelist: [{pattern: /.*/, deep: false, variants: ["md"],},],
};

export default config;
