import autoprefixer from "autoprefixer";
import tailwindcss from "tailwindcss";
import { postcssPlugin } from "@vivalence/dapper";

// import vivalenceDesignSystem from "./src/design/postcss-plugin.js";
// console.log({ postcssPlugin });

const config = {
  plugins: [
    postcssPlugin,
    // vivalenceDesignSystem,
    tailwindcss(),
    autoprefixer,
  ],
};

export default config;
