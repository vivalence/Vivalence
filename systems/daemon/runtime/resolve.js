// populate is for tools, maps and repositories
import { secure, is } from "@vivalence/shared";
import { fn } from "@vivalence/shared";

import { traitmap } from "./modes/traitmap.js";

export async function modes(die, daemon) {
  for (const mode of die.good.modes()) {
    if (mode.cake.aperture) mode.aperture.descendants.push(mode.cake.aperture);

    for (const trait of mode.traits) {
      await die.variant.traits[trait]?.(mode, die.good);
    }
  }
}
