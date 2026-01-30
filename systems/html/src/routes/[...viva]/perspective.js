import { get } from "svelte/store";
import { Signal, fromm } from "@vivalence/typology"; // Context
import { Vector, controller, Context, NotFound } from "@vivalence/vector";
import { Buffer } from "@vivalence/html/typology";

import { replaceState, pushState } from "$app/navigation";
import { page } from "$app/stores";
import { dataspace } from "$client";

export const perspective = new Vector();

perspective
  .branch("/viva")
  .branch("/daemon/:daemon")
  .use(async (ctx, next) => {
    ctx.daemon = await dataspace.daemon //
      .findOne((d) => d.manifest.slug === ctx.params.daemon);
    await next();
  })
  .branch("/mode/:type/:mode")
  .use(async (ctx, next) => {
    ctx.mode = await dataspace.mode.findOne((m) => {
      return (
        m.daemon.manifest.slug === ctx.params.daemon &&
        m.type === ctx.params.type &&
        m.slug === ctx.params.mode
      );
    });

    // await next();}) .use(async (ctx, next) => {

    ctx.mode.connection.use(async (cctx, next) => {
      // const url = get(page).url; console.log("MODE CONNECTION - inject intent", {page: get(page), cctx, url,});
      await next();
    });
    await next();
  })
  .use(async (ctx, next) => {
    const intentId = get(page).url.searchParams.get("intent");
    if (intentId) {
      ctx.intent = await ctx.daemon.connection.call(
        "/userspace/entities/intent/findOne", //
        { where: { id: intentId } },
      );
    } else {
      ctx.intent = await ctx.daemon.connection //
        .call("/userspace/entities/intent/create");

      const url = new URL(get(page).url);
      url.searchParams.set("intent", ctx.intent.id);
      replaceState(url, {});
    }

    await next();
  })
  .use(async (ctx, next) => {
    ctx.valence = await dataspace.valence //
      .findOne(({ slug }) => ctx.params.valence === slug);

    if (!ctx.valence) console.error("dataspace missing valence");
    // if (!ctx.valence) ctx.valence = await ctx.daemon.connection.call("/entities/valence/findOne", { where: { slug: valence } },);
    if (!ctx.valence) throw new Error("unknown valence");

    await next();
  })
  .open("/valence/:valence", async (ctx) => {
    if (ctx.valence.implements("GENERATIVE")) {
      return (
        await ctx.valence.generate({
          scope: {
            intent: { id: ctx.intent.id },
          },
        })
      ).map(
        (product) => new Buffer(product.producer.view, { ...ctx, product }),
      );
    } else {
      return [new Buffer(ctx.mode.view, { ...ctx })];
    }
  });

// .use(async (ctx, next) => {
//   if manifest.traits.includes('SESSIONED') mode.session = {init,feed}
//   if ctx.mode.manifest.traits.includes('SESSIONED')
//     if (!ctx.query.session) ctx.mode.call('/session/init')

//   // console.log("ctx.state.session ", ctx.state.session);
//   if (ctx.query.session) {
//     const intent = await ctx.daemon.call("/entities/session/findOne", {
//       where: { id: ctx.query.session },
//     });
//     ctx.session = session;
//   } else if (!ctx.session) {
//     // ctx.state.session = await ctx.strategy.call("/session/init");
//   }
//   await next();
// })
