import paladin from "@vivalence/paladin";
import { Die, Runtime } from "@vivalence/runtime";

const run = await (async function () {
  // console.log("paladin.env", paladin.env);
  await paladin.instance.mount();
  // console.log("paladin.instance", paladin.instance);
  // console.log("paladin.instance", JSON.stringify(paladin.instance, null, 2));
  const die = new Die({ good: new Runtime() });
  await die.populate();
  return die;
})();

// run.ikiro = (async function ikiro() {await run.resolve(); await run.integrate();})();

export default run;

if (import.meta.main) {
  await run.resolve();
  await run.integrate();
  await run.perpetuate();
}

// if (import.meta.main) {
//   await die.ikiro;
//   await die.perpetuate();
// }

// // export default die;
// // import { Path } from "@vivalence/typology";
// // import paladin from "@vivalence/paladin";

// // // import { Runtime, lifecycle } from "./typology.js";
// // const runtime = await (async () => {
// //   return runtime;
// // })();

// // runtime.ikiro = (async () => {
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
