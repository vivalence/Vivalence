console.log("Daemon starting...");
const start = performance.now();
import config from "@vivalence/config";
import supabase from "./lib/supabase/index.js";
import services from "./lib/services.js";

import runtimes from "./runtimes/runtimes.js";
import routes from "./runtimes/routes.js";
import install from "./runtimes/install.js";
import userland from "./runtimes/userland.js";

import server from "./server/server.js";
import serve from "./server/serve.js";

async function cleanupPorts() {
  const port = config.env.DAEMON_PORT;
  const p = Deno.run({ cmd: ["lsof", "-i", `:${port}`, "-t"], stdout: "piped", stderr: "piped" });
  const output = await p.output();
  const errors = await p.stderrOutput();
  p.close();
  if (errors.length > 0) {
    console.error(new TextDecoder().decode(errors));
    return;
  }
  const pids = new TextDecoder().decode(output).trim().split("\n").filter(Boolean);
  for (const pid of pids) {
    console.log(`Killing process ${pid} on port ${port}`);
    const kill = Deno.run({ cmd: ["kill", "-9", pid] });
    await kill.status();
    kill.close();
  }
}
function launch({ router, ...params }) {
  router.all("/status", async (ctx) => {
    console.log("DEMON /status");
    ctx.response.body = { message: "daemons run this place", status: "ok" };
  });

  console.log(`Daemon started in ${performance.now() - start}ms`);
  return { ...params, router };
}
function daemonize({ server, abortController }) {
  return new Promise((resolve) => {
    const shutdown = () => {
      console.log("Shutting down server...");
      abortController.abort();
      resolve();
    };

    Deno.addSignalListener("SIGINT", () => {
      console.log("Server interrupted");
      shutdown();
    });

    Deno.addSignalListener("SIGINT", () => {
      console.log("Received SIGINT. Initiating shutdown...");
      shutdown();
    });
  });
}
const tick = (name) => (params) => {
  // console.log(`[DAEMON PERF] from init to [${name}] in [${performance.now() - start}ms]`);
  return params;
};

async function dev(params) {
  const runtime = params.runtimes.values().next().value;
  // await runtime.strategies[].Module.install(runtime);
  return params;
}

await [
  cleanupPorts,
  supabase,
  services,
  server,
  runtimes,
  routes,
  serve,
  install,
  userland,
  launch,
  dev,
  daemonize,
].reduce((acc, fn) => acc.then(fn), Promise.resolve());

console.log("Daemon has shut down");
