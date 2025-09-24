const start = performance.now();
const tick = () => Math.round(performance.now() - start);
const ticker = (name) => console.log(`[TICK] [${tick() / 1000}s] [${name}]`);
import config from "@vivalence/config";
import * as lifecycle from "./lifecycle/index.js";

export const daemon = new lifecycle.Daemon(config.daemon);
await daemon.registry.init(config.registry);
// checks

for (const populate of Object.values(lifecycle.populate)) {
  await populate(daemon);
}
// checks

for (const resolve of Object.values(lifecycle.resolve)) {
  await resolve(daemon);
}
// checks

for (const integrate of Object.values(lifecycle.integrate)) {
  await integrate(daemon);
}

ticker("integrated.server");
