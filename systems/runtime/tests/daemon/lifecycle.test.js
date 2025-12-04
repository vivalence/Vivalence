import paladin from "@vivalence/paladin";
import runtime from "@vivalence/runtime";
import { Url, Path, is, specimen } from "@vivalence/typology";

import { Daemon, Die } from "@vivalence/runtime/daemon";

let die;

specimen.describe("Daemon", () => {
  specimen.describe("construction", () => {
    specimen.it("cycles", async () => {
      const mask = paladin.variant.daemons[0];
      die = new Die({ mask, good: new Daemon(mask) });
    });
  });

  specimen.describe("population", () => {
    specimen.it("cycles", async () => {
      await die.populate();
    });
  });

  specimen.describe("resolution", () => {
    specimen.it("cycles", async () => {
      await die.resolve();
      // await lifecycle.resolve.modes(die);
    });
  });

  specimen.describe("integration", () => {
    specimen.it("cycles", async () => {
      await die.integrate();
      // // console.log({ die });
    });
  });

  specimen.it("disintegrates", async () => {
    await die.disintegrate();
  });
});
