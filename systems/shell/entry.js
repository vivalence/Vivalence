#!/usr/bin/env -S deno run --allow-env --allow-read --allow-write --allow-net --allow-run

// console.log("[viva shell invocation] with args:", Deno.args);
let repodir = Deno.args.shift();

if (process.env["VIVA_SYSTEM_DIR"]) {
  repodir = process.env["VIVA_SYSTEM_DIR"];
}

const run = Deno.run({
  cmd: [
    "deno",
    "task",
    "-q",
    "--config",
    repodir + "/deno.jsonc",
    `shell/do`,
    ...Deno.args,
  ],
});

// console.log("[viva shell disintegration] with status:", await run.status());

// } catch (error) {
//   console.error("@clients/shell [ERROR] in viva execution:");
//   console.error(error);
// }

// console.log("cli.js", import.meta.url);
// import { client } from "@vivalence/shell";
// import { client } from "./mod.js";
// console.log("cli.js", { client });

// try {
// const command = new Deno.Command(config.cmd[0], {
//   args: config.cmd.slice(1),
//   cwd: config.cwd || ".",
//   env: {
//     ...config.env,
//     VIVA_PROCESS_SLUG: manifest.slug,
//   },
//   stdout: config?.detached ? "piped" : "inherit",
//   stderr: config?.detached ? "piped" : "inherit",
// });
// const instance = command.spawn();
