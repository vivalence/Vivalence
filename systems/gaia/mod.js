import { Path } from "@vivalence/typology";
import paladin from "@vivalence/paladin";

import { Gaia } from "./typology.js";

const gaia = await (async () => {
  await paladin.ikiro;
  const gaia = new Gaia();

  await paladin.vip.mount(paladin.join.vip());
  await paladin.vip.mount(paladin.join.system("systems"));

  return gaia;
})();

gaia.ikiro = (async () => {})();

export default gaia;

// import paladin from "@vivalence/paladin/ikiro"; await paladin; // also nice.
// paladin.ticker("paladin.ikiro");

// import * as lifecycle from "./lifecycle/index.js";
// import * as runtime from "./runtime/index.js";

// export const gaia = new lifecycle.Gaia();

// for (const populate of Object.values(lifecycle.populate)) {
// }

// for (const rme of gaia.runtimes) {
//   for (const populate of Object.values(runtime.populate)) {
//     await populate(rme, gaia);
//   }

//   for (const resolve of Object.values(runtime.resolve)) {
//     await resolve(rme, gaia);
//   }
// }

// for (const resolve of Object.values(lifecycle.resolve)) {
//   await resolve(gaia);
// }

// for (const integrate of Object.values(lifecycle.integrate)) {
//   await integrate(gaia);
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
