import { is } from "@vivalence/shared";
import { Vector } from "@vivalence/vector";
import { gestalten } from "@vivalence/typology";
import config from "@vivalence/paladin";
import registry from "@vivalence/registry";

import * as html from "@vivalence/html";
import * as daemon from "@vivalence/daemon";

export default async function (client) {
  client.trajectory
    .branch(`/system`)
    .open("/config", (ctx) => console.log(JSON.stringify(config, null, 2)));
  // .open(healthcheck)

  if (config.daemon) {
    client.trajectory
      .branch(`/system/daemon`)
      .use(async (ctx, next) => {
        ctx.daemon = config.daemon;
        ctx.daemon.manifest = daemon.manifest;
        await next();
      })
      .set(daemon.control);
  }

  if (config.clients?.html) {
    client.trajectory
      .branch(`/system/clients/html`)
      .use(async (ctx, next) => {
        ctx.client = config.clients.html;
        ctx.client.manifest = html.manifest;
        await next();
      })
      .set(html.control);
  }

  for (const serviceconfig of config.services) {
    const prototype = await registry.load(serviceconfig.module);

    let control;
    if (gestalten.is.vector(prototype.control)) control = prototype.control;
    else control = new Vector();
    if (is.fn(prototype.control)) prototype.control(control);

    if (control.heir)
      client.trajectory
        .branch(`/system/services`)
        .branch(`/${serviceconfig.runtime}/${serviceconfig.slug}`)
        .use(async (ctx, next) => {
          ctx.service = serviceconfig;
          await next();
        })
        .set(control);
  }
}

// client.trajectory .branch("system") .open("up", async (ctx) => {return { status: "up" };}) .open("test", async (ctx) => {const up = await ctx.call("/system/up"); return { up, output: "lorem" };});
// await services({
//   ...client,
//   trajectory: client.trajectory.branch("/services"),
// });
