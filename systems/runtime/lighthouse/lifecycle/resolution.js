import { stagger } from "../../gestalten/belt/index.js";
import * as catalog from "../traits/index.js";

export const traits = async (die) => {
  for (const finalize of await stagger(die.lighthouse, die.runtime, catalog)) await finalize();
  die.aperture.branch("/lighthouse", die.lighthouse.aperture);
};
