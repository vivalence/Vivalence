const start = performance.now();
const tick = () => Math.round(performance.now() - start);
const ticker = (name) => console.log(`[TICK] [${tick() / 1000}s] [${name}]`);

import paladin, { ikiro } from "@vivalence/paladin";

import * as lifecycle from "./lifecycle/index.js";
import * as runtime from "./runtime/index.js";

await ikiro;

export const daemon = new lifecycle.Daemon();

for (const populate of Object.values(lifecycle.populate)) {
  await populate(daemon);
}

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

ticker("integrated.server");
