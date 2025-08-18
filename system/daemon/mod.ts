const start = performance.now();
const tick = () => Math.round(performance.now() - start);
const ticker = (name) => console.log(`[TICK] [${tick() / 1000}s] [${name}]`);

import config from "@vivalence/config";

import * as preflight from "./lifecycle/preflight.js";
import * as populate from "./lifecycle/populate.js";
import * as resolve from "./lifecycle/resolve.js";
import * as integrate from "./lifecycle/integrate.js";

import { Daemon } from "@vivalence/typology/prototypes";

const daemon = new Daemon(config.system.daemon);
await daemon.registry.init(config.registry);
await preflight.cleanup(daemon);
// await preflight.checks(daemon);
await populate.services(daemon);
await populate.runtimes(daemon);
await resolve.runtimes(daemon);
await integrate.runtimes(daemon);
await integrate.attach(daemon);
await integrate.serve(daemon);

// await integrate.checks(daemon);
// await integrate.install(daemon);

ticker("integrated.server");
