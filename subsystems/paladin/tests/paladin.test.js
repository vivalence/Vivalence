import { specimen } from "@vivalence/typology";
import { Paladin, populate, resolve } from "@vivalence/paladin/typology";

let paladin;

specimen.describe("Paladin", () => {
  specimen.describe("construction", () => {
    specimen.it("cycles", () => {
      paladin = new Paladin();
    });

    specimen.describe("gestalt", () => {
      specimen.it("is", () => {
        specimen.expect(paladin.env).toBeDefined();
        specimen.expect(paladin.secret).toBeDefined();
        specimen.expect(paladin.variant.daemons).toEqual([]);
        specimen.expect(typeof paladin.read.json).toBe("function");
      });
    });
  });

  specimen.describe("population", () => {
    specimen.describe("cycles", () => {
      // await specimen.inspect.lifecycle(paladin, populate); // maybe
      specimen.it("env", async () => await populate.env(paladin));
      specimen.it(
        "environment",
        async () => await populate.environment(paladin),
      );
      specimen.it(
        "modeselector",
        async () => await populate.modeselector(paladin),
      );
      specimen.it("scopes", async () => await populate.scopes(paladin));
      specimen.it(
        "veryimportantpackage",
        async () => await populate.veryimportantpackage(paladin),
      );
      specimen.it("statements", async () => await populate.statements(paladin));
      specimen.it("questions", async () => await populate.questions(paladin));
    });

    specimen.describe("gestalt", () => {
      specimen.it("is", () => {
        specimen.expect(paladin.mode).toBe("DEVELOPMENT");
        specimen.expect(paladin.role).toBe("SUDO");
        specimen.is.Path(paladin.scope.system);
        specimen.expect(paladin.vip.pensieve).toBeDefined();
      });
    });

    specimen.describe("valences", () => {
      specimen.it("paladin.is", () => {
        // test the tool.is values
      });
      specimen.it("paladin.read", () => {
        // find, check, state, join
        // run actual invocations and test the results specimen.expect(typeof paladin.read.json).toBe("function"); specimen.expect(typeof paladin.find.viva).toBe("function"); specimen.expect(typeof paladin.check.env).toBe("function"); specimen.expect(typeof paladin.join.tilde).toBe("function");
      });
      specimen.it("paladin.join", () => {
        // test paladin join tool.
      });
      specimen.it("...paladin.tools", () => {
        // test paladin join tool.
      });
    });
  });

  specimen.describe("resolution", () => {
    specimen.describe("cycles", () => {
      specimen.it("circuits", async () => await resolve.circuits(paladin));
      specimen.it("variant", async () => await resolve.variant(paladin));
      specimen.it("deps", async () => await resolve.dependencies(paladin));
      specimen.it("mounts", async () => await resolve.mounts(paladin));
    });

    specimen.describe("gestalt", () => {
      specimen.it("circuits structure", () => {
        specimen.expect(paladin.variant.circuits.length).toBe(2);
        paladin.variant.circuits.forEach((circuit) => {
          specimen.expect(circuit.manifest.type).toBe("circuit");
          specimen.is.Path(circuit.source);
        });
      });
    });

    specimen.it("variant compilation", () => {
      specimen.expect(paladin.variant.lighthouse).toBeDefined();
      specimen.expect(paladin.variant.gaia).toBeDefined();
      specimen
        .expect(paladin.variant.gaia.statics.serve.href)
        .toBe("http://localhost:1729/");

      specimen.expect(paladin.variant.clients.ghost).toBeDefined();
      specimen.expect(paladin.variant.clients.hut).toBeDefined();

      specimen.expect(paladin.variant.daemons).toBeInstanceOf(Array);
      specimen.expect(paladin.variant.daemons.length).toBe(1);
      // specimen.expect(paladin.variant.daemons[0].slug).toBe("ger2esp");
      specimen.is.Path(paladin.variant.daemons[0].mount);

      specimen.expect(paladin.variant.services).toBeInstanceOf(Array);
      specimen.expect(paladin.variant.services.length).toBe(2);
      // specimen
      //   .expect(paladin.variant.services.map((s) => s.slug))
      //   .toEqual(specimen.expect.arrayContaining(["lighthouse", "hal", "nlp-stanza"]),);
    });

    // specimen.it("dependency resolution", () => {
    //   const daemon = paladin.variant.daemons.find((d) => d.slug === "ger2esp");
    //   specimen.expect(daemon.consume.nlp).toBeDefined();
    //   specimen.expect(daemon.consume.nlp.provider).toBeDefined();
    //   specimen.expect(daemon.consume.nlp.provider.slug).toBe("nlp-stanza");
    // });

    specimen.it("mount generation", () => {
      // All services should have mount paths
      paladin.variant.services.forEach((service) => {
        specimen.is.Path(service.mount);
        specimen.expect(service.mount.absolute).toContain("mountpoint");
        specimen.expect(service.mount.absolute).toContain(service.slug);
      });

      // All daemons should have mount paths
      paladin.variant.daemons.forEach((daemon) => {
        specimen.is.Path(daemon.mount);
        specimen.expect(daemon.mount.absolute).toContain("mountpoint");
        specimen.expect(daemon.mount.absolute).toContain(daemon.slug);
      });
    });
  });

  specimen.describe("valences", () => {
    // specimen.it("circuits loading", async () => {
    //   // Should find and load .viva.js files from variant directory
    //   const circuitPaths = await paladin.find.viva(paladin.scope.variant);
    //   specimen.expect(circuitPaths.length).toBeGreaterThan(0);
    //   // Should filter for circuit manifests only
    //   const allModules = await Promise.all(

    //     circuitPaths.map(async (f) => [f, await paladin.read.viva(f)]),
    //   );
    //   const nonCircuits = allModules.filter(
    //     ([, m]) => m?.manifest?.type !== "circuit",
    //   );
    //   specimen.expect(nonCircuits.length).toBe(0);
    // });

    // specimen.it("variant defence", () => {const circuits = [{ gaia: { test: 1 } }, { gaia: { test: 2 } }]; specimen .expect(() => {if (circuits.filter((c) => c.gaia).length > 1) {throw new Error("Multiple gaia configurations found");}}) .toThrow("Multiple gaia configurations found");});

    specimen.it("filesystem mount creation", async () => {
      // All mount directories should exist after resolution
      // console.log({ paladin });
      const allMounts = [
        ...paladin.variant.daemons.map((d) => d.mount.absolute),
        ...paladin.variant.services.map((s) => s.mount.absolute),
      ];
      for (const mountPath of allMounts) {
        try {
          const stat = await Deno.stat(mountPath);
          specimen.expect(stat.isDirectory).toBe(true);
        } catch (error) {
          specimen.expect(error).toBeNull(); // Should not throw
        }
      }
    });
  });
});

// old
//   specimen.describe("resolution", () => {
//     specimen.describe("cycles", () => {
//       specimen.it("circuits", async () => await resolve.circuits(paladin));
//       specimen.it("variant", async () => await resolve.variant(paladin));
//       specimen.it(
//         "dependencies",
//         async () => await resolve.dependencies(paladin),
//       );
//       specimen.it("mounts", async () => await resolve.mounts(paladin));
//       // specimen.it("cross", async () => await resolve.cross(paladin));
//     });

//     specimen.describe("gestalt", () => {
//       // specimen.it("is", () => {specimen.is.Path(paladin.scope.system);});
//       specimen.it("paladin.variant", () => {
//         // expect a service mount to look a certain way.
//         specimen.is.Path(paladin.scope.system);
//         //
//       });
//     });

//     specimen.describe("valences", () => {
//       specimen.it("paladin.mounts", () => {
//         // test presence of expected paths in filesystem.
//       });
//     });
//   });
// });

// describe("resolution", () => {
//   it("cycles", async () => {
//     await resolve.variant(paladin);
//     await resolve.runtimes(paladin);
//   });

//   describe("gestalt", () => {
//     it("resolves variant configuration", () => {
//       assert(is.string(paladin.variant));
//       assert(is.array(paladin.traits));
//     });

//     it("populates runtime cakes", () => {
//       // @beef: test that runtime, lighthouse, datamap, services, are all cakes.
//     });
//   });

//   specimen.describe("valences", () => {
//     specimen.describe("bakes", () => {
//       specimen.it("is", async () => {
//         const runtime = paladin.runtimes[0];
//         expect(runtime).toBeDefined();
//         // console.log({ runtime });
//         // test that
//       });

//       // specimen.it("runtime cake with mount and services", async () => {
//       //   const config = {
//       //     slug: "test-runtime",
//       //     services: [{ slug: "lighthouse" }, { slug: "datamap" }],
//       //   };

//       //   runtimeCake = paladin.bake.runtime(new Cake(config));

//       //   expect(runtimeCake.mount).toBeDefined();
//       //   expect(runtimeCake.mount.absolute).toContain("runtime_test-runtime");
//       //   expect(runtimeCake.services).toHaveLength(2);
//       // });

//       // specimen.it("autocompletes lighthouse service", async () => {
//       //   const config = { slug: "test-runtime-2" };
//       //   const cake = paladin.bake.runtime(new Cake(config));

//       //   expect(cake.lighthouse).toBeDefined();
//       //   expect(cake.lighthouse.runtime).toBe("test-runtime-2");
//       // });

//       // specimen.it("autocompletes datamap service", async () => {
//       //   const config = { slug: "test-runtime-3" };
//       //   const cake = paladin.bake.runtime(new Cake(config));
//       //   // @beef: note here
//       //   console.log({ paladin: { paladin }, cake });

//       //   expect(cake.datamap).toBeDefined();
//       //   expect(cake.datamap.runtime).toBe("test-runtime-3");
//       // });
//     });
//   });
//   //
// });

// describe("integration", () => {
//   it("cycles", async () => {
//     // await integrate.bake(paladin);
//     await integrate.publish(paladin);
//     await integrate.secure(paladin);
//     await integrate.validate(paladin);
//     // console.log({ paladin: { paladin } });
//   });
// });
