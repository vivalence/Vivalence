import postcss from "postcss";

import { design } from "../lib/system.js";

const plugin = (options = {}) => ({
  postcssPlugin: "vivalence-design-system-weaving",
  Once: async (root, result) => {
    const { output } = await design();
    root.prepend(postcss.parse(output.css, { from: "./VIVA_THEME.css" }));
  },
});

plugin.postcss = true;

export { plugin };
export default plugin;
