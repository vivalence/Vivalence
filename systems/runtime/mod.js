// Deno.exit(0);

import { Path } from "@vivalence/typology";
import paladin from "@vivalence/paladin";

// console.log(Deno.args);
// console.log(Deno.env);
// console.log({ paladin });
// console.log(JSON.stringify(Deno.env, null, 2));

import { Runtime, lifecycle } from "./typology.js";

const runtime = await (async () => {
  console.log("runtime construction");
  await paladin.ikiro;
  const runtime = new Runtime();

  await paladin.vip.mount(paladin.scope.registry.branch("kernels"));
  await paladin.vip.mount(paladin.scope.registry.branch("modes"));
  await paladin.vip.mount(paladin.scope.registry.branch("services"));

  await lifecycle.populate.aperture(runtime);
  await lifecycle.populate.terrans(runtime);
  console.log("runtime populated");
  return runtime;
})();

runtime.ikiro = (async () => {
  console.log("runtime integration");
  await lifecycle.integrate.serve(runtime);
  await lifecycle.integrate.watchdog(runtime);
  await lifecycle.integrate.launch(runtime);
  console.log("runtime integrated");
})();

runtime.disintegrate = async function disintegrate(signal) {
  console.log(`Received ${signal}, shutting down...`);
  runtime.status.set({ code: "STOPPING" });
  // for (const terran of runtime.terrans) await terran.stop?.();
  runtime.abort.abort(); // meh.
  runtime.status.set({ code: "STOPPED" });
  Deno.exit(signal);
};

runtime.perpetuate = async () => {
  runtime.status.set("ALIVE");

  ["SIGTERM", "SIGINT", "SIGQUIT"].forEach((sig) => {
    // console.log("SIG", { sig });
    return Deno.addSignalListener(sig, (sig) => {
      // console.log("RECEIVED", { sig });
      return runtime.disintegrate(sig);
    });
  });

  while (runtime.status.is(["ALIVE"])) {
    await new Promise((resolve) => setTimeout(resolve, 5000));
    await runtime.ters.patrol();
  }
  // while (runtime.status.reflection.code === "RUNNING") {await new Promise((resolve) => runtime.abort.signal.addEventListener("abort", resolve, { once: true }) || setTimeout(resolve, 5000),);}
};

if (import.meta.main) {
  await runtime.ikiro;
  // console.log({ paladin, runtime });
  await runtime.perpetuate();
}

// if (import.meta.main) {console.log("import.meta.main await runtime.ikiro"); await runtime.ikiro;}
export default runtime;

// export const paladin = await (async () => {
//   const paladin = new Paladin();

//   await populate.env(paladin);
//   await populate.environment(paladin);
//   await populate.system(paladin);
//   await populate.vip(paladin);
//   await populate.modeselector(paladin);
//   await populate.statements(paladin);
//   await populate.questions(paladin);

//   return paladin;
// })();

// export default paladin;

// export const ikiro = (async () => {
//   await resolve.variant(paladin);
//   await resolve.service(paladin);
//   await resolve.runtimes(paladin);

//   await integrate.publish(paladin);
//   await integrate.secure(paladin);
//   // await integrate.mount(paladin);
//   await integrate.validate(paladin);
// })();
