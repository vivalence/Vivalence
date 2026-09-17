import typography from "@tailwindcss/typography";
import { tailwindClasses, safelist } from "@vivalence/dapper";

const config = {
  purge: false,
  theme: tailwindClasses,
  plugins: [typography],
  content: [
    "./src/**/*.{html,svelte,css}",
    "../../subsystems/dapper/**/*.{js,html,svelte,css}",
    "../../subsystems/drapes/**/*.{js,html,svelte,css}",
    "../../subsystems/typology/views/**/*.{html,svelte,css}", // aspirational
    "../../commons/**/*.{html,svelte,css}",
  ],
  // dapper's full skeleton class enumeration — components build class names
  // dynamically with template strings, so JIT can't see them statically.
  safelist,
};

export default config;
