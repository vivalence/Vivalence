// You've found the entry point. Welcome.

import config from "@vivalence/config";
import registry from "@vivalence/registry";
import { colors } from "@vivalence/interfaces-cli";

import locals from "./locals/index.js";
import tree from "./tree/index.js";

console.log(colors.rgb24(`Viva la Vivalence!`, 0x00fffb));

let viva = {
  input: Deno.args,
  process: null,
  locals: {},
  tree: null,

  // soon // services: null, // daemon: null, // runtimes: null,
};

async function process(viva) {
  function doShutdown(signal) {
    signal && config.isDev && console.warn(`Received system shutdown signal: "${signal}"`);
    console.log(colors.rgb24(`Viva el fin. ${signal.toString()}`, 0x00fffb));
    Deno.exit(0);
  }

  viva.process = { doShutdown: doShutdown };

  for (const signal of ["SIGINT", "SIGTERM", "SIGQUIT"]) {
    Deno.addSignalListener(signal, viva.process.doShutdown);
  }

  return viva;
}

await (async (viva) =>
  await [process, ...locals, tree, (v) => v.process.doShutdown(0)].reduce(
    (acc, fn) => acc.then(fn),
    Promise.resolve(viva),
  ))(viva);

// soon
async function daemon(viva) {
  // SOON
  async function gate(viva) {
    // if tree.match is UNDER; end viva; // treerootmatch === true
    // if tree.match is OVER; pass to daemon; // treerootmatch === false
  }
  console.log("- the daemon catch it.");
  // run daemon, run llm chat service, pass input to service.
}
