export * from "./runtime.js";
export * from "./die.js";
export * as lifecycle from "./lifecycle/index.js";
export * as daemon from "./daemon/index.js";
export * as process from "./process/index.js";

// export { Runtime } from "./runtime.js";
// export { Die } from "./die.js";
// export * as lifecycle from "./lifecycle/index.js";
// export * as daemon from "./daemon/index.js";
// export * as process from "./process/index.js";

// import paladin from "@vivalence/paladin";
// import { Die } from "./die.js";
// import { Runtime } from "./runtime.js";

// export const die = await (async function incarne() {
//   await paladin.ikiro;
//   const die = new Die({ good: new Runtime() });
//   await die.populate();
//   return die;
// })();

// die.ikiro = (async function ikiro() {
//   await die.resolve();
//   await die.integrate();
// })();

// die.perpetuate = async function perpetuate() {
//   die.status.set("alive");

//   ["SIGTERM", "SIGINT", "SIGQUIT"].forEach((sig) => {
//     Deno.addSignalListener(sig, () => die.disintegrate(sig));
//   });

//   while (die.status.is(["alive"])) {
//     await new Promise((resolve) => setTimeout(resolve, 5000));
//     await die.good.ters?.patrol();
//   }
// };

// // import { Path } from "@vivalence/typology";
// // import paladin from "@vivalence/paladin";

// // // import { Runtime, lifecycle } from "./typology.js";

// // const runtime = await (async () => {
// //   console.log("runtime construction");
// //   await paladin.ikiro;
// //   const runtime = new Runtime();

// //   await paladin.vip.mount(paladin.scope.registry.branch("kernels"));
// //   await paladin.vip.mount(paladin.scope.registry.branch("modes"));
// //   await paladin.vip.mount(paladin.scope.registry.branch("services"));

// //   await lifecycle.populate.aperture(runtime);
// //   await lifecycle.populate.terrans(runtime);
// //   console.log("runtime populated");
// //   return runtime;
// // })();

// // runtime.ikiro = (async () => {
// //   console.log("runtime integration");
// //   await lifecycle.integrate.serve(runtime);
// //   await lifecycle.integrate.watchdog(runtime);
// //   await lifecycle.integrate.launch(runtime);
// //   console.log("runtime integrated");
// // })();

// // runtime.disintegrate = async function disintegrate(signal) {
// //   console.log(`Received ${signal}, shutting down...`);
// //   runtime.status.set({ code: "STOPPING" });
// //   // for (const terran of runtime.terrans) await terran.stop?.();
// //   runtime.abort.abort(); // meh.
// //   runtime.status.set({ code: "STOPPED" });
// //   Deno.exit(signal);
// // };

// // runtime.perpetuate = async () => {
// //   runtime.status.set("ALIVE");

// //   ["SIGTERM", "SIGINT", "SIGQUIT"].forEach((sig) => {
// //     // console.log("SIG", { sig });
// //     return Deno.addSignalListener(sig, (sig) => {
// //       // console.log("RECEIVED", { sig });
// //       return runtime.disintegrate(sig);
// //     });
// //   });

// //   while (runtime.status.is(["ALIVE"])) {
// //     await new Promise((resolve) => setTimeout(resolve, 5000));
// //     await runtime.ters.patrol();
// //   }
// //   // while (runtime.status.reflection.code === "RUNNING") {await new Promise((resolve) => runtime.abort.signal.addEventListener("abort", resolve, { once: true }) || setTimeout(resolve, 5000),);}
// // };

// // if (import.meta.main) {
// //   await runtime.ikiro;
// //   // console.log({ paladin, runtime });
// //   await runtime.perpetuate();
// // }

// // export default runtime;

// // // export * from "./runtime.js";
// // // export * from "./daemon/daemon.js";

// // // export * from "./process/";

// // // export * as prototypes from "./prototypes/index.js";
// // // runtime, daemon, process

// // // export * as lifecycle from "./lifecycle/index.js"; //?
