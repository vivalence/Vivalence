import { BufferMode, BufferState } from "@vivalence/surface";
import { path } from "@vivalence/typology";
import { Vector } from "@vivalence/vector";
import { is } from "@vivalence/shared";

import client from "@client/app";
import { remotes } from "@client/app";

export const generator = await (async () => {
  const generator = new Vector(); //

  generator
    .branch("/viva")
    // .open("/faafo", async (ctx) => {ctx.buffer.push(new BufferMode(
    //       {url: "http://localhost:1729/attached/runtime/eng2lat/module/agent/eva/bundle/view/viva.svelte.js",},
    //       { product: { agent: "ligma" } },),);})
    .use(async (ctx, next) => {
      const timeout = 10000;
      const start = Date.now();

      while (!remotes.runtime.has) {
        if (Date.now() - start > timeout) {
          throw new Error("System boot timeout - no runtime available");
        }
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      await next();
    })
    .branch("/runtime/:runtime")
    .use(async (ctx, next) => {
      ctx.runtime = await remotes.runtime ///////
        .findOne((r) => r.manifest.slug === ctx.params.runtime);
      await next();
    })
    .branch("/module/:type/:slug")
    .use(async (ctx, next) => {
      const { type, slug } = ctx.params;
      ctx.module = await ctx.runtime.entities.module //
        .findOne((m) => m.manifest.type === type && m.manifest.slug === slug);
      await next();
    })
    .open("/(.*)", async (ctx) => {
      if (ctx.module.implements("GENERATOR")) {
        const generation = await ctx.module.call(path.fromParams(ctx.params));
        for (const product of generation) {
          ctx.buffer.push(new BufferMode(ctx.module.view, { ...ctx, product }));
        }
      } else {
        ctx.buffer.push(new BufferMode(ctx.module.view, { ...ctx }));
      }
    });

  return generator;
})();
//
// .use(async (ctx, next) => {
//   if (ctx.query.intent) {
//     const intent = await ctx.runtime.call("/entities/intent/findOne", {
//       where: { id: ctx.query.intent },
//     });
//     if (!intent) throw new Error("Intent not found");
//     ctx.intent = intent;
//   }
//   await next();
// })

// .use(async (ctx, next) => {
//   if manifest.traits.includes('SESSIONED') module.session = {init,feed}
//   if ctx.module.manifest.traits.includes('SESSIONED')
//     if (!ctx.query.session) ctx.module.call('/session/init')

//   // console.log("ctx.state.session ", ctx.state.session);
//   if (ctx.query.session) {
//     const intent = await ctx.runtime.call("/entities/session/findOne", {
//       where: { id: ctx.query.session },
//     });
//     ctx.session = session;
//   } else if (!ctx.session) {
//     // ctx.state.session = await ctx.strategy.call("/session/init");
//   }
//   await next();
// })

// async function makeGameBuffer(instruction, hook) {const gameContext = {...ctx, game: await ctx.module.game({ slug: instruction.bundle.game.slug }),}; const hooks = []; if (hook) hooks.push(hook); const mode = new BufferMode({ bundle: instruction.bundle }, { ctx: gameContext, instruction }, hooks,); buffer.push(mode);}
// ctx. pushGame= makeGameBuffer
// if (!traits[stateless]) module.call(`/generator`)
