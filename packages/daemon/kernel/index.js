import config from "@vivalence/config";

import dev from "./dev.js";

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

const tick = (start) => (name) => (params) => {
  console.log(`[DAEMON PERF] from init to [${name}] in [${performance.now() - start}ms]`);
  return params;
};

export { cleanupPorts, launch, daemonize, tick, dev };
