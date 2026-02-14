import postcss from "postcss";

import colors from "../primitives/colors.js";
import tokens from "../primitives/tokens.js";

import themes from "../themes/index.js";

import { generateCSS } from "./lib.js";

const plugin = (options = {}) => {
  let DesignSystem = {
    colors: {},
    tokens: {},
    themes: {},
    output: { css: "" },
  };

  const DesignProcess = [colors, tokens, themes, generateCSS];

  return {
    postcssPlugin: "vivalence-design-system-weaving",
    Once: async (root, result) => {
      // const start = performance.now(); const ticker = (name) => (ds) => {console.log(`[PERF] init to [${name}] in [${performance.now() - start}ms]`,); return ds;};

      DesignSystem = await DesignProcess.reduce(
        (acc, fn) => acc.then(fn),
        Promise.resolve(DesignSystem),
      );
      root.prepend(
        postcss.parse(DesignSystem.output.css, { from: "./VIVA_THEME.css" }),
      );
    },
  };
};

plugin.postcss = true;

export { plugin };
export default plugin;
