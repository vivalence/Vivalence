import typography from "@tailwindcss/typography";
import theme from "./themes/tailwind.map.js";
// import theme from "./themes/dark.js";

const config = {
  purge: false,
  theme: {
    colors: theme.colors,
    fontSize: theme.font.size,
    fontFamily: theme.font.family,
    boxShadow: theme.boxShadow,
    dropShadow: theme.dropShadow,
    container: theme.container,
    borderRadius: theme.borderRadius,
    extend: {
      animation: theme.animation,
    },
  },
  plugins: [typography],
  content: [
    "./src/**/*.{html,svelte,css}",
    "../../interfaces/display/**/*.{html,svelte,css}",
    "../../../modules/games/**/*.{html,svelte,css}",
    "./themes/**/*",
  ],
  // safelist: [{pattern: /.*/, deep: false, variants: ["md"],},],
};

export default config;
