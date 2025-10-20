import { assert, assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import * as specimen from "@std/testing/bdd";
import { expect } from "@std/expect";

import { Url, Cake, is, Path, Env } from "@vivalence/typology";
import { Paladin } from "@vivalence/paladin/prototype";
import { populate, resolve, integrate } from "@vivalence/paladin/lifecycle";

let paladin;

describe("Paladin", () => {
  describe("construction", () => {
    it("cycles", () => {
      paladin = new Paladin();
    });

    describe("gestalt", () => {
      it("creates valid paladin instance", () => {
        assert(is.fn(paladin.read.json));
        assert(is.fn(paladin.find.viva));
        assert(is.fn(paladin.check.env));
        assert(is.fn(paladin.state.dir));
        assert(is.fn(paladin.join.tilde));
      });
    });
  });

  describe("population", () => {
    it("cycles", async () => {
      await populate.env(paladin);
      await populate.environment(paladin);
      await populate.system(paladin);

      await populate.vip(paladin);
      await populate.modeselector(paladin);
      await populate.statements(paladin);
      await populate.questions(paladin);
    });

    describe("gestalt", () => {
      it("loads environment configuration", () => {
        assert(is.string(paladin.env.get("VIVA_SYSTEM_MODE")));
        assert(is.string(paladin.mode));
        assert(is.string(paladin.role));
      });

      it("establishes system paths", () => {
        assertEquals(
          paladin.system.mount.absolute,
          paladin.env.get("VIVA_SYSTEM_MOUNT"),
        );
        assertEquals(
          paladin.tilde.mount.absolute,
          paladin.env.get("VIVA_TILDE_MOUNT"),
        );
      });

      it("initializes module registry", () => {
        assertEquals(paladin.vip.pensieve.size, 0);
      });

      it("configures operational mode", () => {
        assert(is.boolean(paladin.is.dev));
        assert(is.boolean(paladin.is.prod));
        assert(is.boolean(paladin.is.build));
      });
    });
  });

  describe("resolution", () => {
    it("cycles", async () => {
      await resolve.variant(paladin);
      await resolve.runtimes(paladin);
    });

    describe("gestalt", () => {
      it("resolves variant configuration", () => {
        assert(is.string(paladin.variant));
        assert(is.array(paladin.traits));
      });

      it("populates runtime cakes", () => {
        // @beef: test that runtime, gaia, datamap, services, are all cakes.
      });
    });

    specimen.describe("valences", () => {
      specimen.describe("bakes", () => {
        specimen.it("is", async () => {
          const runtime = paladin.runtimes[0];
          expect(runtime).toBeDefined();
          // console.log({ runtime });
          // test that
        });

        // specimen.it("runtime cake with mount and services", async () => {
        //   const config = {
        //     slug: "test-runtime",
        //     services: [{ slug: "gaia" }, { slug: "datamap" }],
        //   };

        //   runtimeCake = paladin.bake.runtime(new Cake(config));

        //   expect(runtimeCake.mount).toBeDefined();
        //   expect(runtimeCake.mount.absolute).toContain("runtime_test-runtime");
        //   expect(runtimeCake.services).toHaveLength(2);
        // });

        // specimen.it("autocompletes gaia service", async () => {
        //   const config = { slug: "test-runtime-2" };
        //   const cake = paladin.bake.runtime(new Cake(config));

        //   expect(cake.gaia).toBeDefined();
        //   expect(cake.gaia.runtime).toBe("test-runtime-2");
        // });

        // specimen.it("autocompletes datamap service", async () => {
        //   const config = { slug: "test-runtime-3" };
        //   const cake = paladin.bake.runtime(new Cake(config));
        //   // @beef: note here
        //   console.log({ paladin: { paladin }, cake });

        //   expect(cake.datamap).toBeDefined();
        //   expect(cake.datamap.runtime).toBe("test-runtime-3");
        // });
      });
    });
    //
  });

  describe("integration", () => {
    it("cycles", async () => {
      // await integrate.bake(paladin);
      await integrate.publish(paladin);
      await integrate.secure(paladin);
      await integrate.validate(paladin);
      // console.log({ paladin: { paladin } });
    });
  });
});
