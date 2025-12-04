import { Wafer } from "@vivalence/typology";

import * as lifecycle from "./lifecycle/index.js";

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
    // await lifecycle.population.services(this);
  }

  async resolve() {
    await lifecycle.resolution.modes(this);
    // await resolution.service(this);
  }

  async integrate() {
    await lifecycle.integration.aperture.datamap(this);
    await lifecycle.integration.aperture.userspace(this);
    await lifecycle.integration.aperture.modes(this);
    await lifecycle.integration.twitch(this);
    await lifecycle.integration.call(this);
    await lifecycle.integration.modes(this);

    this.status.set("alive");
  }

  async disintegrate() {
    await this.good.kernel.orm?.close?.();
    // await sleep(1);
    this.status.set("stopped");
  }
}
