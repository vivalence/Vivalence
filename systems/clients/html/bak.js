// new:
// old (to be folded away into shell tools)
import config from "@vivalence/config";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "@std/path";
import fs from "fs-extra";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let serverProcess;

function setupEnvironment() {
  Object.entries(process.env).forEach(([key, value]) => {
    if (typeof value === "string") {
      if (key.startsWith("PUBLIC_")) {
        console.log("env", `VITE_${key}`, value);
        process.env[`VITE_${key}`] = value;
      }
    }
  });
}

async function startServer() {
  try {
    try {
      await fs.access(join(__dirname, "node_modules"));
    } catch (err) {
      await new Promise((resolve, reject) => {
        const npmInstall = spawn("npm", ["install"], {
          stdio: "inherit",
          cwd: __dirname,
          env: process.env,
        });

        npmInstall.on("close", (code) => {
          code === 0
            ? resolve()
            : reject(new Error(`npm install failed with code ${code}`));
        });
      });
    }

    serverProcess = spawn("npm", ["run", "dev"], {
      stdio: "inherit",
      cwd: __dirname,
      shell: process.platform === "win32",
      env: process.env,
    });

    serverProcess.on("error", (err) => {
      console.error("Failed to start server:", err);
      process.exit(1);
    });

    return new Promise((resolve) => {
      serverProcess.on("close", (code) => {
        console.log("serverprocess close: code", code);
        resolve(code);
      });
    });
  } catch (error) {
    console.log("@web/mod.js [ERROR]", error);
    process.exit(1);
  }
}

function handleSignal(signal) {
  if (serverProcess) {
    console.log("KILL SIGTERM");
    serverProcess.kill("SIGTERM");
  }
  console.log("EXIT", signal);
  process.exit(0);
}

["SIGINT", "SIGTERM", "SIGQUIT"].forEach((signal) => {
  process.on(signal, handleSignal);
});

setupEnvironment();
startServer().catch(() => process.exit(1));

// import config from "@vivalence/config";
// import { spawn } from "node:child_process";
// import { fileURLToPath } from "node:url";
// import { dirname, join } from "@std/path";
// import fs from "fs-extra";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// // Handle cleanup for process termination
// let serverProcess;

// // Populate environment variables directly
// function setupEnvironment() {
//   console.log("Setting up environment variables directly...");

//   // Set all variables from config
//   Object.entries(config.env).forEach(([key, value]) => {
//     if (typeof value === "string") {
//       // Set the original variable
//       process.env[key] = value;

//       // For PUBLIC_ vars, also create VITE_ prefixed versions
//       // that Vite will expose to the client
//       if (key.startsWith("PUBLIC_")) {
//         process.env[`VITE_${key}`] = value;
//       }
//     }
//   });

//   console.log("Environment setup complete");
// }

// setupEnvironment();

// async function startServer() {
//   console.log("Starting Vivalence web client...");

//   try {
//     // Make sure node_modules exists and is up to date
//     console.log("Checking dependencies...");
//     try {
//       await fs.access(join(__dirname, "node_modules"));
//     } catch (err) {
//       console.log("Installing dependencies...");
//       await new Promise((resolve, reject) => {
//         const npmInstall = spawn("npm", ["install"], {
//           stdio: "inherit",
//           cwd: __dirname,
//           env: process.env,
//         });

//         npmInstall.on("close", (code) => {
//           if (code === 0) resolve();
//           else reject(new Error(`npm install failed with code ${code}`));
//         });
//       });
//     }

//     // Start dev server
//     console.log("Starting development server...");
//     serverProcess = spawn("npm", ["run", "dev"], {
//       stdio: "inherit",
//       cwd: __dirname,
//       shell: process.platform === "win32",
//       env: process.env,
//     });

//     // Handle server process events
//     serverProcess.on("error", (err) => {
//       console.error("Failed to start server:", err);
//       process.exit(1);
//     });

//     return new Promise((resolve) => {
//       serverProcess.on("close", (code) => {
//         console.log(`Server process exited with code ${code}`);
//         resolve(code);
//       });
//     });
//   } catch (error) {
//     console.error("Error running web client:", error);
//     process.exit(1);
//   }
// }

// // Handle termination signals
// function handleSignal(signal) {
//   console.log(`Received ${signal}. Shutting down...`);
//   if (serverProcess) {
//     serverProcess.kill("SIGTERM");
//   }
//   process.exit(0);
// }

// // Register signal handlers
// ["SIGINT", "SIGTERM", "SIGQUIT"].forEach((signal) => {
//   process.on(signal, handleSignal);
// });

// // Start the server
// startServer().catch((error) => {
//   console.error("Error starting server:", error);
//   process.exit(1);
// });
// // // @lj:
// // // this file executes to local deno.json
// // // its a bit of a hack.
// // // future headache.
// // import fs from "fs-extra";
// // import { dirname, join, fromFileUrl } from "$std/path/mod.ts";
// // import config from "@vivalence/config";

// // const currentModulePath = fromFileUrl(import.meta.url);
// // const dir = dirname(currentModulePath);
// // const args = Deno.args;
// // await fs.remove(join(dir, "node_modules"));

// // let process;
// // async function startProcess() {
// //   process = Deno.run({
// //     cmd: ["deno", "task", `-c`, `${dir}/deno.jsonc`, `dev`],
// //   });
// //   return await process.status();
// // }

// // function handleSignal(signal) {
// //   console.log(`Received ${signal}. Shutting down...`);
// //   if (process) {
// //     process.close();
// //   }
// //   Deno.exit(0);
// // }

// // for (const signal of ["SIGINT", "SIGTERM", "SIGQUIT"]) {
// //   Deno.addSignalListener(signal, handleSignal);
// // }

// // try {
// //   const status = await startProcess();
// //   console.log(`Process exited with status: ${status.code}`);
// // } catch (error) {
// //   // console.error("Error running process:", error);
// // } finally {
// //   for (const signal of ["SIGINT", "SIGTERM", "SIGQUIT"]) {
// //     Deno.removeSignalListener(signal, handleSignal);
// //   }
// // }
