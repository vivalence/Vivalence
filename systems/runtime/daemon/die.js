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
    modes: [],
    services: [],
  };

  variant = {
    kernel: {},
    modes: [],
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
    await lifecycle.resolution.kernel(this);
    await lifecycle.resolution.modes(this);
    await lifecycle.resolution.freight(this);

    await aperture.datamap(this);
    await aperture.userspace(this);
    await aperture.modes(this);
    await aperture.freight(this);
    await aperture.metadata(this);
  }

  async integrate() {
    await lifecycle.integration.call(this);
    // console.log("this", this.mask, Object.keys(this));

    // const compiled = shape.agentic(this.good.aperture);
    // console.log(compiled);
    await lifecycle.integration.prune(this);
    this.status.set("alive");
  }

  async disintegrate() {
    await this.datamap?.disintegrate();
    this.status.set("stopped");
  }
}
