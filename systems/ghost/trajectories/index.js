import { is } from "@vivalence/shared";
import { Vector } from "@vivalence/vector";
import { gestalten } from "@vivalence/typology";
import paladin from "@vivalence/paladin";

export default async function (ghost) {
  ghost.invocation
    // .open(`/ikiro`, async (ctx) => await ctx.call("/variant/up"))
    .branch(`/variant`)
    .use(async (ctx, next) => {
      await next();
    })
    .open(`[.*]`, async (ctx) => {
      // const gaia = await import( "@vivalence/gaia");
      // const process = (async () => await gaia.ikiro)();
      // map processes and clients * up
      // paladin.variant
      //
      // i need a control vector compiler here.
      // const controlshard = shards.control.fromm.module(module)
      // which is. a vector, to be applied at the right place onto some other vector.
      // ie.: ghost.call('/variant/circuit/up') or $ viva variant circuit up
      // and expecting the invocation to result in the expected effect. valence achived.
    });

  // client.trajectory
  //   .branch(`/system`)
  //   .open("/config", (ctx) => console.log(JSON.stringify(config, null, 2)));
  // // .open(healthcheck)

  // if (config.gaia) {
  //   client.trajectory
  //     .branch(`/system/gaia`)
  //     .use(async (ctx, next) => {
  //       ctx.gaia = config.gaia;
  //       ctx.gaia.manifest = gaia.manifest;
  //       await next();
  //     })
  //     .set(gaia.control);
  // }

  // if (config.clients?.html) {
  //   client.trajectory
  //     .branch(`/system/clients/html`)
  //     .use(async (ctx, next) => {
  //       ctx.client = config.clients.html;
  //       ctx.client.manifest = html.manifest;
  //       await next();
  //     })
  //     .set(html.control);
  // }

  // for (const serviceconfig of config.services) {
  //   const prototype = await registry.load(serviceconfig.module);

  //   let control;
  //   if (gestalten.is.vector(prototype.control)) control = prototype.control;
  //   else control = new Vector();
  //   if (is.fn(prototype.control)) prototype.control(control);

  //   if (control.heir)
  //     client.trajectory
  //       .branch(`/system/services`)
  //       .branch(`/${serviceconfig.runtime}/${serviceconfig.slug}`)
  //       .use(async (ctx, next) => {
  //         ctx.service = serviceconfig;
  //         await next();
  //       })
  //       .set(control);
  // }
}

// client.trajectory .branch("system") .open("up", async (ctx) => {return { status: "up" };}) .open("test", async (ctx) => {const up = await ctx.call("/system/up"); return { up, output: "lorem" };});
// await services({
//   ...client,
//   trajectory: client.trajectory.branch("/services"),
// });
