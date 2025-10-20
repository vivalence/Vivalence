import paladin from "@vivalence/paladin";
import { assert, assertEquals } from "@std/assert";
import * as specimen from "@std/testing/bdd";
import { expect } from "@std/expect";

import { Path, is } from "@vivalence/typology";
import { Daemon, lifecycle } from "@vivalence/daemon";

let daemon;

specimen.describe("Daemon", () => {
  specimen.describe("construction", () => {
    specimen.it("cycles", () => {
      daemon = new Daemon();
    });

    specimen.describe("gestalt", () => {
      specimen.it("is", () => {
        expect(is.object(daemon)).toBe(true);
      });

      specimen.it("constructs with proper aperture", () => {
        expect(daemon.aperture.json).toEqual({ "/": ["/status"] });
      });

      specimen.it("initializes empty collections", () => {
        expect(daemon.runtimes.length).toBe(0);
        expect(daemon.twitch.effects.size).toBe(0);
        expect(daemon.twitch.trajectories.size).toBe(0);
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
          expect(paladin.runtimes).toBeInstanceOf(Array);
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
      await lifecycle.resolve.castRuntimeDies(daemon);
      await lifecycle.resolve.diceRuntimes(daemon);
    });

    specimen.describe("gestalt", () => {
      specimen.describe("runtimes", () => {
        specimen.it("is", () => {
          // array, children of runtimes are all instances of Die
          // console.log(daemon);
        });
      });
    });
  });
});
