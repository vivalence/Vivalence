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
  darkMode: ["class", '[data-theme="night"]'],
  daisyui: {
    themes: [
      {
        dark: {
          ...require("daisyui/src/theming/themes")["dark"],
        },
      },
    ],
  },
};

export default config;
