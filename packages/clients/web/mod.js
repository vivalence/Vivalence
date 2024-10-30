import config from "@vivalence/config";
import { dirname, fromFileUrl, basename, join } from "$std/path/mod.ts";

const currentModulePath = fromFileUrl(import.meta.url);
const dir = dirname(currentModulePath);
const args = Deno.args;

let process;
async function startProcess() {
  process = Deno.run({
    cmd: ["deno", "task", `-c`, `${dir}/deno.jsonc`, `web:dev`],
  });
  return await process.status();
}

function handleSignal(signal) {
  console.log(`Received ${signal}. Shutting down...`);
  if (process) {
    process.close();
  }
  Deno.exit(0);
}

for (const signal of ["SIGINT", "SIGTERM", "SIGQUIT"]) {
  Deno.addSignalListener(signal, handleSignal);
}

try {
  const status = await startProcess();
  console.log(`Process exited with status: ${status.code}`);
} catch (error) {
  // console.error("Error running process:", error);
} finally {
  for (const signal of ["SIGINT", "SIGTERM", "SIGQUIT"]) {
    Deno.removeSignalListener(signal, handleSignal);
  }
}
