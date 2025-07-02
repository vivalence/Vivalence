export default function daemonize({ server, abortController }) {
  // read process args. decide what to do on shutdown.
  // either daemonize and live forever.
  // or end process and return 0;

  return new Promise((resolve, reject) => {
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

  return promise;
}

// gated cell
// const lockFile = ".process.lock";

// async function ensureSingleProcess() {
//   try {
//     // Try to create lock file
//     const lock = await Deno.open(lockFile, {
//       write: true,
//       create: true,
//       createNew: true,
//     });

//     // Register cleanup on exit
//     Deno.addSignalListener("SIGINT", cleanup);
//     Deno.addSignalListener("SIGTERM", cleanup);

//     // Write PID to lock file
//     await lock.write(new TextEncoder().encode(Deno.pid.toString()));
//     lock.close();

//     return true;
//   } catch (error) {
//     if (error instanceof Deno.errors.AlreadyExists) {
//       try {
//         // Check if the process in lock file is still running
//         const pid = parseInt(new TextDecoder().decode(await Deno.readFile(lockFile)));
//         try {
//           // Try to get process info - will throw if process doesn't exist
//           Deno.kill(pid, 0);
//           console.error("Process already running with PID:", pid);
//           Deno.exit(1);
//         } catch {
//           // Process not running, clean up and retry
//           await cleanup();
//           return await ensureSingleProcess();
//         }
//       } catch (e) {
//         console.error("Error reading lock file:", e);
//         Deno.exit(1);
//       }
//     }
//     console.error("Error creating lock file:", error);
//     Deno.exit(1);
//   }
// }

// async function cleanup() {
//   try {
//     await Deno.remove(lockFile);
//   } catch {
//     // Lock file might already be gone
//   }
// }

// // Usage example:
// if (await ensureSingleProcess()) {
//   // Your main process code here
//   console.log("Process running with PID:", Deno.pid);

//   // Simulate some work
//   await new Promise(resolve => setTimeout(resolve, 10000));
// }
