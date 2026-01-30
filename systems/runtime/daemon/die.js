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
    lifecycle.population.wiring(this);
    await lifecycle.population.datamap(this);
    await lifecycle.population.authority(this);
    await lifecycle.population.acid(this);
    await lifecycle.population.modes(this);
    await lifecycle.population.twitch(this);
    await lifecycle.population.handlers(this);
    await lifecycle.population.services(this);
  }

  async resolve() {
    await kernel.topography(this);
    await kernel.schema(this);
    await kernel.constraints(this);
    kernel.validation(this);
    kernel.asserter(this);
    await kernel.classifier(this);

    await lifecycle.resolution.kernel(this);
    await lifecycle.resolution.modes(this);

    await aperture.datamap(this);
    await aperture.userspace(this);
    // await aperture.kernel(this);
    await aperture.modes(this);
  }

  async integrate() {
    await lifecycle.integration.call(this);

    // const literal = {slug: "el-det-fem-sing", data: {known: "the", learning: "la", index: 1, example: {known: "the house", learning: "la casa",},}, annotation: {lemma: "el", pos: "det", definite: "def", gender: "fem", number: "sing", prontype: "art",},};
    // const annotation = literal.annotation; let issues = await this.good.validate.annotation(annotation, ["SCHEMATIC", "EXISTENTIAL", "RELATIONAL"],);
    // let issues = await this.good.validate.literal(literal, ["SCHEMATIC", "EXISTENTIAL", "RELATIONAL",]);
    // issues = await this.good.kernel.medic.many(issues, { daemon: this.good });

    // console.log(
    //   "TEST @runtime/daemon/die",
    //   this,
    //   await this.good.entities.dimension.find({}, { limit: 2 }),
    //   await this.good.entities.subject.find({}, { limit: 2 }),
    //   await this.good.entities.symbol.find({}, { limit: 2 }),
    //   await this.good.entities.literal.find({}, { limit: 2 }),
    // );
    // console.log("TEST @runtime/daemon/die", { daemon: this.good });
    // console.log("TEST @runtime/daemon/die", this.good.classify);
    // const literal = await this.good.entities.literal.findOne({annotation: { lemma: annotation.lemma },}); console.log("tested annotation validation", { literal }); const result = await this.good.validate.literal(literal, ["RELATIONAL"]); console.log("tested annotation validation", { result });

    // const result = await this.good.classify.text("el autobus es rocho");
    // const annotation = {lemma: "autobús", pos: "noun", gender: "masc", number: "sing",};
    // const result = await this.good.assert.annotation(annotation, ["RELATIONAL", "EXISTENTIAL",]);
    // console.log("@daemonDie", { result });
    this.status.set("alive");
  }

  async disintegrate() {
    // todo: refactor to abort controller
    await this.good.kernel.orm?.close?.();
    // await sleep(1);
    this.status.set("stopped");
  }
}
