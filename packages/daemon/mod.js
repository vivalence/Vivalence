console.log("Daemon starting...");
const start = performance.now();

import { cleanupPorts, launch, daemonize, tick } from "./kernel/index.js";
import dev from "./kernel/dev.js";
import userland from "./kernel/userland.js";
import modules from "./modules/index.js";
import supabase from "./lib/supabase/index.js";

import build from "./runtimes/build.js";
import routes from "./runtimes/routes.js";
import install from "./runtimes/install.js";

import server from "./server/server.js";
import serve from "./server/serve.js";

const ticker = tick(start);

await [
  cleanupPorts,
  supabase,
  server,
  build,
  routes,
  serve,
  install,
  dev,
  userland,
  modules,
  launch,
  ticker("up"),
  daemonize,
].reduce((acc, fn) => acc.then(fn), Promise.resolve());

console.log("Daemon has shut down");
