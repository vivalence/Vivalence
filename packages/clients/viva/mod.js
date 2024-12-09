// You've found the entry point. Ground zero. Welcome.

import config from "@vivalence/config";
import registry from "@vivalence/registry";
import { services as serviceHelpers } from "@vivalence/shared";
import { colors } from "@vivalence/interfaces-cli";

import locals from "./locals/index.js";
import commands from "./commands/index.js";

let viva = {
  input: Deno.args,
  process: null,
  registry: {},
  locals: {},
  services: {},
  commands: null,
  // soon {daemon: null, runtimes: null}
};

async function process(viva) {
  function doShutdown(signal) {
    signal && config.isDev && console.warn(`Received system shutdown signal: "${signal}"`);
    console.log("Orderly doShutdown");
    console.log(colors.rgb24(`Viva el fin. ${signal.toString()}`, 0x00fffb));
    Deno.exit(0);
  }

  viva.process = { doShutdown: doShutdown };

  for (const signal of ["SIGINT", "SIGTERM", "SIGQUIT"]) {
    Deno.addSignalListener(signal, viva.process.doShutdown);
  }

  return viva;
}

console.log(colors.rgb24(`Viva la Vivalence!`, 0x00fffb));
await (async (viva) =>
  await [
    process,
    registry.mount,
    serviceHelpers.mount,
    locals.env,
    locals.docker,
    commands,
    (v) => v.process.doShutdown(0),
  ].reduce((acc, fn) => acc.then(fn), Promise.resolve(viva)))(viva);
console.log(colors.rgb24(`Viva el fin.`, 0x00fffb));

// soon
async function daemon(viva) {
  // SOON
  async function gate(viva) {
    // if commands.match is UNDER; end viva; // commandsrootmatch === true
    // if commands.match is OVER; pass to daemon; // commandsrootmatch === false
  }
  console.log("- the daemon catch it.");
  // run daemon, run llm chat service, pass input to service.
}
