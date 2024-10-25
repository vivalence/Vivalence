import typography from "@tailwindcss/typography";
import daisyui from "daisyui";

const config = {
  purge: false,
  theme: {
    extend: {},
  },
  plugins: [typography, daisyui],
  content: [
    "./src/**/*.{html,svelte}",
    "../../ui/src/**/*.{html,svelte}",
    "../../../viva_modules/**/*.svelte",
  ],
  darkMode: ["class", '[data-theme="dark"]'],
  daisyui: {
    themes: [
      { dark: { ...require("daisyui/src/theming/themes")["dark"] } },
      { light: { ...require("daisyui/src/theming/themes")["light"] } },
    ],
  },
};

export default config;
