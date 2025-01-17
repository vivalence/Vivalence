// You've found the entry point. Ground zero. Welcome.

import config from "@vivalence/config";
import registry from "@vivalence/registry";

import { colors } from "@vivalence/interfaces-cli";

import boot from "./lib/boot.js";
import process from "./lib/process.js";
import locals from "./locals/index.js";
import commands from "./commands/index.js";
import runtimes from "./runtimes/index.js";

let viva = {
  services: config.services,
  input: Deno.args,
  process: null,
  registry: {},
  locals: {},
  runtimes: {},
  commands: null,
};

console.log(colors.rgb24(`Viva la Vivalence!`, 0x00fffb));
await (async (viva) =>
  await [
    process,
    registry.mount,
    locals,
    runtimes,
    boot,
    commands,
    // (v) => (console.log(colors.rgb24(`Viva el fin.`, 0x00fffb)), v),
    ({ process }) => process.doShutdown(0, {}),
  ].reduce((acc, fn) => acc.then(fn), Promise.resolve(viva)))(viva);
console.log(colors.rgb24(`Viva el fin.`, 0x00fffb));

// soon async function daemon(viva) {async function gate(viva) {// if commands.match is UNDER; end viva; // commandsrootmatch === true // if commands.match is OVER; pass to daemon; // commandsrootmatch === false} console.log("- the daemon catch it."); // run daemon, run llm chat service, pass input to service.}
