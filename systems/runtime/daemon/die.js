import { Wafer } from "@vivalence/typology";

import * as lifecycle from "./lifecycle/index.js";
import * as aperture from "./aperture/index.js";

export class Die extends Wafer {
  register = {
    authority: null,
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
    await lifecycle.population.datamap(this);
    await lifecycle.population.modes(this);
    await lifecycle.population.authority(this);
    await lifecycle.population.twitch(this);
  }

  // await lifecycle.resolution.services(this);
  // await lifecycle.population.services(this);

  async resolve() {
    await lifecycle.resolution.modes(this);

    await aperture.datamap(this);
    await aperture.userspace(this);
    await aperture.modes(this);
  }

  async integrate() {
    await lifecycle.integration.call(this);

    this.status.set("alive");
  }

  async disintegrate() {
    await this.good.kernel.orm?.close?.();
    // await sleep(1);
    this.status.set("stopped");
  }
}
