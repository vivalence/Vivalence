console.clear();

const start = performance.now();
const tick = () => Math.round(performance.now() - start);
const ticker = (name) => console.log(`[TICK] [${tick() / 1000}s] [${name}]`);

import config from "@vivalence/config";
await config;

// import * as lifecycle from "./lifecycle/index.js";
// import * as runtime from "./runtime/index.js";

// export const daemon = new lifecycle.Daemon(config.daemon);

// await daemon.registry.init(config.registry);

// for (const populate of Object.values(lifecycle.populate)) {
//   await populate(daemon);
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

ticker("integrated.server");
