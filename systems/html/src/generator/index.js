import { Buffer } from "@vivalence/drapes";
import { is, fromm } from "@vivalence/typology";
import { Vector } from "@vivalence/vector";
import { remotes } from "$client";

export const generator = new Vector();

generator
  .branch("/viva")
  // .open("/faafo", async (ctx) => {ctx.buffer.push(new BufferMode(
  //       {url: "http://localhost:1729/attached/daemon/eng2lat/mode/agent/eva/bundle/view/viva.svelte.js",},
  //       { product: { agent: "ligma" } },),);})
  .use(async (ctx, next) => {
    const timeout = 10000;
    const start = Date.now();

    while (!remotes.daemon.has) {
      if (Date.now() - start > timeout) {
        throw new Error("System boot timeout - no daemon available");
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    await next();
  })
  .branch("/daemon/:daemon")
  .use(async (ctx, next) => {
    ctx.daemon = await remotes.daemon //
      .findOne((r) => r.manifest.slug === ctx.params.daemon);
    await next();
  })
  .branch("/mode/:type/:slug")
  .use(async (ctx, next) => {
    const { type, slug } = ctx.params;
    ctx.mode = await ctx.daemon.entities.mode //
      .findOne((m) => m.manifest.type === type && m.manifest.slug === slug);
    await next();
  })
  .open("/(.*)", async (ctx) => {
    if (ctx.mode.implements("GENERATOR")) {
      const generation = await ctx.mode.call(fromm.params(ctx.params).path);
      for (const product of generation) {
        ctx.buffer.push(new Buffer(ctx.mode.view, { ...ctx, product }));
      }
    } else {
      ctx.buffer.push(new Buffer(ctx.mode.view, { ...ctx }));
    }
  });

//
// .use(async (ctx, next) => {
//   if (ctx.query.intent) {
//     const intent = await ctx.daemon.call("/entities/intent/findOne", {
//       where: { id: ctx.query.intent },
//     });
//     if (!intent) throw new Error("Intent not found");
//     ctx.intent = intent;
//   }
//   await next();
// })

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

// async function makeGameBuffer(instruction, hook) {const gameContext = {...ctx, game: await ctx.mode.game({ slug: instruction.bundle.game.slug }),}; const hooks = []; if (hook) hooks.push(hook); const mode = new BufferMode({ bundle: instruction.bundle }, { ctx: gameContext, instruction }, hooks,); buffer.push(mode);}
// ctx. pushGame= makeGameBuffer
// if (!traits[stateless]) mode.call(`/generator`)
