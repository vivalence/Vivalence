import { is, object, shape, Wafer, Blacklist } from "@vivalence/typology";

import * as lifecycle from "./lifecycle/index.js";
import * as aperture from "./aperture/index.js";

// TODO migrate to dossier pattern.
// TODO2 rename dossier pattern do die pattern.
// aka keep name, change pattern.

export class Die extends Wafer {
  register = {
    lighthouse: null,
    hallucinator: null,
    datamap: null,
    kernel: [],
    services: [],
  };

  instance = {
    kinds: {},
    traits: {},
    entities: [],
    services: {},
  };

  async populate() {
    await lifecycle.population.core(this);
    lifecycle.population.wiring(this);
    await lifecycle.population.datamap(this);
    await lifecycle.population.authority(this);
    await lifecycle.population.acid(this);
    await lifecycle.population.modes(this);
    await lifecycle.population.handlers(this);
    await lifecycle.population.services(this);
  }

  async resolve() {
    await lifecycle.resolution.domain(this);
    await lifecycle.resolution.modes(this);
    await lifecycle.resolution.freight(this);

    await aperture.datamap(this);
    await aperture.userspace(this);
    await aperture.modes(this);
    await aperture.freight(this);
    await aperture.metadata(this);
    await aperture.cortex(this);
  }

  async integrate() {
    await lifecycle.integration.call(this);
    await lifecycle.integration.prune(this);
    this.status.set("alive");
  }

  async disintegrate() {
    for (const mode of this.good?.flatmodes?.() ?? [])
      for (const terminate of mode.terminators ?? []) await terminate();
    await this.datamap?.disintegrate();
    this.status.set("stopped");
  }
}
