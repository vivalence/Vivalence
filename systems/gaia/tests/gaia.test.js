import paladin from "@vivalence/paladin";
import { assert, assertEquals } from "@std/assert";
import * as specimen from "@std/testing/bdd";
import { expect } from "@std/expect";

import { Path, is } from "@vivalence/typology";
import { Gaia, lifecycle } from "@vivalence/gaia";

let gaia;

specimen.describe("Gaia", () => {
  specimen.describe("construction", () => {
    specimen.it("cycles", () => {
      gaia = new Gaia();
    });

    specimen.describe("gestalt", () => {
      specimen.it("is", () => {
        // match some json snapshot maybe?
      });
    });
  });

  specimen.describe("population", () => {
    specimen.it("cycles", async () => {
      await paladin.vip.mount(new Path(paladin.env.get("VIVA_VIP_MOUNT")));
    });

    specimen.describe("gestalt", () => {
      specimen.describe("paladin", () => {
        specimen.it("populates", () => {
          expect(paladin.gaias).toBeInstanceOf(Array);
        });
        specimen.describe("vip", () => {
          specimen.it("is", () => {
            expect(paladin).toBeDefined();
            expect(paladin.vip).toBeDefined();
          });
          specimen.it("populates", () => {
            expect(paladin.vip.pensieve).toBeDefined();
          });
        });
      });
    });
  });
  specimen.describe("resolution", () => {
    specimen.it("cycles", async () => {
      await lifecycle.resolve.castGaiaDies(gaia);
      await lifecycle.resolve.diceGaias(gaia);
    });

    specimen.describe("gestalt", () => {
      specimen.describe("gaias", () => {
        specimen.it("is", () => {
          // array, children of gaias are all instances of Die
          // console.log(gaia);
        });
      });
    });
  });
});
