import { scales } from "./tokens.js";
import { emit } from "./emit.js";
import { THEMES } from "../themes/index.js";

export const design = async () => ({
  themes: THEMES,
  output: { css: [scales(), ...Object.entries(THEMES).map(([name, held]) => emit(name, held))].join("\n") },
});
