export * from "./primitives/colors.js";
export * from "./primitives/tokens.js";
export * from "./primitives/builders.js";
export * from "./themes/index.js";
export * from "./belt/index.js";

export { plugin as postcssPlugin } from "./belt/postcss-plugin.js";
export { tailwindClasses, safelist } from "./belt/tailwind-theme.js";

// import colors from "./primitives/colors.js";
// import tokens from "./primitives/tokens.js";
// import themes from "./themes/index.js";
// import { generateCSS } from "./belt/index.js";

// export const dapper = {
//   colors,
//   tokens,
//   themes,
//   generateCSS,
// };

// export default dapper;
