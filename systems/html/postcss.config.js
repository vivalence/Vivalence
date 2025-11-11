import autoprefixer from "autoprefixer";
import tailwindcss from "tailwindcss";
import vivalenceDesignSystem from "./src/design/postcss-plugin.js";

const config = {
  plugins: [vivalenceDesignSystem, tailwindcss(), autoprefixer],
};

export default config;
