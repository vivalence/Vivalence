import paladin from "@vivalence/paladin";
import { specimen, Path } from "@vivalence/typology";
import { Gaia, lifecycle } from "@vivalence/gaia/typology";

let gaia;

specimen.describe("Gaia", () => {
  specimen.describe("construction", () => {
    specimen.it("cycles", () => {
      gaia = new Gaia();
    });

    specimen.describe("gestalt", () => {
      specimen.it("is", () => {
        specimen.expect(gaia.status).toBeDefined();
        specimen.expect(gaia.terrans).toEqual([]);
        specimen.expect(gaia.server).toBeDefined();
        specimen.expect(gaia.aperture).toBeDefined();
      });
    });
  });

  specimen.describe("population", () => {
    specimen.it("cycles", async () => {
      await lifecycle.populate.aperture(gaia);
      await lifecycle.populate.patrol(gaia);
    });

    specimen.describe("gestalt", () => {
      specimen.it("server instantiated", () => {
        specimen.expect(gaia.server).toBeDefined();
      });
    });
  });

  specimen.describe("integration", () => {
    specimen.it("cycles", async () => {
      await lifecycle.integrate.serve(gaia);
      await lifecycle.integrate.launch(gaia);
    });
  });

  specimen.describe("disintegration", () => {
    specimen.it("cycles", async () => {
      // timeout
      await paladin.ikiro;

      // console.log({ paladin: { paladin }, gaia });
      console.log(JSON.stringify(paladin.variant));

      gaia.abort.abort();
      await gaia.listen;
      // i need some timeout criteria here
    });
  });
});

// OLD:
// import { specimen } from "@vivalence/typology";
// import { Gaia } from "@vivalence/gaia/typology";

// // ** Success Criteria
// // - [ ] serves variant terrain

// let gaia;

// specimen.describe("Gaia", () => {
//   specimen.describe("construction", () => {
//     specimen.it("cycles", () => {
//       gaia = new Gaia();
//       console.log({ gaia });
//     });

//     specimen.describe("gestalt", () => {
//       specimen.it("is", () => {
//         // match some json snapshot maybe?
//       });
//     });
//   });
// });

// describe("Gaia", () => {
//   describe("construction", () => {
//     it("cycles", () => gaia = new Gaia());

//     describe("gestalt", () => {
//       it("has process management tools", () => {
//         expect(gaia.spawn).toBeDefined();
//         expect(gaia.kill).toBeDefined();
//         expect(gaia.watchdog).toBeDefined();
//       });
//     });
//   });

//   describe("population", () => {
//     // it("loads processes from paladin", async () => {await populate.processes(gaia, paladin); expect(gaia.things.length).toBeGreaterThan(0);});
//   });

//   describe("resolution", () => {
//     // it("starts lighthouse and hut", async () => {await gaia.start("lighthouse"); await gaia.start("hut"); expect(gaia.status("lighthouse")).toBe("running");});
//   });
// });

// import paladin from "@vivalence/paladin";
// import { assert, assertEquals } from "@std/assert";
// import * as specimen from "@std/testing/bdd";
// import { expect } from "@std/expect";

// import { Path, is } from "@vivalence/typology";
// import { Gaia, lifecycle } from "@vivalence/gaia";

// let gaia;

//   specimen.describe("population", () => {
//     specimen.it("cycles", async () => {
//       await paladin.vip.mount(new Path(paladin.env.get("VIVA_VIP_MOUNT")));
//     });

//     specimen.describe("gestalt", () => {
//       specimen.describe("paladin", () => {
//         specimen.it("populates", () => {
//           expect(paladin.gaias).toBeInstanceOf(Array);
//         });
//         specimen.describe("vip", () => {
//           specimen.it("is", () => {
//             expect(paladin).toBeDefined();
//             expect(paladin.vip).toBeDefined();
//           });
//           specimen.it("populates", () => {
//             expect(paladin.vip.pensieve).toBeDefined();
//           });
//         });
//       });
//     });
//   });
//   specimen.describe("resolution", () => {
//     specimen.it("cycles", async () => {
//       await lifecycle.resolve.castGaiaDies(gaia);
//       await lifecycle.resolve.diceGaias(gaia);
//     });

//     specimen.describe("gestalt", () => {
//       specimen.describe("gaias", () => {
//         specimen.it("is", () => {
//           // array, children of gaias are all instances of Die
//           // console.log(gaia);
//         });
//       });
//     });
//   });
// });
