import paladin from "@vivalence/paladin";
import { specimen, Path } from "@vivalence/typology";
import { Runtime, lifecycle } from "@vivalence/runtime/typology";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let runtime;

specimen.describe("Runtime", () => {
  specimen.describe("construction", () => {
    specimen.it("cycles", () => {
      runtime = new Runtime();
    });

    specimen.describe("gestalt", () => {
      specimen.it("is", () => {
        specimen.expect(runtime.status).toBeDefined();
      });
    });
  });

  specimen.describe("population", () => {
    specimen.it("cycles", async () => {
      await paladin.ikiro;
      await lifecycle.populate.aperture(runtime);
      await lifecycle.populate.registry(runtime);
      await lifecycle.populate.terrans(runtime);
    });

    specimen.describe("gestalt", () => {
      // specimen.it("server instantiated", () => {specimen.expect(runtime.server).toBeDefined();});
    });
  });

  specimen.describe("resolution", () => {
    specimen.it("cycles", async () => {
      // await lifecycle.resolve.(runtime);
    });
  });
  specimen.describe("integration", () => {
    specimen.it("cycles", async () => {
      await lifecycle.integrate.serve(runtime);
      await lifecycle.integrate.launch(runtime);
    });
  });

  return;
  specimen.describe("disintegration", () => {
    specimen.it("cycles", async () => {
      runtime.abort.abort();
      await sleep(4000);
      console.log("[ABOOOOOOOOOOOOOOOOOOOOOOOOORT]");
    });
  });
});

// OLD:
// import { specimen } from "@vivalence/typology";
// import { Runtime } from "@vivalence/runtime/typology";

// // ** Success Criteria
// // - [ ] serves variant terrain

// let runtime;

// specimen.describe("Runtime", () => {
//   specimen.describe("construction", () => {
//     specimen.it("cycles", () => {
//       runtime = new Runtime();
//       console.log({ runtime });
//     });

//     specimen.describe("gestalt", () => {
//       specimen.it("is", () => {
//         // match some json snapshot maybe?
//       });
//     });
//   });
// });

// describe("Runtime", () => {
//   describe("construction", () => {
//     it("cycles", () => runtime = new Runtime());

//     describe("gestalt", () => {
//       it("has process management tools", () => {
//         expect(runtime.spawn).toBeDefined();
//         expect(runtime.kill).toBeDefined();
//         expect(runtime.watchdog).toBeDefined();
//       });
//     });
//   });

//   describe("population", () => {
//     // it("loads processes from paladin", async () => {await populate.processes(runtime, paladin); expect(runtime.things.length).toBeGreaterThan(0);});
//   });

//   describe("resolution", () => {
//     // it("starts lighthouse and hut", async () => {await runtime.start("lighthouse"); await runtime.start("hut"); expect(runtime.status("lighthouse")).toBe("running");});
//   });
// });

// import paladin from "@vivalence/paladin";
// import { assert, assertEquals } from "@std/assert";
// import * as specimen from "@std/testing/bdd";
// import { expect } from "@std/expect";

// import { Path, is } from "@vivalence/typology";
// import { Runtime, lifecycle } from "@vivalence/runtime";

// let runtime;

//   specimen.describe("population", () => {
//     specimen.it("cycles", async () => {
//       await paladin.vip.mount(new Path(paladin.env.get("VIVA_VIP_MOUNT")));
//     });

//     specimen.describe("gestalt", () => {
//       specimen.describe("paladin", () => {
//         specimen.it("populates", () => {
//           expect(paladin.runtimes).toBeInstanceOf(Array);
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
//       await lifecycle.resolve.castRuntimeDies(runtime);
//       await lifecycle.resolve.diceRuntimes(runtime);
//     });

//     specimen.describe("gestalt", () => {
//       specimen.describe("runtimes", () => {
//         specimen.it("is", () => {
//           // array, children of runtimes are all instances of Die
//           // console.log(runtime);
//         });
//       });
//     });
//   });
// });
