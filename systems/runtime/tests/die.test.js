import * as specimen from "@std/testing/bdd";
import { expect } from "@std/expect";

import { Daemon, Url, is, Path, Mask, Die } from "@vivalence/typology";
import { lifecycle } from "@vivalence/daemon/daemon";

import paladin from "@vivalence/paladin";
import daemon from "@vivalence/daemon";

let die;

specimen.describe("Die", () => {
  specimen.describe("construction", () => {
    specimen.it("cycles", async () => {
      await paladin.ikiro;
      await daemon.ikiro;

      const cake = paladin.daemons[0];
      // console.log(cake);
      die = new Die({ cake, good: new Daemon(cake) });
    });
  });
  specimen.describe("population", () => {
    specimen.it("cycles", async () => {
      await lifecycle.populate.core(die);
      await lifecycle.populate.datamap(die);
      await lifecycle.populate.modes(die);
      await lifecycle.populate.runtime(die);
      await lifecycle.populate.services(die);
    });
  });

  specimen.describe("resolution", () => {
    specimen.it("cycles", async () => {
      await lifecycle.resolve.modes(die);
    });
  });

  specimen.describe("integration", () => {
    specimen.it("cycles", async () => {
      await lifecycle.integrate.aperture.datamap(die);
      await lifecycle.integrate.aperture.userspace(die);
      await lifecycle.integrate.aperture.modes(die);
      await lifecycle.integrate.twitch(die);
      await lifecycle.integrate.call(die);
      await lifecycle.integrate.modes(die);
      // console.log({ die });
    });
  });

  specimen.it("disintegrates", async () => {
    await die.good.kernel.orm.close();
  });
});
