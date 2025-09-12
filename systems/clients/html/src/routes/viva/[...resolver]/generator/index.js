import { BufferMode, BufferState } from "@vivalence/interface";
import { Vector, signature } from "@vivalence/vector";

import { identity, isIdentified, runtimes } from "@client/app";

if (!isIdentified()) {
  throw new Error("Unauthorized");
}

export const generator = await (async () => {
  const generator = new Vector(signature).use(async (ctx, next) => {
    ctx.identity = identity;
    await next();
  });

  generator
    .branch("/viva")
    .branch("/runtime/:runtime")
    .use(async (ctx, next) => {
      for (const runtime of runtimes.values()) {
        await runtime.handshake();
        if (runtime.manifest.slug === ctx.params.runtime) ctx.runtime = runtime;
      }
      if (!ctx.runtime) throw new Error("Runtime not found");
      await next();
    })
    .use(async (ctx, next) => {
      if (ctx.query.intent) {
        const intent = await ctx.runtime //
          .call("/entities/intent/findOne", {
            where: { id: ctx.query.intent },
          });

        if (!intent) throw new Error("Intent not found");
        ctx.intent = intent;
      }
      await next();
    })

    .branch("/:type/:slug")
    .use(async (ctx, next) => {
      const { type, slug } = ctx.params;
      console.log({ type, slug });
      const { view, manifest } = await ctx.runtime //
        .call(`/modules/${type}/findOne`, { where: { slug } });
      const call = ctx.runtime.call.branch(`/module/${type}/${slug}`);
      ctx.module = { view, manifest, call };
      console.log({ view, manifest, call });
      //   if manifest.traits.includes('SESSIONED') module.session = {init,feed}
      await next();
    })

    // .use(async (ctx, next) => {
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

    .open("/(.*)", async (ctx) => {
      console.log("************************************************8");
      // if(ctx.params[0]) module.call(`/generator/R{ctx.parms[0]}`)
      // if (!traits[stateless]) module.call(`/generator`)
      // else return [new BufferMode(ctx.module.view, {session,view,module,runtime})];

      // console.log(JSON.stringify(ctx, null, 2));
      // async function makeGameBuffer(instruction, hook) {const gameContext = {...ctx, game: await ctx.module.game({ slug: instruction.bundle.game.slug }),}; const hooks = []; if (hook) hooks.push(hook); const mode = new BufferMode({ bundle: instruction.bundle }, { ctx: gameContext, instruction }, hooks,); buffer.push(mode);}
      // ctx. pushGame= makeGameBuffer
      // call strategy.???
      // buffer.onNext((previous, next, promise) => ctx.runtime(`/feed/remove`, next));
      return [];
    });

  return generator;
})();

// let session = $state(event.url.params.session);
// let intent = $state(event.url.params.intent);

const modules = {
  tactic: async ({ slug }) => {
    const tactic = await ctx.runtime //
      .call("/modules/tactic/findOne", { where: { slug } });

    tactic.call = ctx.call.wrap(
      `/aperture/v1/runtime/${ctx.runtime.slug}/tactic/${slug}`,
    );
    // `/aperture/v1/runtime/${event.params.runtime}/strategy/${slug}`,

    return tactic;
  },
  strategy: async ({ slug }) => {
    const strategy = await ctx.runtime //
      .call("/modules/strategy/findOne", { where: { slug } });

    strategy.call = ctx.call.wrap(
      `/aperture/v1/runtime/${ctx.runtime.slug}/strategy/${slug}`,
    );
    // `/aperture/v1/runtime/${event.params.runtime}/strategy/${slug}`,

    return strategy;
  },
  game: async ({ slug }) => {
    const game = await ctx.runtime //
      .call("/modules/game/findOne", { where: { slug } });

    // game.call = ctx.runtime.call.wrap(`/game/${slug}`);
    game.call = ctx.call.wrap(
      `/aperture/v1/runtime/${ctx.runtime.slug}/game/${slug}`,
    );

    return game;
  },
};

// import strategy from "./learning/strategy.js";
