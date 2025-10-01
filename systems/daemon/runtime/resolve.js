import { obj, validators } from "@vivalence/shared";
import { Vector, compiler, controller } from "@vivalence/vector";
import { Aperture } from "@vivalence/vector/aperture";
import { secure, is } from "@vivalence/shared";
import * as lib from "./lib/index.js";

export async function ontology(rme) {
  for (const ontology of Object.values(lib.ontology)) await ontology(rme);
}

export async function aperture(rme) {
  for (const aperture of Object.values(lib.aperture)) await aperture(rme);
}

export async function modules(rme, daemon) {
  for (const module of rme.instance.module.values()) {
    if (module.register.aperture instanceof Aperture) {
      module.aperture.descendants.push(module.register.aperture);
    }
    if (is.fn(module.register.aperture)) {
      module.register.aperture(module.aperture);
    }
  }
}

export async function traits(rme, daemon) {
  for (const module of rme.instance.module.values()) {
    for (const trait of module.traits) {
      if (!rme.maps.traits[trait]) continue;
      await rme.maps.traits[trait](module, rme.instance);
    }
  }
}
