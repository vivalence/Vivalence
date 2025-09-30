import { is } from "@vivalence/shared";
import { merge } from "@stdlib/utils";

const children = new Set(); // [{manifest,config,instance}]

export default async function boot(client) {
  client.process = { spawn, shutdown };

  ["SIGINT", "SIGTERM", "SIGQUIT"].forEach((sig) =>
    Deno.addSignalListener(sig, () => shutdown(sig)),
  );

  return client;
}

export const spawn = (manifest, config) => {
  const cmd = is.string(config.cmd) ? config.cmd.split(" ") : config.cmd;
  const command = new Deno.Command(cmd[0], {
    args: cmd.slice(1),
    cwd: config.cwd || manifest.cwd,
    env: {
      ...config.env,
      VIVA_PROCESS_SLUG: manifest.slug,
      VIVA_PROCESS_TYPE: manifest.type,
    },
    stdout: config?.detached ? "piped" : "inherit",
    stderr: config?.detached ? "piped" : "inherit",
  });
  const instance = command.spawn();

  const pce = {
    // process child entity
    slug: manifest.slug,
    manifest,
    instance,
    config,
  };

  children.add(pce);
  instance.status.then(() => children.delete(pce));

  return pce;
};

const kill = async (child, signal = "SIGTERM") => {
  try {
    child.instance.kill(signal);
    // some timeout based on child.manifest.lifecycle.shutdown triggering hardkill
    await child.instance.status;
  } catch {
    child.instance.kill("SIGKILL");
  }
};

export const purge = async () => {
  await Promise.all([...children].map((child) => kill(child)));
};

export const shutdown = async (signal) => {
  console.log(`Shutdown ${signal}`);
  await purge();
  Deno.exit(0);
};

// Deno.exit(0);
// export default async function captureProcess(client) {
//   function doShutdown(signal, opts = {}) {
//     console.log("doShutdown", signal, opts);

//     if (signal) {
//       console.log(`Viva el fin. ${signal.toString()}`);
//     }
//     Deno.exit(0);
//   }

//   client.process = { doShutdown };

//   for (const signal of ["SIGINT", "SIGTERM", "SIGQUIT"]) {
//     Deno.addSignalListener(signal, () => doShutdown(signal));
//   }

//   return client;
// }
// // let childProcess: Deno.ChildProcess | null = null;

// // async function gracefulShutdown(signal: string) {
// //   console.log(`Received ${signal}, shutting down gracefully...`);

// //   if (childProcess) {
// //     try {
// //       childProcess.kill("SIGTERM");
// //       await childProcess.status;
// //     } catch (error) {
// //       console.error("Error terminating child process:", error);
// //       childProcess.kill("SIGKILL");
// //     }
// //   }

// //   Deno.exit(0);
// // }

// // Deno.addSignalListener("SIGTERM", () => gracefulShutdown("SIGTERM"));
// // Deno.addSignalListener("SIGINT", () => gracefulShutdown("SIGINT"));

// // async function main() {
// //   console.log("Main process starting...");

// //   const command = new Deno.Command("sleep", {
// //     args: ["30"],
// //   });

// //   childProcess = command.spawn();

// //   try {
// //     const status = await childProcess.status;
// //     console.log("Child process exited with code:", status.code);
// //   } catch (error) {
// //     console.error("Child process error:", error);
// //   } finally {
// //     childProcess = null;
// //   }
// // }

// // if (import.meta.main) {
// //   await main();
// // }
