import autoprefixer from "autoprefixer";
import postcssPlugin from "@vivalence/dapper/postcss";

// import vivalenceDesignSystem from "./src/design/postcss-plugin.js";
// console.log({ postcssPlugin });

const config = {
  plugins: [
    postcssPlugin,
    // vivalenceDesignSystem,
    autoprefixer,
  ],
};

export default config;
