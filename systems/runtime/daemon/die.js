import { Wafer } from "@vivalence/typology";

import * as lifecycle from "./lifecycle/index.js";
import * as kernel from "./kernel/index.js";
import * as aperture from "./aperture/index.js";

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
    await lifecycle.population.datamap(this);
    await lifecycle.population.authority(this);
    await lifecycle.population.acid(this);
    await lifecycle.population.modes(this);
    await lifecycle.population.twitch(this);
    await lifecycle.population.handlers(this);
    await lifecycle.population.services(this);

    kernel.remedies(this);
  }

  // await lifecycle.resolution.services(this);
  // await lifecycle.population.services(this);

  async resolve() {
    await kernel.datasets(this);
    await kernel.classifier(this);
    await kernel.schema(this);
    await kernel.constraints(this);
    kernel.validation(this);
    kernel.asserter(this);

    await lifecycle.resolution.modes(this);

    await aperture.datamap(this);
    await aperture.userspace(this);
    await aperture.modes(this);
  }

  async integrate() {
    await lifecycle.integration.call(this);

    console.log(
      "TEST @runtime/daemon/die",
      this,
      await this.good.entities.dimension.find({}, { limit: 2 }),
      await this.good.entities.subject.find({}, { limit: 2 }),
      await this.good.entities.symbol.find({}, { limit: 2 }),
      await this.good.entities.literal.find({}, { limit: 2 }),
    );
    // console.log("TEST @runtime/daemon/die", this, this.good.entities);
    // console.log("TEST @runtime/daemon/die", this.good.classify);
    const annotation = {
      lemma: "autobús",
      pos: "noun",
      gender: "masc",
      number: "sing",
    };

    const literal = await this.good.entities.literal.findOne({
      annotation: { lemma: annotation.lemma },
    });

    console.log("tested annotation validation", { literal });
    const result = await this.good.validate.literal(literal, ["RELATIONAL"]);
    console.log("tested annotation validation", { result });

    // const result = await this.good.assert.annotation(annotation, [
    //   "RELATIONAL",
    //   "EXISTENTIAL",
    // ]);

    this.status.set("alive");
  }

  async disintegrate() {
    // todo: refactor to abort controller
    await this.good.kernel.orm?.close?.();
    // await sleep(1);
    this.status.set("stopped");
  }
}
