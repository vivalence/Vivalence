import autoprefixer from "autoprefixer";
import tailwindcss from "tailwindcss";
import vivalenceDesignSystem from "./src/style/design-system.js";

const config = {
  plugins: [vivalenceDesignSystem, tailwindcss(), autoprefixer],
};

export default config;
