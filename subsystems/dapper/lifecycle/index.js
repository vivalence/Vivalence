import postcss from "postcss";

import colors from "../lib/colors.js";
import tokens from "../lib/tokens.js";

import themes from "../themes/index.js";

import { generateCSS } from "../lib/flatten.js";

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
