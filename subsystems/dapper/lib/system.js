import colors from "./colors.js";
import tokens from "./tokens.js";
import themes from "../themes/index.js";
import { generateCSS } from "./flatten.js";

// the whole design system in one call. lifecycle/index.js spelled this pipeline out for postcss
// and nothing else could reach it — the package's own tests import colors/tokens/paper by
// relative path, which is not a door anyone outside can use. One source, both callers.
//
// generateCSS returns ONLY { output: { css } }, so a plain reduce hands back a value with no
// themes on it. Merged here, so a caller can read the sheet AND the ladder that produced it.
export const design = async () => {
  const ds = await [colors, tokens, themes].reduce(
    (carried, step) => carried.then(step),
    Promise.resolve({ colors: {}, tokens: {}, themes: {} }),
  );
  return { ...ds, ...generateCSS(ds) };
};
