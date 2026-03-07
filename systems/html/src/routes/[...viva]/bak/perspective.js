import { is, Signal, Blacklist, fromm } from "@vivalence/typology"; // Context
import { Vector, controller, Context, NotFound } from "@vivalence/vector";
import { get } from "svelte/store";

import { page } from "$app/stores";
import { replaceState } from "$app/navigation";
import { dataspace } from "$client";
import { env } from "$env/dynamic/public";

export const perspective = new Vector();

perspective
  .open("/viva", async (ctx) => {
    // get defaults from config.
    // ctx.buffer.$perspective.set(env["PUBLIC_VIVA_CLIENT_HTML_DEFAULTS_PERSPECTIVE"]);
    // ctx.buffer.$phase.set(env["PUBLIC_VIVA_CLIENT_HTML_DEFAULTS_PHASE"]);
  })
  .branch("/viva")
  .use(async (ctx, next) => {
    ctx.buffer.daemon = await dataspace.daemon.findOne({ slug: ctx.params.daemon });
    await next();
  })

  .use(async (ctx, next) => {
    ctx.buffer.mode = await daemon.entities.mode.findOne({
      type: ctx.params.type,
      slug: ctx.params.mode,
      daemon: { slug: ctx.params.daemon },
    });

    // ? anything to be done with traits, specifically languaged???
    await next();
  })
  .use(async (ctx, next) => {
    const sessionId = get(page).url.searchParams.get("session");

    if (sessionId) {
      ctx.buffer.session = await ctx.buffer.daemon.entities.session.findOne({ id: sessionId });
      // ctx.buffer.session = await ctx.buffer.daemon.findOne({ id: sessionId });
    } else {
      ctx.buffer.session = await ctx.buffer.daemon.entities.session.create({ id: sessionId });
      // ctx.buffer.session = await ctx.buffer.daemon.create({ id: sessionId });
      // ctx.buffer.session = await ctx.buffer.daemon.connection //
      //   .call("/userspace/entities/session/create");

      const url = new URL(get(page).url);
      url.searchParams.set("session", ctx.buffer.session.id);
      replaceState(url, {});
    }

    await next();
  })

  .branch("/daemon/:daemon")
  .open("/mode/:type/:mode", async (ctx) => {
    //
  })
  .open("/mode/:type/:mode/valence/:valence", async (ctx) => {
    ctx.buffer.valence = await daemon.entities.valence.findOne({
      slug: ctx.params.valence,
      mode: { id: ctx.buffer.mode.id },
    });

    if (!ctx.buffer.valence) throw new Error("[dataspace] unknown valence");
  });

// .use(async (ctx, next) => {
//   const products = ctx.stall.buffers.map((buffer) => buffer.context.product?.id).filter(Boolean);
//   ctx.blacklist = new Blacklist({ products });
//   await next();
// })
// if (is.fn(ctx.buffer.valence.produce)) {
//   const products = await ctx.buffer.valence.produce({
//     scope: { intent: ctx.buffer.intent.id },
//     // blacklist: ctx.blacklist,
//   });
//   return products .map((product) => new Buffer(product.mode.view, { ...ctx, product }));
//   // should be State()
// } else {
//   return [new Buffer(ctx.buffer.mode.view, { ...ctx })];
//   // should be State()
// }
