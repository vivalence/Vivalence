export * from "./prototype.js";
export * as lifecycle from "./lifecycle/index.js";

import { Path } from "@vivalence/typology";
import paladin from "@vivalence/paladin";

import { Daemon } from "./prototype.js";

const daemon = await (async () => {
  await paladin.ikiro;
  const daemon = new Daemon();

  await paladin.vip.mount(paladin.join.vip());
  await paladin.vip.mount(paladin.join.system("systems"));

  return daemon;
})();

daemon.ikiro = (async () => {})();

export default daemon;

// import paladin from "@vivalence/paladin/ikiro"; await paladin; // also nice.
// paladin.ticker("paladin.ikiro");

// import * as lifecycle from "./lifecycle/index.js";
// import * as runtime from "./runtime/index.js";

// export const daemon = new lifecycle.Daemon();

// for (const populate of Object.values(lifecycle.populate)) {
// }

// for (const rme of daemon.runtimes) {
//   for (const populate of Object.values(runtime.populate)) {
//     await populate(rme, daemon);
//   }

//   for (const resolve of Object.values(runtime.resolve)) {
//     await resolve(rme, daemon);
//   }
// }

// for (const resolve of Object.values(lifecycle.resolve)) {
//   await resolve(daemon);
// }

// for (const integrate of Object.values(lifecycle.integrate)) {
//   await integrate(daemon);
// }

// export * from "./prototype.js";
// export * from "./lifecycle/index.js";

// import { Paladin } from "./prototype.js";
// import { populate, resolve, integrate } from "./lifecycle/index.js";

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

// import paladin from "@vivalence/paladin/ikiro"; await paladin; // also nice.
