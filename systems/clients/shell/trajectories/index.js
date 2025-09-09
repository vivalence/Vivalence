import { merge } from "@stdlib/utils";
import config from "@vivalence/config";
import registry from "@vivalence/registry";

import * as web from "@vivalence/web";
import * as daemon from "@vivalence/daemon";

export default async function (client) {
  if (config.daemon) {
    client.trajectory
      .branch(`/variant/daemon`)
      .use(async (ctx, next) => {
        ctx.daemon = config.daemon;
        ctx.daemon.manifest = daemon.manifest;
        await next();
      })
      .set(daemon.control);
  }
  if (config.clients?.web) {
    client.trajectory
      .branch(`/variant/clients/web`)
      .use(async (ctx, next) => {
        ctx.client = config.clients.web;
        ctx.client.manifest = web.manifest;
        await next();
      })
      .set(web.control);
  }
  // if (config.clients?.web) {
  //   // web.control;

  //   client.trajectory.branch(`/control/client/web`).use(async (ctx, next) => {
  //     ctx.client = {
  //       env,
  //       manifest,
  //       config,
  //       secret: {
  //         //
  //       },
  //     };
  //     await next();
  //   });
  // }

  // if (config.system.daemon) {
  //   await daemon.control(
  //     { config: config.system.daemon },
  //     client.trajectory.branch(`/control/system/daemon`),
  //   );
  // }
}

// client.trajectory .branch("system") .open("up", async (ctx) => {return { status: "up" };}) .open("test", async (ctx) => {const up = await ctx.call("/system/up"); return { up, output: "lorem" };});
// await services({
//   ...client,
//   trajectory: client.trajectory.branch("/services"),
// });
