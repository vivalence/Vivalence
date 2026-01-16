import { Signal, fromm } from "@vivalence/typology"; // Context
import { Vector, controller, Context, NotFound } from "@vivalence/vector";

import { Buffer } from "@vivalence/html/typology";
import { dataspace } from "$client";

export const perspective = new Vector();

perspective
  // .open("/viva", () => [new Buffer({}, {})])
  .branch("/viva")
  // .open("/faafo", async (ctx) => {ctx.buffer.push(new BufferMode(
  //       {url: "http://localhost:1729/attached/daemon/eng2lat/mode/agent/eva/bundle/view/viva.svelte.js",},
  //       { product: { agent: "ligma" } },),);})
  // .use(async (ctx, next) => {const timeout = 10000; const start = Date.now(); while (!remotes.daemon.has) {if (Date.now() - start > timeout) {throw new Error("System boot timeout - no daemon available");} await new Promise((resolve) => setTimeout(resolve, 100));} await next();})
  .branch("/daemon/:daemon")
  .branch("/mode/:type/:slug")
  .use(async (ctx, next) => {
    ctx.mode = await dataspace.mode.findOne((m) => {
      return (
        m.daemon.manifest.slug === ctx.params.daemon &&
        m.type === ctx.params.type &&
        m.slug === ctx.params.slug
      );
    });
    ctx.daemon = ctx.mode.daemon;

    await next();
  })
  .open("/(.*)", async (ctx) => {
    return [new Buffer(ctx.mode.view, { ...ctx })];
    // console.log("fromm.params(ctx.params).path", fromm.params(ctx.params).path);
    // ctx.stall.push(new Buffer(ctx.mode.view, { ...ctx }));

    // if (ctx.mode.implements("casting")) {
    //   const generation = await ctx.mode.call(fromm.params(ctx.params).path);

    //   for (const product of generation) {
    //     ctx.buffer.push(new Buffer(ctx.mode.view, { ...ctx, product }));
    //   }
    // }
  });
