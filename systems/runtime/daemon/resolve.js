// populate is for tools, maps and repositories
import { secure, is } from "@vivalence/shared";
import { fn } from "@vivalence/shared";

import { traitmap } from "./modes/traitmap.js";

export async function modes(die) {
  for (const mode of die.good.modes()) {
    if (mode.cake.aperture) mode.aperture.descendants.push(mode.cake.aperture);

    for (const trait of mode.traits) {
      await die.variant.traits[trait]?.(mode, die.good);
    }
  }
}

async function services(die) {
  if (die.mask.consume) {
    for (const [service, config] of Object.entries(die.mask.consume)) {
      const provider = runtime.terrans.find((t) => t.slug === config.provider);
      die.variant.service[service] = provider;
    }
  }
}
