import { Trajectory } from "@vivalence/shared";
import { AxAI } from "@ax-llm/ax";

import { createDiscoveryAgent } from "./discovery.js";
import test from "./test2.js";

// import { Intent, IntentStatusEnum } from "../lib/intent.js";

export default async function (daemon) {
  daemon.aperture
    .branch("/aperture/v1/daemon/agents")
    .use(async (ctx, next) => {
      ctx.agents = { discovery: await createDiscoveryAgent(daemon) };
      return await next();
    })
    .open("/discovery", async (input, ctx) => {
      // let intent;
      // if (input.intent.status) {
      //   intent = Intent.fromStorage(input.intent);
      // } else {
      //   intent = new Intent(input.intent);
      // }
      // return await ctx.agents.discovery(input.intent, input.signal);
    });

  return daemon;
}
