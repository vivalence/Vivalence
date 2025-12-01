import { Url, Path, is, specimen } from "@vivalence/typology";
import { daemon as lifecycle } from "@vivalence/runtime/typology";
import { DaemonDie, Daemon } from "@vivalence/runtime/typology";

import { expect } from "@std/expect";

import paladin from "@vivalence/paladin";
import runtime from "@vivalence/runtime";

let die;

specimen.describe("Daemon", () => {
  specimen.describe("construction", () => {
    specimen.it("cycles", async () => {
      await paladin.ikiro;
      await runtime.ikiro;

      const cake = paladin.daemons[0];
      console.log({ cake });
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
